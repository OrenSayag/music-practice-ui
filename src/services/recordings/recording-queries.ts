import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/api-client';
import type { Recording } from './recording-types';

export function useSessionRecordings(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['recordings', sessionId],
    queryFn: () =>
      apiClient.get<Recording[]>(`/sessions/${sessionId}/recordings`),
    enabled: !!sessionId,
  });
}

export function useUploadRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      blob,
      durationSeconds,
      fileName,
    }: {
      sessionId: string;
      blob: Blob;
      durationSeconds: number;
      fileName?: string;
    }) => {
      const formData = new FormData();
      formData.append(
        'file',
        blob,
        fileName ?? `recording-${Date.now()}.webm`,
      );
      formData.append('durationSeconds', String(durationSeconds));
      return apiClient.upload<Recording>(
        `/sessions/${sessionId}/recordings`,
        formData,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['recordings', variables.sessionId],
      });
    },
  });
}

export function useRenameRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      recordingId,
      fileName,
    }: {
      sessionId: string;
      recordingId: string;
      fileName: string;
    }) => {
      return apiClient.patch<Recording>(
        `/sessions/${sessionId}/recordings/${recordingId}`,
        { fileName },
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['recordings', variables.sessionId],
      });
    },
  });
}

export function useDeleteRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      recordingId,
    }: {
      sessionId: string;
      recordingId: string;
    }) => {
      return apiClient.delete(
        `/sessions/${sessionId}/recordings/${recordingId}`,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['recordings', variables.sessionId],
      });
    },
  });
}
