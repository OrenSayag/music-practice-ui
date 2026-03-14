import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Bookmark, Maximize2, Minimize2 } from 'lucide-react';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { useActivePlan } from '@/services/plans';
import { usePracticeSessionContext } from './practice-session-provider';
import { PresetsDialog } from './presets-dialog';
import { CancelSessionDialog } from './cancel-session-dialog';

interface PracticeToolbarProps {
  view: 'plan' | 'chat';
  onChatClick: () => void;
  onEndSession?: () => void;
  onCancelSession?: () => void;
  isRecording?: boolean;
  recordingDuration?: number;
  onRecordToggle?: () => void;
}

export function PracticeToolbar({
  view,
  onChatClick,
  onEndSession,
  onCancelSession,
  isRecording,
  recordingDuration = 0,
  onRecordToggle,
}: PracticeToolbarProps) {
  const { t } = useTranslation();
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const { data: activePlan } = useActivePlan();
  const { isInSession } = usePracticeSessionContext();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const FullscreenIcon = isFullscreen ? Minimize2 : Maximize2;

  const today = new Date();
  const dateStr = today
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' })
    .toLowerCase()
    .replace(',', '');

  const isChatActive = view === 'chat';

  return (
    <>
      <div className="flex h-12 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-4">
          <ToolbarButton
            onClick={onChatClick}
            active={isChatActive}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="font-mono text-sm">
              {t('practice.chat')}
            </span>
          </ToolbarButton>
          {!isInSession && (
            <ToolbarButton
              bordered
              active={presetsOpen}
              onClick={() => setPresetsOpen(true)}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className="font-mono text-sm">
                {t('practice.presets')}
              </span>
            </ToolbarButton>
          )}
          {isInSession ? (
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent-green" />
              <span className="rounded bg-accent-green/20 px-2 py-0.5 font-mono text-sm text-accent-green">
                {t('practice.inSession')}
              </span>
            </div>
          ) : (
            <span className="font-mono text-sm text-muted-foreground">
              {dateStr}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isInSession && (
            <>
              <button
                className={`flex items-center gap-1.5 border px-2 py-1 font-mono text-sm transition-colors ${
                  isRecording
                    ? 'border-red-500 bg-red-500/20 text-red-500'
                    : 'border-red-500/50 text-red-500 hover:bg-red-500/10'
                }`}
                onClick={onRecordToggle}
              >
                {isRecording && (
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
                )}
                {isRecording ? formatRecordingDuration(recordingDuration) : t('practice.rec')}
              </button>
              <button
                className="border border-border px-2 py-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setCancelOpen(true)}
              >
                {t('session.cancel')}
              </button>
              <button
                className="flex items-center gap-1.5 bg-red-500 px-3 py-1 font-mono text-sm text-white transition-colors hover:bg-red-600"
                onClick={onEndSession}
              >
                {t('practice.endSession')}
              </button>
            </>
          )}
          <ToolbarButton onClick={toggleFullscreen}>
            <FullscreenIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </ToolbarButton>
        </div>
      </div>
      <PresetsDialog
        open={presetsOpen}
        onOpenChange={setPresetsOpen}
        activePlanId={activePlan?.id}
      />
      <CancelSessionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => {
          setCancelOpen(false);
          onCancelSession?.();
        }}
      />
    </>
  );
}

function formatRecordingDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function ToolbarButton({
  children,
  bordered,
  active,
  onClick,
}: {
  children: React.ReactNode;
  bordered?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const activeClass = active
    ? 'border border-accent-green bg-accent-green text-white'
    : bordered
      ? 'border border-border text-muted-foreground'
      : 'text-muted-foreground';

  return (
    <button
      className={`flex items-center gap-1.5 px-2 py-1 transition-colors hover:text-foreground ${activeClass}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
