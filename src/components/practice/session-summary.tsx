import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SessionSummaryData } from '@/hooks/use-practice-session';
import { useSessionTags } from '@/services/tags';
import { SessionTagChip, SessionTagsDialog } from './session-tags-dialog';

interface SessionSummaryProps {
  data: SessionSummaryData;
  onDone: (notes: string) => void;
}

export function SessionSummary({ data, onDone }: SessionSummaryProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState(data.notes ?? '');
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false);
  const { data: sessionTagsList = [] } = useSessionTags(data.sessionId);

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold">
            {'>'} {t('session.complete')}
          </h1>
          <p className="font-mono text-xs text-muted-foreground">{dateStr}</p>
        </div>
        <button
          className="bg-accent-green px-4 py-1.5 font-mono text-xs text-white transition-colors hover:bg-accent-green/90"
          onClick={() => onDone(notes)}
        >
          $ {t('session.done')}
        </button>
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
        <StatCard label={t('session.recordings')} value="0" />
      </div>

      {/* Two columns */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 md:flex-row">
        {/* Left — item breakdown */}
        <div className="min-h-0 flex-1">
          <h2 className="mb-3 font-mono text-xs font-bold text-muted-foreground">
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
            <h2 className="mb-2 font-mono text-xs font-bold text-muted-foreground">
              {t('session.notes')}
            </h2>
            <textarea
              className="w-full resize-none border border-border bg-transparent p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              rows={4}
              placeholder={t('session.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div>
            <h2 className="mb-2 font-mono text-xs font-bold text-muted-foreground">
              {t('session.tags')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {sessionTagsList.map((tag) => (
                <SessionTagChip key={tag.id} tag={tag} />
              ))}
              <button
                className="border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
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
            <h2 className="mb-2 font-mono text-xs font-bold text-muted-foreground">
              {t('session.recordings')}
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              0 {t('session.recordings').toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-3">
      <p className="font-mono text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold">{value}</p>
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
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {String(index).padStart(2, '0')}
        </span>
        <span className="font-mono text-xs">— {item.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[0.5rem] text-muted-foreground">
          {elapsed}{target ? `/${target}` : ''}
        </span>
        <span className={`rounded px-1.5 py-0.5 font-mono text-[0.5rem] ${statusColor}`}>
          [{statusLabel}]
        </span>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m${s}s` : `${m}m`;
}
