import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import type { Plan } from '@/services/plans/plan-types';
import type { Preset, SavePresetInput } from './preset-types';

export const presetQueries = {
  list: () => ({
    queryKey: ['presets'] as const,
    queryFn: () => apiClient.get<Preset[]>('/presets'),
  }),
};

export const usePresets = () => {
  return useQuery(presetQueries.list());
};

export const useSavePreset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SavePresetInput) =>
      apiClient.post<Preset>('/presets', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
};

export const useDeletePreset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (presetId: string) =>
      apiClient.delete(`/presets/${presetId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
};

export const useLoadPreset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (presetId: string) =>
      apiClient.post<Plan>(`/presets/${presetId}/load`),
    onSuccess: (plan) => {
      queryClient.setQueryData(['plans', 'active'], plan);
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
};
