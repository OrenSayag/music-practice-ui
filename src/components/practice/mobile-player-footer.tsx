import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { useMetronomeContext } from './metronome';
import { usePracticeSessionContext } from './practice-session-provider';
import { MobileMetronomeConfig } from './mobile-metronome-config';
import { MobileTimerConfig } from './mobile-timer-config';

type MobileOverlay = 'metronome' | 'timer' | null;

export function MobilePlayerFooter() {
  const { bpm, isPlaying, togglePlay } = useMetronomeContext();
  const { remainingSeconds, selectedTimerId, customTimers } = usePracticeSessionContext();
  const [overlay, setOverlay] = useState<MobileOverlay>(null);

  const displaySeconds =
    selectedTimerId === null
      ? remainingSeconds
      : customTimers.find((t) => t.id === selectedTimerId)?.remainingSeconds ?? 0;

  const m = Math.floor(displaySeconds / 60);
  const s = displaySeconds % 60;
  const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <>
      <div className="flex items-center justify-between border-t border-border px-5 py-3 pb-16 md:hidden">
        <button
          className="font-mono text-lg font-bold"
          onClick={() => setOverlay('timer')}
        >
          {timeStr}
        </button>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2"
            onClick={() => setOverlay('metronome')}
          >
            <span className="font-mono text-lg font-bold text-muted-foreground">{bpm}</span>
            <span className="font-mono text-[11px] text-muted-foreground">bpm</span>
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

      {overlay === 'metronome' && (
        <MobileMetronomeConfig onClose={() => setOverlay(null)} />
      )}
      {overlay === 'timer' && (
        <MobileTimerConfig onClose={() => setOverlay(null)} />
      )}
    </>
  );
}
