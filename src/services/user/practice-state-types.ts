export interface PracticeStateCustomTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  announceEnabled: boolean;
  announceText: string;
}

export interface PracticeStateDefaultTimerSettings {
  announceNextItem: boolean;
  autoStartNextItem: boolean;
}

export interface PracticeStateMetronome {
  bpm: number;
  beats: number;
  accents: boolean[];
}

export interface PracticeState {
  customTimers: PracticeStateCustomTimer[];
  defaultTimerSettings: PracticeStateDefaultTimerSettings;
  selectedTimerId: string | null;
  metronome: PracticeStateMetronome;
}

export interface PracticeStateResponse {
  practiceState: PracticeState | null;
}
