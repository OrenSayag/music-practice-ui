import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import type {
  StartSessionResponse,
  EndSessionResponse,
  SessionItemInput,
} from './session-types';

export const useStartSession = () => {
  return useMutation({
    mutationFn: () =>
      apiClient.post<StartSessionResponse>('/sessions', {}),
  });
};

export const useEndSession = () => {
  return useMutation({
    mutationFn: ({
      sessionId,
      notes,
    }: {
      sessionId: string;
      notes?: string;
    }) =>
      apiClient.patch<EndSessionResponse>(`/sessions/${sessionId}`, {
        notes,
      }),
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
