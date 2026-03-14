import {
  useMutation,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import type {
  StartSessionResponse,
  EndSessionResponse,
  SessionItemInput,
  SessionsListResponse,
  SessionDetail,
} from './session-types';

export const sessionQueries = {
  list: () => ({
    queryKey: ['sessions'] as const,
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set('cursor', pageParam);
      const qs = params.toString();
      return apiClient.get<SessionsListResponse>(
        `/sessions${qs ? `?${qs}` : ''}`
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: SessionsListResponse) =>
      lastPage.nextCursor ?? undefined,
  }),
  detail: (sessionId: string) => ({
    queryKey: ['sessions', sessionId] as const,
    queryFn: () => apiClient.get<SessionDetail>(`/sessions/${sessionId}`),
    enabled: !!sessionId,
  }),
};

export const useListSessions = () => {
  return useInfiniteQuery(sessionQueries.list());
};

export const useSessionDetail = (sessionId: string) => {
  return useQuery(sessionQueries.detail(sessionId));
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient.delete(`/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useStartSession = () => {
  return useMutation({
    mutationFn: () =>
      apiClient.post<StartSessionResponse>('/sessions', {}),
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      name,
      notes,
    }: {
      sessionId: string;
      name?: string;
      notes?: string;
    }) =>
      apiClient.patch<EndSessionResponse>(`/sessions/${sessionId}`, {
        name,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useSaveSessionItems = () => {
  return useMutation({
    mutationFn: ({
      sessionId,
      items,
    }: {
      sessionId: string;
      items: SessionItemInput[];
    }) =>
      apiClient.post<{ count: number }>(`/sessions/${sessionId}/items`, {
        items,
      }),
  });
};
