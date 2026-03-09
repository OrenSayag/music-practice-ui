import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import type { DashboardData } from './dashboard-types';

export const dashboardQueries = {
  dashboard: () => ({
    queryKey: ['dashboard'] as const,
    queryFn: async () => {
      return apiClient.get<DashboardData>('/dashboard');
    },
  }),
};

export const useDashboard = () => {
  return useQuery(dashboardQueries.dashboard());
};
