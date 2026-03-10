import { useState, useRef, useCallback, useEffect } from 'react';

const MIN_BPM = 40;
const MAX_BPM = 200;
const DEFAULT_BPM = 80;
const DEFAULT_BEATS = 4;
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.1;

const BPM_KEY = 'metronome-bpm';
const VOLUME_KEY = 'metronome-volume';
const DEFAULT_VOLUME = 0.8;

function loadBpm(): number {
  const stored = localStorage.getItem(BPM_KEY);
  if (stored === null) return DEFAULT_BPM;
  const parsed = Number(stored);
  return Number.isFinite(parsed) ? Math.max(MIN_BPM, Math.min(MAX_BPM, parsed)) : DEFAULT_BPM;
}

function loadVolume(): number {
  const stored = localStorage.getItem(VOLUME_KEY);
  if (stored === null) return DEFAULT_VOLUME;
  const parsed = Number(stored);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : DEFAULT_VOLUME;
}

export type MetronomeSound = 'wood' | 'glass' | 'electromagnetic' | 'arcane';

export interface SoundConfig {
  accentFreq: number;
  normalFreq: number;
  accentGain: number;
  normalGain: number;
  duration: number;
  waveform: OscillatorType;
}

export const SOUND_CONFIGS: Record<MetronomeSound, SoundConfig> = {
  wood: {
    accentFreq: 800,
    normalFreq: 500,
    accentGain: 0.8,
    normalGain: 0.5,
    duration: 0.02,
    waveform: 'sine',
  },
  glass: {
    accentFreq: 2200,
    normalFreq: 1600,
    accentGain: 0.4,
    normalGain: 0.25,
    duration: 0.08,
    waveform: 'sine',
  },
  electromagnetic: {
    accentFreq: 600,
    normalFreq: 440,
    accentGain: 0.6,
    normalGain: 0.4,
    duration: 0.015,
    waveform: 'square',
  },
  arcane: {
    accentFreq: 1200,
    normalFreq: 700,
    accentGain: 0.5,
    normalGain: 0.35,
    duration: 0.06,
    waveform: 'triangle',
  },
};

export interface MetronomeState {
  bpm: number;
  beats: number;
  accents: boolean[];
  isPlaying: boolean;
  currentBeat: number;
  volume: number;
}

export interface MetronomeActions {
  setBpm: (bpm: number) => void;
  setBeats: (beats: number) => void;
  toggleAccent: (index: number) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
}

export function useMetronome(soundType: MetronomeSound = 'wood'): MetronomeState & MetronomeActions {
  const [bpm, setBpmState] = useState(loadBpm);
  const [beats, setBeatsState] = useState(DEFAULT_BEATS);
  const [accents, setAccents] = useState<boolean[]>(() =>
    Array.from({ length: DEFAULT_BEATS }, (_, i) => i === 0)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [volume, setVolumeState] = useState(loadVolume);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beats);
  const accentsRef = useRef(accents);
  const soundRef = useRef(SOUND_CONFIGS[soundType]);
  const volumeRef = useRef(volume);

  bpmRef.current = bpm;
  beatsRef.current = beats;
  accentsRef.current = accents;
  soundRef.current = SOUND_CONFIGS[soundType];
  volumeRef.current = volume;

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
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
      const cfg = soundRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const vol = volumeRef.current;
      osc.type = cfg.waveform;
      osc.frequency.value = isAccent ? cfg.accentFreq : cfg.normalFreq;
      gain.gain.setValueAtTime((isAccent ? cfg.accentGain : cfg.normalGain) * vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + cfg.duration);

      osc.start(time);
      osc.stop(time + cfg.duration);
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
    const clamped = Math.max(MIN_BPM, Math.min(MAX_BPM, value));
    setBpmState(clamped);
    localStorage.setItem(BPM_KEY, String(clamped));
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

  const setVolume = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    setVolumeState(clamped);
    localStorage.setItem(VOLUME_KEY, String(clamped));
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
    volume,
    setBpm,
    setBeats,
    toggleAccent,
    togglePlay,
    setVolume,
  };
}

export function playPreviewClick(sound: MetronomeSound, volume: number = 0.8) {
  const ctx = new AudioContext();
  const cfg = SOUND_CONFIGS[sound];
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = cfg.waveform;
  osc.frequency.value = cfg.accentFreq;
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(cfg.accentGain * volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.duration);

  osc.start(now);
  osc.stop(now + cfg.duration);

  setTimeout(() => ctx.close(), 500);
}
