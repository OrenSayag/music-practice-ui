export interface Recording {
  id: string;
  sessionId: string;
  fileName: string;
  durationSeconds: number;
  fileSize: number;
  mimeType: string;
  isStarred: boolean;
  createdAt: string;
}

export interface RecordingListItem extends Recording {
  session: {
    name: string | null;
    startedAt: string;
    tags: { id: string; name: string; color: string }[];
  };
}

export interface RecordingsListResponse {
  recordings: RecordingListItem[];
  nextCursor: string | null;
}

export interface RecordingsListFilters {
  starred?: boolean;
  tagId?: string;
}
