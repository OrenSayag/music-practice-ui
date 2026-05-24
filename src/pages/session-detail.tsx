import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import { Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionTitle } from '@/components/section-title';
import { AudioPlayer } from '@/components/practice/audio-player';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  SessionTagsDialog,
  SessionTagChip,
} from '@/components/practice/session-tags-dialog';
import { SharePracticeButton } from '@/components/practice/share-practice-button';
import { useSessionDetail, useEndSession } from '@/services/sessions';
import { useSessionTags } from '@/services/tags';
import {
  useSessionRecordings,
  useDeleteRecording,
  useRenameRecording,
  useToggleRecordingStar,
} from '@/services/recordings';
import { useIsMobile } from '@/hooks/use-mobile';
import type { SessionDetail, SessionDetailItem } from '@/services/sessions';
import type { Recording } from '@/services/recordings';

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data, isLoading } = useSessionDetail(sessionId ?? '');

  if (isLoading) return <SessionDetailSkeleton />;
  if (!data) return null;

  return <SessionDetailContent session={data} sessionId={sessionId!} />;
}

function SessionDetailContent({
  session,
  sessionId,
}: {
  session: SessionDetail;
  sessionId: string;
}) {
  const isMobile = useIsMobile();
  const {
    name,
    setName,
    notes,
    setNotes,
    tagsDialogOpen,
    setTagsDialogOpen,
    handleSave,
  } = useSessionDetailPage(sessionId, session);

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: sessionTags = [] } = useSessionTags(sessionId);
  const { data: recordings = [] } = useSessionRecordings(sessionId);

  const date = new Date(session.startedAt)
    .toLocaleDateString(i18n.language, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
    .toLowerCase();

  return (
    <div className="flex flex-1 flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-base font-bold">
            &gt; {t('sessions.sessionComplete')}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {date}
            {name ? ` — ${name}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SharePracticeButton
            summary={{
              name,
              durationSeconds: session.durationSeconds,
              notes,
              items: session.items.map((item) => ({
                name: item.name,
                durationSeconds: item.durationSeconds,
                bpm: item.bpm,
                status: item.status,
              })),
            }}
          />
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              handleSave();
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/sessions');
              }
            }}
          >
            {t('sessions.back')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <StatCard
          label={t('sessions.totalTime')}
          value={formatDuration(session.durationSeconds)}
        />
        <StatCard
          label={t('sessions.itemsDone')}
          value={`${session.completedItems}/${session.totalItems}`}
        />
        <StatCard
          label={t('sessions.avgBpm')}
          value={session.avgBpm !== null ? String(session.avgBpm) : '—'}
        />
        <StatCard
          label={t('sessions.recordings')}
          value={String(recordings.length)}
        />
      </div>

      {/* Body */}
      {isMobile ? (
        <div className="flex flex-col gap-8">
          <ItemBreakdown items={session.items} />
          <NotesSection
            notes={notes}
            onChange={setNotes}
            onBlur={handleSave}
          />
          <TagsSection
            tags={sessionTags}
            onOpenDialog={() => setTagsDialogOpen(true)}
          />
          <RecordingsSection recordings={recordings} sessionId={sessionId} />
        </div>
      ) : (
        <div className="flex gap-8">
          <div className="flex-1">
            <ItemBreakdown items={session.items} />
          </div>
          <div className="flex w-80 shrink-0 flex-col gap-8">
            <NameSection
              name={name}
              onChange={setName}
              onBlur={handleSave}
            />
            <NotesSection
              notes={notes}
              onChange={setNotes}
              onBlur={handleSave}
            />
            <TagsSection
              tags={sessionTags}
              onOpenDialog={() => setTagsDialogOpen(true)}
            />
            <RecordingsSection
              recordings={recordings}
              sessionId={sessionId}
            />
          </div>
        </div>
      )}

      <SessionTagsDialog
        open={tagsDialogOpen}
        onOpenChange={setTagsDialogOpen}
        sessionId={sessionId}
      />
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

function NameSection({
  name,
  onChange,
  onBlur,
}: {
  name: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-sm text-muted-foreground">
        <SectionTitle>{t('sessions.sessionComplete')}</SectionTitle>
      </span>
      <input
        className="border-b border-border bg-transparent font-mono text-base focus:outline-none"
        placeholder={t('session.namePlaceholder')}
        value={name}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </div>
  );
}

function ItemBreakdown({ items }: { items: SessionDetailItem[] }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-sm text-muted-foreground">
        <SectionTitle>{t('sessions.itemBreakdown')}</SectionTitle>
      </span>
      {items.map((item, i) => (
        <ItemRow key={i} item={item} index={i + 1} />
      ))}
    </div>
  );
}

function ItemRow({
  item,
  index,
}: {
  item: SessionDetailItem;
  index: number;
}) {
  const duration = formatDuration(item.durationSeconds);
  const target = item.targetDurationSeconds
    ? formatDuration(item.targetDurationSeconds)
    : null;

  return (
    <div className="flex flex-col gap-1 border-t border-border py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-base">
          {index} — {item.name}
        </span>
        {item.section ? (
          <span className="font-mono text-sm text-muted-foreground">
            {item.section}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
        <span>
          {duration}
          {target ? ` / ${target}` : ''}
        </span>
        {item.bpm ? <span>{item.bpm} bpm</span> : null}
        <StatusBadge status={item.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorClass =
    status === 'done'
      ? 'text-accent-green'
      : status === 'partial'
        ? 'text-accent-amber'
        : 'text-muted-foreground';
  return <span className={`font-mono text-sm ${colorClass}`}>[{status}]</span>;
}

function NotesSection({
  notes,
  onChange,
  onBlur,
}: {
  notes: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-sm text-muted-foreground">
        <SectionTitle>{t('sessions.practiceNotes')}</SectionTitle>
      </span>
      <textarea
        className="min-h-20 resize-none border border-border bg-transparent p-2 font-mono text-sm focus:outline-none"
        placeholder={t('session.notesPlaceholder')}
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </div>
  );
}

function TagsSection({
  tags,
  onOpenDialog,
}: {
  tags: { id: string; name: string; color: string }[];
  onOpenDialog: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-sm text-muted-foreground">
        <SectionTitle>{t('sessions.tags')}</SectionTitle>
      </span>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <SessionTagChip key={tag.id} tag={tag} />
        ))}
        <button
          className="font-mono text-sm text-accent-green"
          onClick={onOpenDialog}
        >
          + {t('session.addTag')}
        </button>
      </div>
    </div>
  );
}

function RecordingsSection({
  recordings,
  sessionId,
}: {
  recordings: Recording[];
  sessionId: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-sm text-muted-foreground">
        <SectionTitle>{t('sessions.recordings')}</SectionTitle>
        {` (${recordings.length})`}
      </span>
      {recordings.map((rec) => (
        <RecordingRow
          key={rec.id}
          recording={rec}
          sessionId={sessionId}
        />
      ))}
    </div>
  );
}

function RecordingRow({
  recording,
  sessionId,
}: {
  recording: Recording;
  sessionId: string;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [fileName, setFileName] = useState(recording.fileName);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const renameMutation = useRenameRecording();
  const deleteMutation = useDeleteRecording();
  const toggleStarMutation = useToggleRecordingStar();
  const streamUrl = `/api/sessions/${sessionId}/recordings/${recording.id}/stream`;

  const handleRename = () => {
    if (fileName.trim() && fileName !== recording.fileName) {
      renameMutation.mutate({
        sessionId,
        recordingId: recording.id,
        fileName: fileName.trim(),
      });
    }
    setEditing(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate({ sessionId, recordingId: recording.id });
    setConfirmOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 rounded-sm border p-3">
      <div className="flex items-center justify-between">
        {editing ? (
          <input
            className="flex-1 bg-transparent font-mono text-sm focus:outline-none"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
          />
        ) : (
          <button
            className="font-mono text-sm text-muted-foreground"
            onDoubleClick={() => setEditing(true)}
          >
            &gt; {recording.fileName}
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <button
            className="p-0.5 transition-colors"
            onClick={() => toggleStarMutation.mutate(recording.id)}
          >
            <Star
              className={`h-3 w-3 ${
                recording.isStarred
                  ? 'fill-current text-accent-amber'
                  : 'text-muted-foreground/40 hover:text-muted-foreground'
              }`}
            />
          </button>
          <button
            className="text-muted-foreground/50 hover:text-muted-foreground"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <AudioPlayer
        src={streamUrl}
        durationHint={recording.durationSeconds}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title={t('recording.deleteTitle')}
        description={t('recording.deleteDescription')}
        cancelLabel={t('session.cancel')}
        confirmLabel={t('recording.confirmDelete')}
      />
    </div>
  );
}

function SessionDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <Skeleton className="h-10" />
      <div className="flex gap-4">
        <Skeleton className="h-20 flex-1" />
        <Skeleton className="h-20 flex-1" />
        <Skeleton className="h-20 flex-1" />
        <Skeleton className="h-20 flex-1" />
      </div>
      <div className="flex gap-8">
        <Skeleton className="h-64 flex-1" />
        <Skeleton className="h-64 w-80" />
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

// -- Hook --

function useSessionDetailPage(sessionId: string, session: SessionDetail) {
  const [name, setName] = useState(session.name ?? '');
  const [notes, setNotes] = useState(session.notes ?? '');
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false);
  const endSession = useEndSession();

  const handleSave = useCallback(() => {
    endSession.mutate({
      sessionId,
      name: name || undefined,
      notes: notes || undefined,
    });
  }, [sessionId, name, notes, endSession]);

  return {
    name,
    setName,
    notes,
    setNotes,
    tagsDialogOpen,
    setTagsDialogOpen,
    handleSave,
  };
}
