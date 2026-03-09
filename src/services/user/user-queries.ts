import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import type { MetronomeSound } from '@/services/auth/auth-types';

interface UpdatePreferencesInput {
  weekStartDay?: number;
  metronomeSound?: MetronomeSound;
}

interface PreferencesResponse {
  weekStartDay: number;
  metronomeSound: MetronomeSound;
}

export const useUpdatePreferences = () => {
  return useMutation({
    mutationFn: async (input: UpdatePreferencesInput) => {
      return apiClient.patch<PreferencesResponse>('/user/preferences', input);
    },
  });
};
