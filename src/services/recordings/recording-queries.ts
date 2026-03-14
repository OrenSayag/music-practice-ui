import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '../api/api-client';
import type {
  Recording,
  RecordingsListResponse,
  RecordingsListFilters,
} from './recording-types';

export function useSessionRecordings(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['recordings', sessionId],
    queryFn: () =>
      apiClient.get<Recording[]>(`/sessions/${sessionId}/recordings`),
    enabled: !!sessionId,
  });
}

export function useAllRecordings(filters: RecordingsListFilters) {
  return useInfiniteQuery({
    queryKey: ['allRecordings', filters] as const,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set('cursor', pageParam);
      if (filters.starred) params.set('starred', 'true');
      if (filters.tagId) params.set('tagId', filters.tagId);
      const qs = params.toString();
      return apiClient.get<RecordingsListResponse>(
        `/recordings${qs ? `?${qs}` : ''}`
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useToggleRecordingStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordingId: string) => {
      return apiClient.patch<{ id: string; isStarred: boolean }>(
        `/recordings/${recordingId}/star`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRecordings'] });
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
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
