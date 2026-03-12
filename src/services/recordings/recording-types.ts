export interface Recording {
  id: string;
  sessionId: string;
  fileName: string;
  durationSeconds: number;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}
