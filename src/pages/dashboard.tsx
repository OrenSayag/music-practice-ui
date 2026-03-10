import { useTranslation } from 'react-i18next';
import { useAuthUser } from '@/layouts/authenticated-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionTitle } from '@/components/section-title';
import { useDashboard } from '@/services/dashboard/dashboard-queries';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type {
  HeatmapDay,
  Quote,
  RecentSession,
  WeeklyStats,
} from '@/services/dashboard/dashboard-types';
import { ArrowUpRight, ArrowDownRight, Music } from 'lucide-react';

export default function DashboardPage() {
  const { i18n } = useTranslation();
  const { data, isLoading } = useDashboard(i18n.language);
  const { user, dateString, totalTimeFormatted } = useDashboardPage(
    data?.totalPracticeSeconds ?? 0
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <TopBar
        name={user.isGuest ? 'Guest' : user.firstName || 'User'}
        initial={user.isGuest ? 'G' : (user.firstName?.[0] ?? 'U')}
        image={user.image}
        totalTime={totalTimeFormatted}
        date={dateString}
      />

      {isLoading ? <DashboardSkeleton /> : null}

      {data ? (
        <>
          <QuoteCard quote={data.quote} />
          <BottomSection
            heatmap={data.heatmap}
            weeklyStats={data.weeklyStats}
            recentSessions={data.recentSessions}
          />
        </>
      ) : null}
    </div>
  );
}

function TopBar({
  name,
  initial,
  image,
  totalTime,
  date,
}: {
  name: string;
  initial: string;
  image: string | null;
  totalTime: string;
  date: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          {image ? <AvatarImage src={image} /> : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-bold">{name}</span>
          <span className="text-xs text-muted-foreground">{totalTime}</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">{date}</span>
    </div>
  );
}

function QuoteCard({ quote }: { quote: Quote }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 rounded-sm border p-6">
      <span className="text-xs text-muted-foreground">
        <SectionTitle>{t('dashboard.dailyQuote')}</SectionTitle>
      </span>
      <blockquote className="text-base text-foreground/90">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <span className="text-xs text-muted-foreground">
        &mdash; {quote.author}
      </span>
    </div>
  );
}

function BottomSection({
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

  if (isMobile) {
    return (
      <div className="flex flex-col gap-6">
        <WeeklyStatsCard stats={weeklyStats} />
        <HeatmapCard heatmap={heatmap} />
        <RecentSessionsList sessions={recentSessions} limit={sessionLimit} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 gap-6">
      <div className="flex flex-1">
        <HeatmapCard heatmap={heatmap} />
      </div>
      <div className="flex w-xl shrink-0 flex-col gap-6">
        <WeeklyStatsCard stats={weeklyStats} />
        <RecentSessionsList sessions={recentSessions} limit={sessionLimit} />
      </div>
    </div>
  );
}

function WeeklyStatsCard({ stats }: { stats: WeeklyStats }) {
  const { t } = useTranslation();
  const formatted = formatDuration(stats.totalSeconds, t);

  return (
    <div className="flex flex-col gap-2 rounded-sm border p-6">
      <span className="text-xs text-muted-foreground">
        <SectionTitle>{t('dashboard.thisWeek')}</SectionTitle>
      </span>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold">{formatted}</span>
        {stats.percentChange !== null ? (
          <span
            className={`flex items-center gap-0.5 text-xs ${
              stats.percentChange >= 0
                ? 'text-accent-green'
                : 'text-accent-red'
            }`}
          >
            {stats.percentChange >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {stats.percentChange > 0 ? '+' : ''}
            {stats.percentChange}%
          </span>
        ) : null}
      </div>
      <span className="text-xs text-muted-foreground">
        {t('dashboard.totalPracticeTime')}
      </span>
    </div>
  );
}

const TILES_PER_STAGE = 8;
const SECONDS_PER_TILE = 1800;
const DESKTOP_TILES = 7;
const MOBILE_TILES = 4;

type TileStage = 'empty' | 'green' | 'blue' | 'purple';

function getTileStage(tileIndex: number, totalSeconds: number): TileStage {
  const halfHours = Math.min(
    Math.floor(totalSeconds / SECONDS_PER_TILE),
    TILES_PER_STAGE * 3
  );
  if (halfHours > tileIndex + TILES_PER_STAGE * 2) return 'purple';
  if (halfHours > tileIndex + TILES_PER_STAGE) return 'blue';
  if (halfHours > tileIndex) return 'green';
  return 'empty';
}

const STAGE_CLASSES: Record<TileStage, string> = {
  empty: 'bg-muted',
  green: 'bg-heatmap-green',
  blue: 'bg-heatmap-blue',
  purple: 'bg-heatmap-purple',
};

function HeatmapCard({ heatmap }: { heatmap: HeatmapDay[] }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuthUser();
  const isMobile = useIsMobile();
  const weekStartDay = user.weekStartDay ?? 0;

  const dayOrder = Array.from({ length: 7 }, (_, i) => (weekStartDay + i) % 7);

  const dayMap = new Map<number, HeatmapDay>();
  for (const day of heatmap) {
    const dow = new Date(day.date + 'T00:00:00Z').getUTCDay();
    dayMap.set(dow, day);
  }

  const days = dayOrder.map((dow) => {
    const shortLabel = new Date(2024, 0, dow === 0 ? 7 : dow)
      .toLocaleDateString(i18n.language, { weekday: 'short' })
      .replace(/^יום\s*/i, '')
      .toLowerCase();
    const narrowLabel = new Date(2024, 0, dow === 0 ? 7 : dow)
      .toLocaleDateString(i18n.language, { weekday: 'narrow' })
      .toLowerCase();
    return { dow, shortLabel, narrowLabel, totalSeconds: dayMap.get(dow)?.totalSeconds ?? 0 };
  });

  return (
    <div className="flex w-full flex-col gap-4 rounded-sm border p-6">
      <span className="text-xs text-muted-foreground">
        <SectionTitle>{t('dashboard.weeklyActivity')}</SectionTitle>
      </span>
      {isMobile ? (
        <MobileHeatmapGrid days={days} />
      ) : (
        <DesktopHeatmapGrid days={days} />
      )}
    </div>
  );
}

function DesktopHeatmapGrid({
  days,
}: {
  days: { dow: number; shortLabel: string; totalSeconds: number }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      {days.map((day) => (
        <div key={day.dow} className="flex items-center gap-1">
          <span className="w-7 shrink-0 text-[11px] text-muted-foreground">
            {day.shortLabel}
          </span>
          {Array.from({ length: DESKTOP_TILES }, (_, i) => (
            <div
              key={i}
              className={`aspect-square w-7 rounded-sm ${STAGE_CLASSES[getTileStage(i, day.totalSeconds)]}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function MobileHeatmapGrid({
  days,
}: {
  days: { dow: number; narrowLabel: string; totalSeconds: number }[];
}) {
  return (
    <div className="flex justify-between gap-1">
      {days.map((day) => (
        <div key={day.dow} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[9px] text-muted-foreground">{day.narrowLabel}</span>
          {Array.from({ length: MOBILE_TILES }, (_, i) => (
            <div
              key={i}
              className={`aspect-square w-full rounded-sm ${STAGE_CLASSES[getTileStage(i, day.totalSeconds)]}`}
            />
          ))}
        </div>
      ))}
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
    <div className="flex flex-1 flex-col gap-3 rounded-sm border p-6">
      <span className="text-xs text-muted-foreground">
        <SectionTitle>{t('dashboard.recentSessions')}</SectionTitle>
      </span>
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <Music className="h-8 w-8 text-muted-foreground/50" />
          <span className="text-sm text-muted-foreground">
            {t('dashboard.noSessions')}
          </span>
        </div>
      ) : (
        <div className="flex flex-col">
          {visible.map((session, i) => (
            <RecentSessionRow
              key={session.id}
              session={session}
              showSeparator={i < visible.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const TAG_COLORS = [
  'text-accent-green',
  'text-accent-cyan',
  'text-accent-amber',
  'text-accent-red',
] as const;

function RecentSessionRow({
  session,
  showSeparator,
}: {
  session: RecentSession;
  showSeparator: boolean;
}) {
  const { t, i18n } = useTranslation();
  const dayName = new Date(session.startedAt)
    .toLocaleDateString(i18n.language, { weekday: 'short' })
    .toLowerCase();
  const duration = formatDuration(session.durationSeconds, t);

  return (
    <>
      <div className="flex items-center justify-between py-3">
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
        <span className="text-sm text-muted-foreground">{duration}</span>
      </div>
      {showSeparator ? <div className="h-px bg-border" /> : null}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-10" />
      <Skeleton className="h-28" />
      <div className="flex gap-6">
        <Skeleton className="h-64 flex-1" />
        <div className="flex w-80 shrink-0 flex-col gap-6">
          <Skeleton className="h-28" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}

function formatDuration(
  totalSeconds: number,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const hours = Math.floor(totalSeconds / 3600);
  const min = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return t('dashboard.hourMin', { hours, min });
  }
  return t('dashboard.min', { min });
}

function useDashboardPage(totalPracticeSeconds: number) {
  const { t, i18n } = useTranslation();
  const { user } = useAuthUser();

  const dateString = new Date()
    .toLocaleDateString(i18n.language, {
      month: 'short',
      day: '2-digit',
      year: '2-digit',
    })
    .toLowerCase();

  const totalTimeFormatted = `${formatDuration(totalPracticeSeconds, t)} ${t('dashboard.total')}`;

  return { user, dateString, totalTimeFormatted };
}
