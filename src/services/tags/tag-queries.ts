import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import type { UserTag, CreateTagInput, UpdateTagInput } from './tag-types';

export const tagQueries = {
  list: () => ({
    queryKey: ['tags'] as const,
    queryFn: () => apiClient.get<UserTag[]>('/tags'),
  }),
  sessionTags: (sessionId: string) => ({
    queryKey: ['tags', 'session', sessionId] as const,
    queryFn: () => apiClient.get<UserTag[]>(`/sessions/${sessionId}/tags`),
    enabled: !!sessionId,
  }),
};

export const useUserTags = () => {
  return useQuery(tagQueries.list());
};

export const useSessionTags = (sessionId: string) => {
  return useQuery(tagQueries.sessionTags(sessionId));
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTagInput) =>
      apiClient.post<UserTag>('/tags', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tagId, ...input }: UpdateTagInput & { tagId: string }) =>
      apiClient.patch<UserTag>(`/tags/${tagId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => apiClient.delete(`/tags/${tagId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useLinkSessionTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      tagId,
    }: {
      sessionId: string;
      tagId: string;
    }) =>
      apiClient.post<UserTag[]>(`/sessions/${sessionId}/tags`, { tagId }),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ['tags', 'session', sessionId],
      });
    },
  });
};

export const useUnlinkSessionTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      tagId,
    }: {
      sessionId: string;
      tagId: string;
    }) => apiClient.delete(`/sessions/${sessionId}/tags/${tagId}`),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ['tags', 'session', sessionId],
      });
    },
  });
};
