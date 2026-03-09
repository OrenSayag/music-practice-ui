import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import type {
  Plan,
  PlanSection,
  PlanItem,
  CreateSectionInput,
  CreateItemInput,
  UpdateItemInput,
  UpdateSectionInput,
  ReorderInput,
} from './plan-types';

export const planQueries = {
  activePlan: () => ({
    queryKey: ['plans', 'active'] as const,
    queryFn: () => apiClient.get<Plan>('/plans/active'),
  }),
};

export const useActivePlan = () => {
  return useQuery({
    ...planQueries.activePlan(),
    retry: (failureCount, error) => {
      // Don't retry on 404 (no active plan)
      if ('status' in error && (error as { status: number }).status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: { name?: string }) =>
      apiClient.post<Plan>('/plans', input ?? {}),
    onSuccess: (plan) => {
      queryClient.setQueryData(['plans', 'active'], plan);
    },
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      ...input
    }: CreateSectionInput & { planId: string }) =>
      apiClient.post<PlanSection>(`/plans/${planId}/sections`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'active'] });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      ...input
    }: UpdateSectionInput & { sectionId: string }) =>
      apiClient.patch<PlanSection>(`/plans/sections/${sectionId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'active'] });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) =>
      apiClient.delete(`/plans/sections/${sectionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'active'] });
    },
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      ...input
    }: CreateItemInput & { sectionId: string }) =>
      apiClient.post<PlanItem>(`/plans/sections/${sectionId}/items`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'active'] });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      ...input
    }: UpdateItemInput & { itemId: string }) =>
      apiClient.patch<PlanItem>(`/plans/items/${itemId}`, input),
    // Optimistic update for checkbox toggle
    onMutate: async ({ itemId, ...input }) => {
      await queryClient.cancelQueries({ queryKey: ['plans', 'active'] });
      const previous = queryClient.getQueryData<Plan>(['plans', 'active']);

      if (previous && input.status) {
        queryClient.setQueryData<Plan>(['plans', 'active'], {
          ...previous,
          sections: previous.sections.map((s) => ({
            ...s,
            items: s.items.map((i) =>
              i.id === itemId ? { ...i, status: input.status! } : i
            ),
          })),
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['plans', 'active'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'active'] });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      apiClient.delete(`/plans/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'active'] });
    },
  });
};

export const useReorderPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, ...input }: ReorderInput & { planId: string }) =>
      apiClient.put<Plan>(`/plans/${planId}/reorder`, input),
    onSuccess: (plan) => {
      queryClient.setQueryData(['plans', 'active'], plan);
    },
  });
};
