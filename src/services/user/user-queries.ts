import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import type { MetronomeSound, MeResponse } from '@/services/auth/auth-types';
import type { TeacherPatch } from '@/services/user/teacher-schema';

interface UpdatePreferencesInput {
  weekStartDay?: number;
  metronomeSound?: MetronomeSound;
  teacher?: TeacherPatch | null;
}

interface PreferencesResponse {
  weekStartDay: number;
  metronomeSound: MetronomeSound;
  teacher: TeacherPatch | null;
}

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
}

interface UploadAvatarResponse {
  image: string;
}

export const useUpdatePreferences = () => {
  return useMutation({
    mutationFn: async (input: UpdatePreferencesInput) => {
      return apiClient.patch<PreferencesResponse>('/user/preferences', input);
    },
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      return apiClient.patch<MeResponse>('/user/profile', input);
    },
  });
};

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.upload<UploadAvatarResponse>('/user/avatar', formData);
    },
  });
};

export const useDeleteAvatar = () => {
  return useMutation({
    mutationFn: async () => {
      return apiClient.delete('/user/avatar');
    },
  });
};
