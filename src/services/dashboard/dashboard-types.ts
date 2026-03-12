export interface Quote {
  text: string;
  author: string;
}

export interface HeatmapDay {
  date: string;
  totalSeconds: number;
}

export interface WeeklyStats {
  totalSeconds: number;
  percentChange: number | null;
}

export interface RecentSession {
  id: string;
  name: string | null;
  startedAt: string;
  durationSeconds: number;
  tags: string[];
}

export interface DashboardData {
  quote: Quote;
  heatmap: HeatmapDay[];
  weeklyStats: WeeklyStats;
  recentSessions: RecentSession[];
  totalPracticeSeconds: number;
}
