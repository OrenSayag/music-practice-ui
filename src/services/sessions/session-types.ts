export interface StartSessionResponse {
  id: string;
  startedAt: string;
}

export interface EndSessionResponse {
  id: string;
  startedAt: string;
  durationSeconds: number;
  name: string | null;
  notes: string | null;
}

export interface SessionItemInput {
  name: string;
  section?: string;
  durationSeconds: number;
  targetDurationSeconds?: number;
  bpm?: number;
  status: 'done' | 'partial' | 'none';
}
