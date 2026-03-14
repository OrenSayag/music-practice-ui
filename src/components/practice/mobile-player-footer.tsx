import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, MessageSquare, ListChecks } from 'lucide-react';
import { useMetronomeContext } from './metronome';
import { usePracticeSessionContext } from './practice-session-provider';
import { MobileMetronomeConfig } from './mobile-metronome-config';
import { MobileTimerConfig } from './mobile-timer-config';
import { CancelSessionDialog } from './cancel-session-dialog';

type MobileOverlay = 'metronome' | 'timer' | null;

interface MobilePlayerFooterProps {
  onEndSession?: () => void;
  onCancelSession?: () => void;
  view: 'plan' | 'chat';
  onToggleView: () => void;
}

export function MobilePlayerFooter({ onEndSession, onCancelSession, view, onToggleView }: MobilePlayerFooterProps) {
  const { t } = useTranslation();
  const { bpm, isPlaying, togglePlay } = useMetronomeContext();
  const { remainingSeconds, selectedTimerId, customTimers, isInSession } =
    usePracticeSessionContext();
  const [overlay, setOverlay] = useState<MobileOverlay>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const displaySeconds =
    selectedTimerId === null
      ? remainingSeconds
      : customTimers.find((t) => t.id === selectedTimerId)?.remainingSeconds ?? 0;

  const m = Math.floor(displaySeconds / 60);
  const s = displaySeconds % 60;
  const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <>
      <div className="flex flex-col gap-2 border-t border-border px-5 py-3 pb-16 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="font-mono text-xl font-bold"
              onClick={() => setOverlay('timer')}
            >
              {timeStr}
            </button>
            {isInSession && (
              <span className="rounded bg-accent-green/20 px-1.5 py-0.5 font-mono text-2xs text-accent-green">
                {t('practice.inSession')}
              </span>
            )}
          </div>
          {isInSession && (
            <div className="flex items-center gap-2">
              <button
                className="border border-border px-2 py-1 font-mono text-2xs text-muted-foreground"
                onClick={() => setCancelOpen(true)}
              >
                {t('session.cancel')}
              </button>
              <button
                className="bg-red-500 px-2 py-1 font-mono text-2xs text-white"
                onClick={onEndSession}
              >
                {t('session.endSession')}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-2"
            onClick={() => setOverlay('metronome')}
          >
            <span className="font-mono text-xl font-bold text-muted-foreground">{bpm}</span>
            <span className="font-mono text-2xs text-muted-foreground">bpm</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              className={`flex h-10 w-10 items-center justify-center border border-border ${view === 'chat' ? 'text-accent-green' : 'text-muted-foreground'}`}
              onClick={onToggleView}
            >
              {view === 'chat' ? (
                <ListChecks className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center bg-accent-green text-white"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <CancelSessionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => {
          setCancelOpen(false);
          onCancelSession?.();
        }}
      />
      {overlay === 'metronome' && (
        <MobileMetronomeConfig onClose={() => setOverlay(null)} />
      )}
      {overlay === 'timer' && (
        <MobileTimerConfig onClose={() => setOverlay(null)} />
      )}
    </>
  );
}
