import { useState, useRef, useCallback, useEffect } from 'react';

const MIN_BPM = 40;
const MAX_BPM = 200;
const DEFAULT_BPM = 80;
const DEFAULT_BEATS = 4;
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.1;
const CLICK_DURATION_S = 0.03;
const ACCENT_FREQ = 1000;
const NORMAL_FREQ = 800;

export interface MetronomeState {
  bpm: number;
  beats: number;
  accents: boolean[];
  isPlaying: boolean;
  currentBeat: number;
}

export interface MetronomeActions {
  setBpm: (bpm: number) => void;
  setBeats: (beats: number) => void;
  toggleAccent: (index: number) => void;
  togglePlay: () => void;
}

export function useMetronome(): MetronomeState & MetronomeActions {
  const [bpm, setBpmState] = useState(DEFAULT_BPM);
  const [beats, setBeatsState] = useState(DEFAULT_BEATS);
  const [accents, setAccents] = useState<boolean[]>(() =>
    Array.from({ length: DEFAULT_BEATS }, (_, i) => i === 0)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beats);
  const accentsRef = useRef(accents);

  bpmRef.current = bpm;
  beatsRef.current = beats;
  accentsRef.current = accents;

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const scheduleClick = useCallback(
    (time: number, isAccent: boolean) => {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = isAccent ? ACCENT_FREQ : NORMAL_FREQ;
      gain.gain.value = isAccent ? 1 : 0.6;
      gain.gain.exponentialRampToValueAtTime(0.001, time + CLICK_DURATION_S);

      osc.start(time);
      osc.stop(time + CLICK_DURATION_S);
    },
    [getAudioContext]
  );

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const beat = currentBeatRef.current;
      const isAccent = accentsRef.current[beat] ?? false;
      scheduleClick(nextNoteTimeRef.current, isAccent);

      setCurrentBeat(beat);

      const secondsPerBeat = 60 / bpmRef.current;
      nextNoteTimeRef.current += secondsPerBeat;
      currentBeatRef.current = (beat + 1) % beatsRef.current;
    }
  }, [scheduleClick]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
      currentBeatRef.current = 0;
    } else {
      const ctx = getAudioContext();
      currentBeatRef.current = 0;
      nextNoteTimeRef.current = ctx.currentTime;
      setIsPlaying(true);
      intervalRef.current = setInterval(scheduler, LOOKAHEAD_MS);
    }
  }, [isPlaying, getAudioContext, scheduler]);

  const setBpm = useCallback((value: number) => {
    setBpmState(Math.max(MIN_BPM, Math.min(MAX_BPM, value)));
  }, []);

  const setBeats = useCallback((value: number) => {
    const clamped = Math.max(1, Math.min(12, value));
    setBeatsState(clamped);
    setAccents((prev) => {
      const next = Array.from({ length: clamped }, (_, i) => prev[i] ?? false);
      if (!next.some(Boolean)) next[0] = true;
      return next;
    });
  }, []);

  const toggleAccent = useCallback((index: number) => {
    setAccents((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return {
    bpm,
    beats,
    accents,
    isPlaying,
    currentBeat,
    setBpm,
    setBeats,
    toggleAccent,
    togglePlay,
  };
}
