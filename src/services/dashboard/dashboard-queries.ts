import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import type { DashboardData } from './dashboard-types';

export const dashboardQueries = {
  dashboard: (locale: string) => ({
    queryKey: ['dashboard', locale] as const,
    queryFn: async () => {
      return apiClient.get<DashboardData>(`/dashboard?locale=${locale}`);
    },
  }),
};

export const useDashboard = (locale: string) => {
  return useQuery(dashboardQueries.dashboard(locale));
};
