import { useState, useRef, useCallback, useEffect } from 'react';
import { usePracticeState, useSavePracticeState } from '@/services/user/practice-state-queries';
import type { PracticeState } from '@/services/user/practice-state-types';

const THROTTLE_MS = 5000;

const STORAGE_KEY_CUSTOM_TIMERS = 'practice-custom-timers';
const STORAGE_KEY_DEFAULT_TIMER_SETTINGS = 'practice-default-timer-settings';
const STORAGE_KEY_SELECTED_TIMER = 'practice-selected-timer';
const BPM_KEY = 'metronome-bpm';
const BEATS_KEY = 'metronome-beats';
const ACCENTS_KEY = 'metronome-accents';

function writeServerStateToLocalStorage(state: PracticeState) {
  const timersForStorage = state.customTimers.map((t) => ({
    ...t,
    isRunning: false,
  }));
  localStorage.setItem(STORAGE_KEY_CUSTOM_TIMERS, JSON.stringify(timersForStorage));

  localStorage.setItem(STORAGE_KEY_DEFAULT_TIMER_SETTINGS, JSON.stringify(state.defaultTimerSettings));

  if (state.selectedTimerId) {
    localStorage.setItem(STORAGE_KEY_SELECTED_TIMER, state.selectedTimerId);
  } else {
    localStorage.removeItem(STORAGE_KEY_SELECTED_TIMER);
  }

  localStorage.setItem(BPM_KEY, String(state.metronome.bpm));
  localStorage.setItem(BEATS_KEY, String(state.metronome.beats));
  localStorage.setItem(ACCENTS_KEY, JSON.stringify(state.metronome.accents));
}

/**
 * Flush state on page unload. Uses fetch with keepalive (supports PUT + credentials).
 */
function flushStateOnUnload(state: PracticeState) {
  fetch('/api/user/practice-state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(state),
    keepalive: true,
  });
}

export function usePracticeStateSync() {
  const [serverLoaded, setServerLoaded] = useState(false);
  const { data, isSuccess, isError } = usePracticeState();
  const saveMutation = useSavePracticeState();

  // Stable ref to mutate so syncToServer doesn't depend on saveMutation identity
  const mutateRef = useRef(saveMutation.mutate);
  mutateRef.current = saveMutation.mutate;

  const latestState = useRef<PracticeState | null>(null);
  const dirty = useRef(false);
  const lastSaveTime = useRef(0);
  const trailingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: fetch server state → write to localStorage
  useEffect(() => {
    if (!isSuccess && !isError) return;

    if (isSuccess && data?.practiceState) {
      writeServerStateToLocalStorage(data.practiceState);
    }

    setServerLoaded(true);
  }, [isSuccess, isError, data]);

  const doSave = useCallback(() => {
    if (!latestState.current || !dirty.current) return;
    dirty.current = false;
    lastSaveTime.current = Date.now();
    mutateRef.current(latestState.current);
  }, []);

  // Throttle: fires immediately if enough time has passed since last save,
  // otherwise schedules a trailing save so the latest state always gets saved.
  const syncToServer = useCallback(
    (state: PracticeState) => {
      latestState.current = state;
      dirty.current = true;

      const elapsed = Date.now() - lastSaveTime.current;

      if (elapsed >= THROTTLE_MS) {
        // Enough time passed — save now
        if (trailingTimer.current) {
          clearTimeout(trailingTimer.current);
          trailingTimer.current = null;
        }
        doSave();
      } else if (!trailingTimer.current) {
        // Schedule trailing save for the remaining time
        trailingTimer.current = setTimeout(() => {
          trailingTimer.current = null;
          doSave();
        }, THROTTLE_MS - elapsed);
      }
      // If trailing timer already scheduled, latestState.current is updated —
      // when it fires it will save the most recent state.
    },
    [doSave],
  );

  // Flush on page unload via fetch+keepalive (works during refresh/close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (dirty.current && latestState.current) {
        flushStateOnUnload(latestState.current);
        dirty.current = false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Cleanup trailing timer on unmount
  useEffect(() => {
    return () => {
      if (trailingTimer.current) {
        clearTimeout(trailingTimer.current);
      }
      if (dirty.current && latestState.current) {
        mutateRef.current(latestState.current);
      }
    };
  }, []);

  return { serverLoaded, syncToServer };
}

/**
 * Assembles a full PracticeState snapshot from localStorage (timers/metronome).
 */
export function collectPracticeState(): PracticeState {
  let customTimers: PracticeState['customTimers'] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TIMERS);
    if (raw) {
      customTimers = (JSON.parse(raw) as Array<PracticeState['customTimers'][number] & { isRunning?: boolean }>).map(
        ({ id, label, totalSeconds, remainingSeconds, announceEnabled, announceText }) => ({
          id, label, totalSeconds, remainingSeconds, announceEnabled, announceText,
        })
      );
    }
  } catch { /* empty */ }

  let defaultTimerSettings: PracticeState['defaultTimerSettings'] = {
    announceNextItem: true,
    autoStartNextItem: true,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEFAULT_TIMER_SETTINGS);
    if (raw) defaultTimerSettings = JSON.parse(raw);
  } catch { /* empty */ }

  const selectedTimerId = localStorage.getItem(STORAGE_KEY_SELECTED_TIMER);

  const bpmRaw = localStorage.getItem(BPM_KEY);
  const bpm = bpmRaw ? parseInt(bpmRaw, 10) || 80 : 80;
  const beatsRaw = localStorage.getItem(BEATS_KEY);
  const beats = beatsRaw ? parseInt(beatsRaw, 10) || 4 : 4;
  let accents: boolean[] = Array.from({ length: beats }, (_, i) => i === 0);
  try {
    const raw = localStorage.getItem(ACCENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) accents = parsed;
    }
  } catch { /* empty */ }

  return {
    customTimers,
    defaultTimerSettings,
    selectedTimerId,
    metronome: { bpm, beats, accents },
  };
}
