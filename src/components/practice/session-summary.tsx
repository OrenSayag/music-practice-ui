import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Star } from 'lucide-react';
import type { SessionSummaryData } from '@/hooks/use-practice-session';
import { useSessionTags } from '@/services/tags';
import { useSessionRecordings, useDeleteRecording, useRenameRecording, useToggleRecordingStar } from '@/services/recordings';
import type { Recording } from '@/services/recordings';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { SessionTagChip, SessionTagsDialog } from './session-tags-dialog';
import { AudioPlayer } from './audio-player';
import { SharePracticeButton } from './share-practice-button';
interface SessionSummaryProps {
  data: SessionSummaryData;
  onDone: (notes: string, name: string) => void;
  onBack: () => void;
}

export function SessionSummary({ data, onDone, onBack }: SessionSummaryProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(data.name ?? '');
  const [notes, setNotes] = useState(data.notes ?? '');
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false);
  const { data: sessionTagsList = [] } = useSessionTags(data.sessionId);
  const { data: recordings = [] } = useSessionRecordings(data.sessionId);

  const totalMinutes = Math.floor(data.durationSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const timeStr = totalHours > 0
    ? `${totalHours}h ${remainingMinutes}m`
    : `${totalMinutes}m`;

  const dateStr = new Date()
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' })
    .toLowerCase()
    .replace(',', '');

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-base text-muted-foreground">{dateStr}</p>
          <div className="flex items-center gap-2">
            <SharePracticeButton
              summary={{
                name,
                durationSeconds: data.durationSeconds,
                notes,
                items: data.items,
              }}
            />
            <button
              className="border border-border px-4 py-1.5 font-mono text-base text-muted-foreground transition-colors hover:text-foreground"
              onClick={onBack}
            >
              {t('session.backToSession')}
            </button>
            <button
              className="bg-accent-green px-4 py-1.5 font-mono text-base text-white transition-colors hover:bg-accent-green/90"
              onClick={() => onDone(notes, name)}
            >
              $ {t('session.done')}
            </button>
          </div>
        </div>
        <input
          type="text"
          className="w-full border-b border-border bg-transparent font-mono text-2xl font-bold text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder={t('session.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t('session.totalTime')} value={timeStr} />
        <StatCard
          label={t('session.itemsDone')}
          value={`${data.completedItems}/${data.totalItems}`}
        />
        <StatCard
          label={t('session.avgBpm')}
          value={data.avgBpm !== null ? String(data.avgBpm) : '—'}
        />
        <StatCard label={t('session.recordings')} value={String(recordings.length)} />
      </div>

      {/* Two columns */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 md:flex-row">
        {/* Left — item breakdown */}
        <div className="md:min-h-0 md:flex-1">
          <h2 className="mb-3 font-mono text-base font-bold text-muted-foreground">
            {t('session.itemBreakdown')}
          </h2>
          <div className="flex flex-col gap-1">
            {data.items.map((item, idx) => (
              <SessionItemRow key={idx} index={idx + 1} item={item} />
            ))}
          </div>
        </div>

        {/* Right — notes, tags, recordings */}
        <div className="flex w-full flex-col gap-4 md:w-72">
          <div>
            <h2 className="mb-2 font-mono text-base font-bold text-muted-foreground">
              {t('session.notes')}
            </h2>
            <textarea
              className="w-full resize-none border border-border bg-transparent p-3 font-mono text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              rows={4}
              placeholder={t('session.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div>
            <h2 className="mb-2 font-mono text-base font-bold text-muted-foreground">
              {t('session.tags')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {sessionTagsList.map((tag) => (
                <SessionTagChip key={tag.id} tag={tag} />
              ))}
              <button
                className="border border-border px-2 py-0.5 font-mono text-base text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setTagsDialogOpen(true)}
              >
                + {t('session.addTag')}
              </button>
            </div>
            <SessionTagsDialog
              open={tagsDialogOpen}
              onOpenChange={setTagsDialogOpen}
              sessionId={data.sessionId}
            />
          </div>
          <div>
            <h2 className="mb-2 font-mono text-base font-bold text-muted-foreground">
              {t('session.recordings')}
            </h2>
            {recordings.length === 0 ? (
              <p className="font-mono text-base text-muted-foreground">
                {t('recording.noRecordings')}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {recordings.map((rec) => (
                  <RecordingRow
                    key={rec.id}
                    recording={rec}
                    sessionId={data.sessionId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-3">
      <p className="font-mono text-base text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
    </div>
  );
}

function SessionItemRow({
  index,
  item,
}: {
  index: number;
  item: SessionSummaryData['items'][number];
}) {
  const { t } = useTranslation();
  const elapsed = formatDuration(item.durationSeconds);
  const target = item.targetDurationSeconds
    ? formatDuration(item.targetDurationSeconds)
    : null;

  const statusLabel =
    item.status === 'done'
      ? t('session.statusDone')
      : item.status === 'partial'
        ? t('session.statusPartial')
        : t('session.statusNone');

  const statusColor =
    item.status === 'done'
      ? 'text-accent-green bg-accent-green/20'
      : item.status === 'partial'
        ? 'text-cyan-400 bg-cyan-400/20'
        : 'text-muted-foreground bg-muted';

  return (
    <div className="flex flex-col gap-1 py-1.5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <span className="font-mono text-base text-muted-foreground">
          {String(index).padStart(2, '0')}
        </span>
        <span className="font-mono text-base">— {item.name}</span>
      </div>
      <div className="flex items-center gap-2 ps-7 md:ps-0">
        <span className="font-mono text-xs text-muted-foreground">
          {elapsed}{target ? `/${target}` : ''}
        </span>
        <span className={`rounded px-1.5 py-0.5 font-mono text-xs ${statusColor}`}>
          [{statusLabel}]
        </span>
      </div>
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
  const renameRecording = useRenameRecording();
  const deleteRecording = useDeleteRecording();
  const toggleStarMutation = useToggleRecordingStar();
  const [editName, setEditName] = useState(recording.fileName);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleNameBlur = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== recording.fileName) {
      renameRecording.mutate({ sessionId, recordingId: recording.id, fileName: trimmed });
    } else {
      setEditName(recording.fileName);
    }
  };

  const handleDelete = () => {
    deleteRecording.mutate({ sessionId, recordingId: recording.id });
    setDeleteOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5 border border-border p-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="min-w-0 flex-1 bg-transparent font-mono text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          placeholder={t('recording.namePlaceholder')}
        />
        <div className="flex items-center gap-1.5">
          <button
            className="shrink-0 p-0.5 transition-colors"
            onClick={() => toggleStarMutation.mutate(recording.id)}
          >
            <Star
              className={`h-3.5 w-3.5 ${
                recording.isStarred
                  ? 'fill-current text-accent-amber'
                  : 'text-muted-foreground/40 hover:text-muted-foreground'
              }`}
            />
          </button>
          <button
            className="shrink-0 text-muted-foreground transition-colors hover:text-red-500"
            onClick={() => setDeleteOpen(true)}
            title={t('recording.delete')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <AudioPlayer
        src={`/api/sessions/${recording.sessionId}/recordings/${recording.id}/stream`}
        durationHint={recording.durationSeconds}
      />
      <DeleteRecordingDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function DeleteRecordingDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm" className="font-mono">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono text-lg">
            {'> '}
            {t('recording.deleteTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {t('recording.deleteDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('recording.cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t('recording.confirmDelete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m${s}s` : `${m}m`;
}
