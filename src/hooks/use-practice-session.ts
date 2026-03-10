import { useState, useRef, useCallback, useEffect } from 'react';
import type { PlanItem, PlanSection } from '@/services/plans';

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

export interface PracticeSessionState {
  activeItem: PlanItem | null;
  remainingSeconds: number;
  isTimerRunning: boolean;
  nextItemName: string | null;
  customTimers: CustomTimer[];
  defaultTimerSettings: DefaultTimerSettings;
  selectedTimerId: string | null; // null = default timer
}

export interface PracticeSessionActions {
  startItem: (item: PlanItem, allItems: PlanItem[], sections?: PlanSection[], options?: { announce?: boolean }) => void;
  stopItem: () => void;
  toggleTimer: () => void;
  addCustomTimer: () => void;
  removeCustomTimer: (id: string) => void;
  updateCustomTimer: (id: string, patch: Partial<Pick<CustomTimer, 'label' | 'totalSeconds' | 'announceEnabled' | 'announceText'>>) => void;
  selectTimer: (id: string | null) => void;
  toggleCustomTimer: (id: string) => void;
  resetTimer: () => void;
  updateDefaultTimerSettings: (patch: Partial<DefaultTimerSettings>) => void;
  /** Set a callback to be called when the active item should be marked complete */
  setOnItemComplete: (cb: ((itemId: string) => void) | null) => void;
  /** Keep sections in sync for announcements */
  setSections: (sections: PlanSection[]) => void;
}

let nextTimerId = 0;

export function usePracticeSession(): PracticeSessionState & PracticeSessionActions {
  const [activeItem, setActiveItem] = useState<PlanItem | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [nextItemName, setNextItemName] = useState<string | null>(null);
  const [customTimers, setCustomTimers] = useState<CustomTimer[]>([]);
  const [defaultTimerSettings, setDefaultTimerSettings] = useState<DefaultTimerSettings>({
    announceNextItem: true,
    autoStartNextItem: false,
  });
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Store allItems ref for auto-advance
  const allItemsRef = useRef<PlanItem[]>([]);
  const sectionsRef = useRef<PlanSection[]>([]);
  const pendingAnnouncements = useRef<string[]>([]);
  const onItemCompleteRef = useRef<((itemId: string) => void) | null>(null);
  const defaultTimerEndFired = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startItem = useCallback(
    (item: PlanItem, allItems: PlanItem[], sections?: PlanSection[], options?: { announce?: boolean }) => {
      clearTimer();
      allItemsRef.current = allItems;
      if (sections) sectionsRef.current = sections;

      const idx = allItems.findIndex((i) => i.id === item.id);
      const pendingAfter = allItems.slice(idx + 1).find((i) => i.status !== 'completed');
      setNextItemName(pendingAfter ? pendingAfter.name : null);

      // Announce on manual start
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
  }, [clearTimer]);

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
      // Guard against strict-mode double-call: don't add if id already exists
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
      // Reset default timer to active item's duration
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
    // Guard against strict-mode double-fire
    if (defaultTimerEndFired.current) return;
    defaultTimerEndFired.current = true;
    setTimeout(() => { defaultTimerEndFired.current = false; }, 100);

    if (!activeItem) return;

    const allItems = allItemsRef.current;
    const sections = sectionsRef.current;
    const idx = allItems.findIndex((i) => i.id === activeItem.id);
    const nextPending = allItems.slice(idx + 1).find((i) => i.status !== 'completed');

    // Mark current item as completed
    if (onItemCompleteRef.current) {
      onItemCompleteRef.current(activeItem.id);
    }

    // Announce next item: "next - <section> - <item>"
    if (defaultTimerSettings.announceNextItem && nextPending) {
      const section = sections.find((s) => s.id === nextPending.sectionId);
      const announcement = section
        ? `next - ${section.name} - ${nextPending.name}`
        : `next - ${nextPending.name}`;
      const utterance = new SpeechSynthesisUtterance(announcement);
      speechSynthesis.speak(utterance);
    }

    // Auto-start next item or stop
    if (defaultTimerSettings.autoStartNextItem && nextPending) {
      startItem(nextPending, allItems, sections);
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

  // Single interval ticks both default and custom timers
  useEffect(() => {
    clearTimer();

    const anyRunning =
      (isTimerRunning && remainingSeconds > 0) ||
      customTimers.some((t) => t.isRunning && t.remainingSeconds > 0);

    if (!anyRunning) return clearTimer;

    intervalRef.current = setInterval(() => {
      // Tick default timer
      if (isTimerRunning) {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setTimeout(onDefaultTimerEnd, 0);
            return 0;
          }
          return prev - 1;
        });
      }

      // Tick custom timers — reset ref before updater so strict-mode double-call overwrites instead of appending
      pendingAnnouncements.current = [];
      setCustomTimers((prev) => {
        let changed = false;
        const announcements: string[] = [];
        const next = prev.map((t) => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;
          changed = true;
          if (t.remainingSeconds <= 1) {
            if (t.announceEnabled && t.announceText) {
              announcements.push(t.announceText);
            }
            return { ...t, remainingSeconds: t.totalSeconds, isRunning: false };
          }
          return { ...t, remainingSeconds: t.remainingSeconds - 1 };
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
  };
}
