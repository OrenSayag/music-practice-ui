import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';

interface UpdatePreferencesInput {
  weekStartDay: number;
}

interface PreferencesResponse {
  weekStartDay: number;
}

export const useUpdatePreferences = () => {
  return useMutation({
    mutationFn: async (input: UpdatePreferencesInput) => {
      return apiClient.patch<PreferencesResponse>('/user/preferences', input);
    },
  });
};
