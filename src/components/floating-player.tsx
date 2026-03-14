import { createPortal } from 'react-dom';
import { Play, Pause, Music } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useMetronomeContext } from '@/components/practice/metronome';
import { usePracticeSessionContext } from '@/components/practice/practice-session-provider';

export function FloatingPlayer() {
  const { isVisible, bpm, isPlaying, timeStr, togglePlay } = useFloatingPlayer();

    if(!isVisible) return null

  return createPortal(
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      <div className="flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Link
          to="/practice"
          className="flex items-center gap-2 font-mono text-sm"
        >
          <Music className="h-3.5 w-3.5 text-accent-green" />
          {timeStr && (
            <span className="font-bold tabular-nums">{timeStr}</span>
          )}
          {isPlaying && (
            <span className="text-muted-foreground">
              {bpm} <span className="text-2xs">bpm</span>
            </span>
          )}
        </Link>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-green text-white"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>,
    document.body,
  );
}

function useFloatingPlayer() {
  const { pathname } = useLocation();
  const isPractice = pathname.startsWith('/practice');

  const { bpm, isPlaying, togglePlay } = useMetronomeContext();
  const {
    remainingSeconds,
    isTimerRunning,
    isInSession,
    selectedTimerId,
    customTimers,
  } = usePracticeSessionContext();

  const displaySeconds =
    selectedTimerId === null
      ? remainingSeconds
      : customTimers.find((t) => t.id === selectedTimerId)?.remainingSeconds ??
        0;

  const hasActiveTimer = isTimerRunning || displaySeconds > 0;
  const isAnythingActive = isPlaying || hasActiveTimer || isInSession;
  const isVisible = !isPractice && isAnythingActive;

  const m = Math.floor(displaySeconds / 60);
  const s = displaySeconds % 60;
  const timeStr =
    hasActiveTimer
      ? `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : null;

  return { isVisible, bpm, isPlaying, timeStr, togglePlay };
}
