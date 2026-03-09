import { Play, Pause } from 'lucide-react';
import { useMetronomeContext } from './metronome';

export function PlayControls() {
  const { isPlaying, togglePlay } = useMetronomeContext();

  return (
    <div className="flex justify-center">
      <button
        className="flex h-14 w-14 items-center justify-center bg-accent-green text-white transition-opacity hover:opacity-90"
        onClick={togglePlay}
      >
        {isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
