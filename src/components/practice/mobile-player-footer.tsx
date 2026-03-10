import { Play, Pause } from 'lucide-react';
import { useMetronomeContext } from './metronome';

export function MobilePlayerFooter() {
  const { bpm, isPlaying, togglePlay } = useMetronomeContext();
  const elapsedSeconds = 0;

  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3 pb-16 md:hidden">
      <div className="flex items-center gap-3">
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
        <span className="font-mono text-lg font-bold">{timeStr}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-lg font-bold text-muted-foreground">{bpm}</span>
        <span className="font-mono text-[11px] text-muted-foreground">bpm</span>
      </div>
    </div>
  );
}
