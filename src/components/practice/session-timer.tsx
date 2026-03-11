import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, Settings, Trash2 } from 'lucide-react';
import { SectionTitle } from '@/components/section-title';
import { usePracticeSessionContext } from './practice-session-provider';
import { DefaultTimerConfigDialog, CustomTimerConfigDialog } from './timer-config-modal';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface SessionTimerProps {
  /** On mobile, config opens a sub-view instead of a Dialog */
  onConfigRequest?: (target: 'default' | string) => void;
}

export function SessionTimer({ onConfigRequest }: SessionTimerProps) {
  const { t } = useTranslation();
  const {
    remainingSeconds,
    isTimerRunning,
    selectedTimerId,
    customTimers,
    activeItem,
    toggleTimer,
    resetTimer,
    removeCustomTimer,
  } = usePracticeSessionContext();

  const [configTarget, setConfigTarget] = useState<'default' | string | null>(null);

  const selectedCustom = selectedTimerId !== null
    ? customTimers.find((ct) => ct.id === selectedTimerId)
    : null;

  const displaySeconds = selectedCustom ? selectedCustom.remainingSeconds : remainingSeconds;
  const isRunning = selectedCustom ? selectedCustom.isRunning : isTimerRunning;
  const totalSeconds = selectedCustom
    ? selectedCustom.totalSeconds
    : (activeItem?.targetDurationMinutes ?? 0) * 60;
  const hasStarted = !isRunning && displaySeconds < totalSeconds;
  const isDefaultWithNoItem = selectedTimerId === null && !activeItem;

  const handleCog = () => {
    const target = selectedTimerId ?? 'default';
    if (onConfigRequest) {
      onConfigRequest(target);
    } else {
      setConfigTarget(target);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full items-center justify-between">
          <SectionTitle>
            {t('practice.sessionTimer')}
          </SectionTitle>
          <div className="flex items-center gap-1">
            <button
              className="text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleCog}
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
            {selectedCustom && (
              <button
                className="text-muted-foreground transition-colors hover:text-destructive"
                onClick={() => removeCustomTimer(selectedCustom.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <span className="font-mono text-[56px] font-bold leading-none">
          {formatTime(displaySeconds)}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
            onClick={toggleTimer}
            disabled={isDefaultWithNoItem}
          >
            {isRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
          {hasStarted && (
            <button
              className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:text-foreground"
              onClick={resetTimer}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop-only Dialog config */}
      {!onConfigRequest && (
        <>
          <DefaultTimerConfigDialog
            open={configTarget === 'default'}
            onOpenChange={(open) => !open && setConfigTarget(null)}
          />
          {configTarget !== null && configTarget !== 'default' && (
            <CustomTimerConfigDialog
              timerId={configTarget}
              open
              onOpenChange={(open) => !open && setConfigTarget(null)}
            />
          )}
        </>
      )}
    </>
  );
}
