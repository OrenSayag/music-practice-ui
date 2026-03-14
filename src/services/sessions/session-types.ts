import type { TagColor } from '@/services/tags/tag-types';

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

export interface SessionListTag {
  id: string;
  name: string;
  color: TagColor;
}

export interface SessionListItem {
  id: string;
  name: string | null;
  startedAt: string;
  durationSeconds: number;
  itemCount: number;
  recordingCount: number;
  tags: SessionListTag[];
}

export interface SessionStats {
  thisWeekSeconds: number;
  totalSessions: number;
  avgDurationSeconds: number;
  streakDays: number;
}

export interface SessionsListResponse {
  sessions: SessionListItem[];
  stats: SessionStats;
  nextCursor: string | null;
}

export interface SessionDetailItem {
  name: string;
  section: string | null;
  durationSeconds: number;
  targetDurationSeconds: number | null;
  bpm: number | null;
  status: string;
}

export interface SessionDetail {
  id: string;
  name: string | null;
  startedAt: string;
  durationSeconds: number;
  notes: string | null;
  items: SessionDetailItem[];
  totalItems: number;
  completedItems: number;
  avgBpm: number | null;
  recordingCount: number;
}
