import { useState, useRef, useCallback, useEffect } from 'react';
import type { PlanItem, PlanSection } from '@/services/plans';
import type { SessionItemInput } from '@/services/sessions';
import {
  useStartSession,
  useEndSession,
  useSaveSessionItems,
} from '@/services/sessions';

export interface CustomTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  announceEnabled: boolean;
  announceText: string;
}

export interface DefaultTimerSettings {
  announceNextItem: boolean;
  autoStartNextItem: boolean;
}

export interface SessionSummaryData {
  sessionId: string;
  durationSeconds: number;
  name: string | null;
  notes: string | null;
  items: SessionSummaryItem[];
  totalItems: number;
  completedItems: number;
  avgBpm: number | null;
}

export interface SessionSummaryItem {
  name: string;
  section?: string;
  durationSeconds: number;
  targetDurationSeconds?: number;
  bpm?: number;
  status: 'done' | 'partial' | 'none';
}

export interface PracticeSessionState {
  activeItem: PlanItem | null;
  remainingSeconds: number;
  isTimerRunning: boolean;
  nextItemName: string | null;
  customTimers: CustomTimer[];
  defaultTimerSettings: DefaultTimerSettings;
  selectedTimerId: string | null; // null = default timer
  sessionId: string | null;
  sessionStartedAt: Date | null;
  isInSession: boolean;
  pendingActiveItemId: string | null;
}

export interface PracticeSessionActions {
  startItem: (item: PlanItem, allItems: PlanItem[], sections?: PlanSection[], options?: { announce?: boolean }) => void;
  stopItem: () => void;
  clearSession: () => void;
  toggleTimer: () => void;
  addCustomTimer: () => void;
  removeCustomTimer: (id: string) => void;
  updateCustomTimer: (id: string, patch: Partial<Pick<CustomTimer, 'label' | 'totalSeconds' | 'announceEnabled' | 'announceText'>>) => void;
  selectTimer: (id: string | null) => void;
  toggleCustomTimer: (id: string) => void;
  resetTimer: () => void;
  updateDefaultTimerSettings: (patch: Partial<DefaultTimerSettings>) => void;
  setOnItemComplete: (cb: ((itemId: string) => void) | null) => void;
  setSections: (sections: PlanSection[]) => void;
  beginSession: () => Promise<void>;
  endSession: (allItems: PlanItem[], sections: PlanSection[]) => Promise<SessionSummaryData | null>;
  cancelSession: () => void;
  restoreActiveItem: (item: PlanItem, allItems: PlanItem[], sections: PlanSection[]) => void;
}

export interface InitialSession {
  id: string;
  startedAt: Date;
}

let nextTimerId = 0;

const STORAGE_KEY_CUSTOM_TIMERS = 'practice-custom-timers';
const STORAGE_KEY_DEFAULT_TIMER_SETTINGS = 'practice-default-timer-settings';
const STORAGE_KEY_SELECTED_TIMER = 'practice-selected-timer';

function loadCustomTimers(): CustomTimer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TIMERS);
    if (!raw) return [];
    const timers = JSON.parse(raw) as CustomTimer[];
    // Restore with paused state, update nextTimerId to avoid collisions
    return timers.map((t) => {
      const num = parseInt(t.id.replace('custom-', ''), 10);
      if (!isNaN(num) && num >= nextTimerId) nextTimerId = num + 1;
      return { ...t, isRunning: false };
    });
  } catch {
    return [];
  }
}

function loadDefaultTimerSettings(): DefaultTimerSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEFAULT_TIMER_SETTINGS);
    if (!raw) return { announceNextItem: true, autoStartNextItem: true };
    return JSON.parse(raw) as DefaultTimerSettings;
  } catch {
    return { announceNextItem: true, autoStartNextItem: true };
  }
}

function loadSelectedTimerId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_SELECTED_TIMER);
  } catch {
    return null;
  }
}

export function usePracticeSession(initialSession?: InitialSession): PracticeSessionState & PracticeSessionActions {
  const [activeItem, setActiveItem] = useState<PlanItem | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [nextItemName, setNextItemName] = useState<string | null>(null);
  const [customTimers, setCustomTimers] = useState<CustomTimer[]>(loadCustomTimers);
  const [defaultTimerSettings, setDefaultTimerSettings] = useState<DefaultTimerSettings>(loadDefaultTimerSettings);
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(loadSelectedTimerId);

  const [sessionId, setSessionId] = useState<string | null>(initialSession?.id ?? null);
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(initialSession?.startedAt ?? null);
  const [pendingActiveItemId, setPendingActiveItemId] = useState<string | null>(null);

  const isInSession = sessionId !== null;

  // Persist timers to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_TIMERS, JSON.stringify(customTimers));
  }, [customTimers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEFAULT_TIMER_SETTINGS, JSON.stringify(defaultTimerSettings));
  }, [defaultTimerSettings]);

  useEffect(() => {
    if (selectedTimerId === null) {
      localStorage.removeItem(STORAGE_KEY_SELECTED_TIMER);
    } else {
      localStorage.setItem(STORAGE_KEY_SELECTED_TIMER, selectedTimerId);
    }
  }, [selectedTimerId]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickTime = useRef<number>(Date.now());
  const allItemsRef = useRef<PlanItem[]>([]);
  const sectionsRef = useRef<PlanSection[]>([]);
  const pendingAnnouncements = useRef<string[]>([]);
  const onItemCompleteRef = useRef<((itemId: string) => void) | null>(null);
  const defaultTimerEndFired = useRef(false);

  // Session mutations
  const startSessionMutation = useStartSession();
  const endSessionMutation = useEndSession();
  const saveItemsMutation = useSaveSessionItems();

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const beginSession = useCallback(async () => {
    if (sessionId) return;
    try {
      const result = await startSessionMutation.mutateAsync();
      setSessionId(result.id);
      setSessionStartedAt(new Date(result.startedAt));
    } catch {
      // Global onError handles toast
    }
  }, [sessionId, startSessionMutation]);

  const startItem = useCallback(
    (item: PlanItem, allItems: PlanItem[], sections?: PlanSection[], options?: { announce?: boolean }) => {
      clearTimer();
      allItemsRef.current = allItems;
      if (sections) sectionsRef.current = sections;

      const idx = allItems.findIndex((i) => i.id === item.id);
      const pendingAfter = allItems.slice(idx + 1).find((i) => i.status !== 'completed');
      setNextItemName(pendingAfter ? pendingAfter.name : null);

      if (options?.announce) {
        const section = sectionsRef.current.find((s) => s.id === item.sectionId);
        const text = section
          ? `${section.name} - ${item.name}`
          : item.name;
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
      }

      setActiveItem(item);
      const seconds = (item.targetDurationMinutes ?? 0) * 60;
      setRemainingSeconds(seconds);
      setIsTimerRunning(seconds > 0);
      setSelectedTimerId(null);
    },
    [clearTimer]
  );

  const stopItem = useCallback(() => {
    clearTimer();
    setActiveItem(null);
    setRemainingSeconds(0);
    setIsTimerRunning(false);
    setNextItemName(null);
    setPendingActiveItemId(null);
  }, [clearTimer]);

  // Restore active item after page refresh (called by consumer with resolved plan data)
  const restoreActiveItem = useCallback(
    (item: PlanItem, allItems: PlanItem[], sections: PlanSection[]) => {
      clearTimer();
      allItemsRef.current = allItems;
      sectionsRef.current = sections;

      const idx = allItems.findIndex((i) => i.id === item.id);
      const pendingAfter = allItems.slice(idx + 1).find((i) => i.status !== 'completed');
      setNextItemName(pendingAfter ? pendingAfter.name : null);

      setActiveItem(item);
      const seconds = (item.targetDurationMinutes ?? 0) * 60;
      setRemainingSeconds(seconds);
      setIsTimerRunning(false); // Restored paused
      setSelectedTimerId(null);
      setPendingActiveItemId(null);
    },
    [clearTimer]
  );

  const clearSession = useCallback(() => {
    setSessionId(null);
    setSessionStartedAt(null);
  }, []);

  const cancelSession = useCallback(() => {
    stopItem();
    clearSession();
  }, [stopItem, clearSession]);

  const endSession = useCallback(
    async (
      allItems: PlanItem[],
      sections: PlanSection[]
    ): Promise<SessionSummaryData | null> => {
      if (!sessionId) return null;

      // Stop active item
      stopItem();

      // Build session items from plan items
      // Completed items use target duration; everything else is 0
      const sessionItems: SessionItemInput[] = allItems.map((item) => {
        const status: 'done' | 'partial' | 'none' =
          item.status === 'completed' ? 'done' : 'none';
        const targetSeconds = item.targetDurationMinutes
          ? item.targetDurationMinutes * 60
          : undefined;
        const durationSeconds =
          status === 'done' && targetSeconds ? targetSeconds : 0;
        const section = sections
          .find((s) => s.items.some((i) => i.id === item.id));
        return {
          name: item.name,
          section: section?.name,
          durationSeconds,
          targetDurationSeconds: targetSeconds,
          bpm: item.bpm ?? undefined,
          status,
        };
      });

      // Save items then end session
      if (sessionItems.length > 0) {
        await saveItemsMutation.mutateAsync({
          sessionId,
          items: sessionItems,
        });
      }

      const result = await endSessionMutation.mutateAsync({
        sessionId,
      });

      // Build summary
      const completedItems = sessionItems.filter((i) => i.status === 'done').length;
      const bpms = sessionItems
        .filter((i) => i.bpm && i.status !== 'none')
        .map((i) => i.bpm!);
      const avgBpm = bpms.length > 0
        ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length)
        : null;
      const totalDurationSeconds = sessionItems.reduce(
        (sum, item) => sum + item.durationSeconds,
        0
      );

      const summary: SessionSummaryData = {
        sessionId: result.id,
        durationSeconds: totalDurationSeconds,
        name: result.name,
        notes: result.notes,
        items: sessionItems,
        totalItems: allItems.length,
        completedItems,
        avgBpm,
      };

      return summary;
    },
    [sessionId, stopItem, saveItemsMutation, endSessionMutation]
  );

  const toggleTimer = useCallback(() => {
    if (selectedTimerId === null) {
      setIsTimerRunning((prev) => !prev);
    } else {
      setCustomTimers((prev) =>
        prev.map((t) =>
          t.id === selectedTimerId ? { ...t, isRunning: !t.isRunning } : t
        )
      );
    }
  }, [selectedTimerId]);

  const addCustomTimer = useCallback(() => {
    const id = `custom-${++nextTimerId}`;
    setCustomTimers((prev) => {
      if (prev.some((t) => t.id === id)) return prev;
      return [
        ...prev,
        {
          id,
          label: `T${prev.length + 1}`,
          totalSeconds: 300,
          remainingSeconds: 300,
          isRunning: false,
          announceEnabled: false,
          announceText: '',
        },
      ];
    });
    setSelectedTimerId(id);
  }, []);

  const removeCustomTimer = useCallback(
    (id: string) => {
      setCustomTimers((prev) => prev.filter((t) => t.id !== id));
      if (selectedTimerId === id) {
        setSelectedTimerId(null);
      }
    },
    [selectedTimerId]
  );

  const updateCustomTimer = useCallback(
    (id: string, patch: Partial<Pick<CustomTimer, 'label' | 'totalSeconds' | 'announceEnabled' | 'announceText'>>) => {
      setCustomTimers((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const updated = { ...t, ...patch };
          if (patch.totalSeconds !== undefined) {
            updated.remainingSeconds = patch.totalSeconds;
            updated.isRunning = false;
          }
          return updated;
        })
      );
    },
    []
  );

  const selectTimer = useCallback((id: string | null) => {
    setSelectedTimerId(id);
  }, []);

  const toggleCustomTimer = useCallback((id: string) => {
    setCustomTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isRunning: !t.isRunning } : t
      )
    );
  }, []);

  const resetTimer = useCallback(() => {
    if (selectedTimerId === null) {
      const seconds = (activeItem?.targetDurationMinutes ?? 0) * 60;
      setRemainingSeconds(seconds);
      setIsTimerRunning(false);
    } else {
      setCustomTimers((prev) =>
        prev.map((t) =>
          t.id === selectedTimerId
            ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false }
            : t
        )
      );
    }
  }, [selectedTimerId, activeItem]);

  const updateDefaultTimerSettings = useCallback(
    (patch: Partial<DefaultTimerSettings>) => {
      setDefaultTimerSettings((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const setOnItemComplete = useCallback((cb: ((itemId: string) => void) | null) => {
    onItemCompleteRef.current = cb;
  }, []);

  const setSections = useCallback((sections: PlanSection[]) => {
    sectionsRef.current = sections;
  }, []);

  // Called when default timer hits 0
  const onDefaultTimerEnd = useCallback(() => {
    if (defaultTimerEndFired.current) return;
    defaultTimerEndFired.current = true;
    setTimeout(() => { defaultTimerEndFired.current = false; }, 100);

    if (!activeItem) return;

    const allItems = allItemsRef.current;
    const sections = sectionsRef.current;
    const idx = allItems.findIndex((i) => i.id === activeItem.id);
    const nextPending = allItems.slice(idx + 1).find((i) => i.status !== 'completed');

    if (onItemCompleteRef.current) {
      onItemCompleteRef.current(activeItem.id);
    }

    if (nextPending) {
      if (defaultTimerSettings.announceNextItem) {
        const section = sections.find((s) => s.id === nextPending.sectionId);
        const announcement = section
          ? `next - ${section.name} - ${nextPending.name}`
          : `next - ${nextPending.name}`;
        const utterance = new SpeechSynthesisUtterance(announcement);
        speechSynthesis.speak(utterance);
      }

      if (defaultTimerSettings.autoStartNextItem) {
        startItem(nextPending, allItems, sections);
      }
    } else {
      const utterance = new SpeechSynthesisUtterance('done');
      speechSynthesis.speak(utterance);
    }
  }, [activeItem, defaultTimerSettings.announceNextItem, defaultTimerSettings.autoStartNextItem, startItem]);

  // Flush announcements after state settles
  useEffect(() => {
    if (pendingAnnouncements.current.length === 0) return;
    const texts = pendingAnnouncements.current.splice(0);
    for (const text of texts) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  }, [customTimers]);

  // Single interval ticks both default and custom timers.
  // Uses wall-clock elapsed time so background-tab throttling doesn't lose seconds.
  useEffect(() => {
    clearTimer();

    const anyRunning =
      (isTimerRunning && remainingSeconds > 0) ||
      customTimers.some((t) => t.isRunning && t.remainingSeconds > 0);

    if (!anyRunning) return clearTimer;

    lastTickTime.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(1, Math.round((now - lastTickTime.current) / 1000));
      lastTickTime.current = now;

      // Tick default timer
      if (isTimerRunning) {
        setRemainingSeconds((prev) => {
          if (prev <= elapsed) {
            setIsTimerRunning(false);
            setTimeout(onDefaultTimerEnd, 0);
            return 0;
          }
          return prev - elapsed;
        });
      }

      // Tick custom timers
      pendingAnnouncements.current = [];
      setCustomTimers((prev) => {
        let changed = false;
        const announcements: string[] = [];
        const next = prev.map((t) => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;
          changed = true;
          if (t.remainingSeconds <= elapsed) {
            if (t.announceEnabled && t.announceText) {
              announcements.push(t.announceText);
            }
            return { ...t, remainingSeconds: t.totalSeconds, isRunning: false };
          }
          return { ...t, remainingSeconds: t.remainingSeconds - elapsed };
        });
        pendingAnnouncements.current = announcements;
        return changed ? next : prev;
      });
    }, 1000);

    return clearTimer;
  }, [
    isTimerRunning,
    remainingSeconds > 0,
    customTimers.some((t) => t.isRunning && t.remainingSeconds > 0),
    clearTimer,
    onDefaultTimerEnd,
  ]);

  return {
    activeItem,
    remainingSeconds,
    isTimerRunning,
    nextItemName,
    customTimers,
    defaultTimerSettings,
    selectedTimerId,
    sessionId,
    sessionStartedAt,
    isInSession,
    pendingActiveItemId,
    startItem,
    stopItem,
    toggleTimer,
    addCustomTimer,
    removeCustomTimer,
    updateCustomTimer,
    selectTimer,
    toggleCustomTimer,
    resetTimer,
    updateDefaultTimerSettings,
    setOnItemComplete,
    setSections,
    beginSession,
    endSession,
    cancelSession,
    clearSession,
    restoreActiveItem,
  };
}
