import { useTranslation } from 'react-i18next';
import { useAuthUser } from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/services/dashboard/dashboard-queries';
import { useIsMobile } from '@/hooks/use-mobile';
import type {
  HeatmapDay,
  Quote,
  RecentSession,
  WeeklyStats,
} from '@/services/dashboard/dashboard-types';
import { ArrowUpRight, ArrowDownRight, Music } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const { greeting, dateString } = useDashboardPage();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{greeting}</h1>
        <p className="text-muted-foreground">{dateString}</p>
      </div>

      {isLoading ? <DashboardSkeleton /> : null}

      {data ? (
        <>
          <QuoteCard quote={data.quote} />
          <DashboardGrid
            heatmap={data.heatmap}
            weeklyStats={data.weeklyStats}
            recentSessions={data.recentSessions}
          />
        </>
      ) : null}
    </div>
  );
}

function QuoteCard({ quote }: { quote: Quote }) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs text-muted-foreground mb-2 font-mono">
          // {t('dashboard.dailyQuote')}
        </p>
        <blockquote className="font-mono text-sm italic text-foreground/90">
          &ldquo;{quote.text}&rdquo;
        </blockquote>
        <p className="mt-2 text-xs text-muted-foreground">&mdash; {quote.author}</p>
      </CardContent>
    </Card>
  );
}

function DashboardGrid({
  heatmap,
  weeklyStats,
  recentSessions,
}: {
  heatmap: HeatmapDay[];
  weeklyStats: WeeklyStats;
  recentSessions: RecentSession[];
}) {
  const isMobile = useIsMobile();
  const sessionLimit = isMobile ? 2 : 4;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <WeeklyStatsCard stats={weeklyStats} />
        {isMobile ? null : <HeatmapCard heatmap={heatmap} />}
      </div>
      <div className="flex flex-col gap-6">
        {isMobile ? <HeatmapCard heatmap={heatmap} /> : null}
        <RecentSessionsList
          sessions={recentSessions}
          limit={sessionLimit}
        />
      </div>
    </div>
  );
}

function WeeklyStatsCard({ stats }: { stats: WeeklyStats }) {
  const { t } = useTranslation();
  const formatted = formatDuration(stats.totalSeconds, t);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('dashboard.thisWeek')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{formatted}</p>
        {stats.percentChange !== null ? (
          <div className="mt-1 flex items-center gap-1 text-sm">
            {stats.percentChange >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-accent-green" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-accent-red" />
            )}
            <span
              className={
                stats.percentChange >= 0
                  ? 'text-accent-green'
                  : 'text-accent-red'
              }
            >
              {stats.percentChange > 0 ? '+' : ''}
              {stats.percentChange}%
            </span>
            <span className="text-muted-foreground">
              {t('dashboard.weekOverWeek')}
            </span>
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('dashboard.noDataYet')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function HeatmapCard({ heatmap }: { heatmap: HeatmapDay[] }) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('dashboard.weeklyActivity')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1.5">
          {heatmap.map((day) => (
            <HeatmapCell key={day.date} day={day} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HeatmapCell({ day }: { day: HeatmapDay }) {
  const label = new Date(day.date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
  });

  const levelClasses = [
    'bg-muted',
    'bg-heatmap-1',
    'bg-heatmap-2',
    'bg-heatmap-3',
    'bg-heatmap-4',
  ] as const;

  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <div
        className={`h-8 w-full rounded-sm ${levelClasses[day.level]}`}
        title={`${label}: ${Math.round(day.totalSeconds / 60)}m`}
      />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function RecentSessionsList({
  sessions,
  limit,
}: {
  sessions: RecentSession[];
  limit: number;
}) {
  const { t } = useTranslation();
  const visible = sessions.slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('dashboard.recentSessions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Music className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {t('dashboard.noSessions')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.startPracticing')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((session) => (
              <RecentSessionRow key={session.id} session={session} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const TAG_COLORS = [
  'text-accent-green',
  'text-accent-cyan',
  'text-accent-amber',
  'text-accent-red',
] as const;

function RecentSessionRow({ session }: { session: RecentSession }) {
  const { t } = useTranslation();
  const dayName = new Date(session.startedAt).toLocaleDateString(undefined, {
    weekday: 'short',
  }).toLowerCase();
  const duration = formatDuration(session.durationSeconds, t);

  return (
    <div className="flex items-center justify-between rounded-md border px-4 py-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{dayName}</span>
        {session.tags.length > 0 ? (
          <div className="flex gap-2">
            {session.tags.map((tag, i) => (
              <span
                key={tag}
                className={`text-xs font-mono ${TAG_COLORS[i % TAG_COLORS.length]}`}
              >
                [{tag}]
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <span className="text-sm text-muted-foreground font-mono">
        {duration}
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-24" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

function formatDuration(
  totalSeconds: number,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  const hours = Math.floor(totalSeconds / 3600);
  const min = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return t('dashboard.hourMin', { hours, min });
  }
  return t('dashboard.min', { min });
}

// Hook at bottom of file
function useDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthUser();

  const greeting = user.isGuest
    ? t('dashboard.welcomeGuest')
    : t('dashboard.welcomeName', { name: user.firstName });

  const dateString = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return { greeting, dateString };
}
