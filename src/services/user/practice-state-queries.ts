import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import type { PracticeState, PracticeStateResponse } from './practice-state-types';

export const practiceStateQueries = {
  get: () => ({
    queryKey: ['user', 'practice-state'] as const,
    queryFn: () => apiClient.get<PracticeStateResponse>('/user/practice-state'),
  }),
};

export const usePracticeState = () => {
  return useQuery(practiceStateQueries.get());
};

export const useSavePracticeState = () => {
  return useMutation({
    mutationFn: (state: PracticeState) =>
      apiClient.put<PracticeStateResponse>('/user/practice-state', state),
  });
};
