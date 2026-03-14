import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Mic, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AudioPlayer } from '@/components/practice/audio-player';
import { SessionTagChip } from '@/components/practice/session-tags-dialog';
import {
  useAllRecordings,
  useToggleRecordingStar,
} from '@/services/recordings';
import { useUserTags } from '@/services/tags';
import type {
  RecordingListItem,
  RecordingsListFilters,
} from '@/services/recordings';

export default function RecordingsPage() {
  const { t } = useTranslation();
  const {
    filters,
    recordings,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    userTags,
    handlers,
  } = useRecordingsPage();

  const loadMoreRef = useLoadMoreSentinel(
    hasNextPage,
    isFetchingNextPage,
    handlers.loadMore
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-mono text-lg font-bold">
          {'>'} {t('recordings.title')}
        </h1>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <FilterTag
          label={t('recordings.all')}
          active={!filters.starred && !filters.tagId}
          onClick={handlers.clearFilters}
        />
        <FilterTag
          label={`★ ${t('recordings.starred')}`}
          active={filters.starred === true}
          onClick={handlers.toggleStarred}
        />
        {userTags.map((tag) => (
          <FilterTag
            key={tag.id}
            label={`[${tag.name}]`}
            active={filters.tagId === tag.id}
            onClick={() => handlers.toggleTag(tag.id)}
          />
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <RecordingsSkeleton />
      ) : recordings.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Mic className="h-10 w-10 text-muted-foreground/30" />
          <p className="font-mono text-sm text-muted-foreground">
            {t('recordings.noRecordings')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recordings.map((recording) => (
            <RecordingCard
              key={recording.id}
              recording={recording}
              onToggleStar={handlers.toggleStar}
            />
          ))}
          {isFetchingNextPage ? <RecordingsSkeleton count={2} /> : null}
          <div ref={loadMoreRef} className="h-1" />
        </div>
      )}
    </div>
  );
}

function RecordingCard({
  recording,
  onToggleStar,
}: {
  recording: RecordingListItem;
  onToggleStar: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const streamUrl = `/api/sessions/${recording.sessionId}/recordings/${recording.id}/stream`;

  const sessionDate = new Date(recording.session.startedAt)
    .toLocaleDateString(i18n.language, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
    .toLowerCase();

  return (
    <div
      className="flex cursor-pointer flex-col gap-2 border border-border p-4 transition-colors hover:bg-muted/50"
      onClick={() => navigate(`/sessions/${recording.sessionId}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs">
            {'>'} {recording.fileName}
          </span>
          <span className="font-mono text-[0.625rem] text-muted-foreground">
            {recording.session.name
              ? `${recording.session.name} — ${sessionDate}`
              : t('recordings.sessionOn', { date: sessionDate })}
          </span>
        </div>
        <button
          className="shrink-0 p-1 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(recording.id);
          }}
        >
          <Star
            className={`h-4 w-4 ${
              recording.isStarred
                ? 'fill-current text-accent-amber'
                : 'text-muted-foreground/40 hover:text-muted-foreground'
            }`}
          />
        </button>
      </div>

      {recording.session.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {recording.session.tags.map((tag) => (
            <SessionTagChip key={tag.id} tag={tag} />
          ))}
        </div>
      ) : null}

      <div onClick={(e) => e.stopPropagation()}>
        <AudioPlayer
          src={streamUrl}
          durationHint={recording.durationSeconds}
        />
      </div>
    </div>
  );
}

function FilterTag({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`px-2 py-1 font-mono text-xs transition-colors ${
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:text-foreground'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function RecordingsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
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

function useRecordingsPage() {
  const [filters, setFilters] = useState<RecordingsListFilters>({});
  const { data: userTags = [] } = useUserTags();
  const toggleStarMutation = useToggleRecordingStar();

  const {
    data,
    hasNextPage = false,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
  } = useAllRecordings(filters);

  const recordings =
    data?.pages.flatMap((page) => page.recordings) ?? [];

  const toggleStarred = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      starred: prev.starred ? undefined : true,
    }));
  }, []);

  const toggleTag = useCallback((tagId: string) => {
    setFilters((prev) => ({
      ...prev,
      tagId: prev.tagId === tagId ? undefined : tagId,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const toggleStar = useCallback(
    (recordingId: string) => {
      toggleStarMutation.mutate(recordingId);
    },
    [toggleStarMutation]
  );

  const loadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  return {
    filters,
    recordings,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    userTags,
    handlers: {
      toggleStarred,
      toggleTag,
      clearFilters,
      toggleStar,
      loadMore,
    },
  };
}
