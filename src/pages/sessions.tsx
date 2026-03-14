import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Trash2, Filter, Music } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionTitle } from '@/components/section-title';
import { useListSessions, useDeleteSession } from '@/services/sessions';
import { useIsMobile } from '@/hooks/use-mobile';
import type { SessionListItem } from '@/services/sessions';
import type { TagColor } from '@/services/tags';

const colorMap: Record<TagColor, string> = {
  green: 'text-accent-green',
  amber: 'text-accent-amber',
  cyan: 'text-accent-cyan',
  red: 'text-accent-red',
};

export default function SessionsPage() {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useListSessions();
  const {
    sessionToDelete,
    setSessionToDelete,
    handleDelete,
    isDeleting,
  } = useSessionsPage();

  const sessions = data?.pages.flatMap((p) => p.sessions) ?? [];
  const stats = data?.pages[0]?.stats;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <SessionsHeader />

      {isLoading ? <SessionsSkeleton /> : null}

      {data ? (
        <>
          {stats ? <StatsRow stats={stats} /> : null}
          <SessionsList
            sessions={sessions}
            onDelete={setSessionToDelete}
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        </>
      ) : null}

      <DeleteSessionDialog
        session={sessionToDelete}
        open={!!sessionToDelete}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

function SessionsHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="font-mono text-base font-bold">
          &gt; {t('sessions.title')}
        </span>
        <span className="font-mono text-sm text-muted-foreground">
          {t('sessions.subtitle')}
        </span>
      </div>
      <button className="font-mono text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
      </button>
    </div>
  );
}

function StatsRow({
  stats,
}: {
  stats: {
    thisWeekSeconds: number;
    totalSessions: number;
    avgDurationSeconds: number;
    streakDays: number;
  };
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const cards = [
    {
      label: t('sessions.thisWeek'),
      value: formatDuration(stats.thisWeekSeconds),
    },
    {
      label: t('sessions.sessions'),
      value: String(stats.totalSessions),
    },
    {
      label: t('sessions.avgDuration'),
      value: formatDuration(stats.avgDurationSeconds),
    },
    {
      label: t('sessions.streak'),
      value: t('sessions.days', { count: stats.streakDays }),
    },
  ];

  const visibleCards = isMobile ? [cards[0], cards[3]] : cards;

  return (
    <div className="flex gap-4">
      {visibleCards.map((card) => (
        <StatCard key={card.label} label={card.label} value={card.value} />
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-sm border p-4">
      <span className="font-mono text-sm text-muted-foreground">
        <SectionTitle>{label}</SectionTitle>
      </span>
      <span className="font-mono text-xl font-bold">{value}</span>
    </div>
  );
}

function SessionsList({
  sessions,
  onDelete,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  sessions: SessionListItem[];
  onDelete: (session: SessionListItem) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  const { t } = useTranslation();
  const loadMoreRef = useLoadMoreSentinel(hasNextPage, isFetchingNextPage, onLoadMore);

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-sm text-muted-foreground">
        <SectionTitle>{t('sessions.recentSessions')}</SectionTitle>
      </span>
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Music className="h-8 w-8 text-muted-foreground/50" />
          <span className="font-mono text-base text-muted-foreground">
            {t('sessions.noSessions')}
          </span>
        </div>
      ) : (
        <div className="flex flex-col">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={() => onDelete(session)}
            />
          ))}
          <div ref={loadMoreRef} className="h-1" />
          {isFetchingNextPage ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  onDelete,
}: {
  session: SessionListItem;
  onDelete: () => void;
}) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const date = new Date(session.startedAt);
  const dateStr = date
    .toLocaleDateString(i18n.language, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
    .toLowerCase();
  const duration = formatDuration(session.durationSeconds);

  return (
    <div
      className="flex cursor-pointer items-start justify-between border-t border-border py-4 transition-colors hover:bg-muted/30"
      onClick={() => navigate(`/sessions/${session.id}`)}
    >
      <div className="flex flex-col gap-1">
        <span className="font-mono text-base">
          &gt; {dateStr}
          {session.name ? ` — ${session.name}` : ''}
        </span>
        <span className="font-mono text-sm text-muted-foreground">
          {session.itemCount > 0
            ? `${session.itemCount} items`
            : ''}
        </span>
        {session.tags.length > 0 ? (
          <div className="flex gap-2">
            {session.tags.map((tag) => (
              <span
                key={tag.id}
                className={`font-mono text-sm ${colorMap[tag.color]}`}
              >
                [{tag.name}]
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-base text-accent-green">{duration}</span>
        {session.recordingCount > 0 ? (
          <span className="h-2 w-2 rounded-full bg-accent-red" />
        ) : null}
        <button
          className="text-muted-foreground/50 transition-colors hover:text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function DeleteSessionDialog({
  session,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  session: SessionListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  const { t, i18n } = useTranslation();
  if (!session) return null;

  const date = new Date(session.startedAt)
    .toLocaleDateString(i18n.language, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
    .toLowerCase();
  const duration = formatDuration(session.durationSeconds);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono">
            &gt; {t('sessions.deleteTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('sessions.deleteDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1 rounded-sm border p-4">
          <span className="font-mono text-sm text-muted-foreground">
            <SectionTitle>{t('sessions.sessionToDelete')}</SectionTitle>
          </span>
          <span className="font-mono text-base font-bold">
            &gt; {date}
            {session.name ? ` — ${session.name}` : ''}
          </span>
          <div className="flex items-center gap-3 font-mono text-sm">
            <span className="text-accent-green">{duration}</span>
            <span className="text-muted-foreground">
              {session.itemCount} items
            </span>
            {session.recordingCount > 0 ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-accent-red" />
                <span className="text-muted-foreground">
                  {session.recordingCount} recordings
                </span>
              </>
            ) : null}
          </div>
        </div>

        {session.recordingCount > 0 ? (
          <p className="font-mono text-sm text-accent-amber">
            &#9650; {t('sessions.recordingsWarning')}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel className="font-mono text-sm">
            {t('sessions.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-accent-red font-mono text-sm text-white hover:bg-accent-red/80"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {t('sessions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SessionsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4">
        <Skeleton className="h-20 flex-1" />
        <Skeleton className="h-20 flex-1" />
        <Skeleton className="h-20 flex-1" />
        <Skeleton className="h-20 flex-1" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const min = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${min}m`;
  return `${min}m`;
}

// -- Hooks --

function useLoadMoreSentinel(
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void
) {
  const ref = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '200px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return ref;
}

function useSessionsPage() {
  const [sessionToDelete, setSessionToDelete] =
    useState<SessionListItem | null>(null);
  const deleteMutation = useDeleteSession();

  const handleDelete = () => {
    if (!sessionToDelete) return;
    deleteMutation.mutate(sessionToDelete.id, {
      onSuccess: () => setSessionToDelete(null),
    });
  };

  return {
    sessionToDelete,
    setSessionToDelete,
    handleDelete,
    isDeleting: deleteMutation.isPending,
  };
}
