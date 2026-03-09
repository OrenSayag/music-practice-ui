import { Metronome } from './metronome';
import { PlayControls } from './play-controls';
import { SessionTimer } from './session-timer';
import { TimerTabs } from './timer-tabs';

export function ToolsPane() {
  return (
    <div className="flex w-[400px] shrink-0 flex-col justify-between border-s border-border p-6">
      <div className="flex flex-col gap-6">
        <Metronome />
        <PlayControls />
      </div>
      <div className="flex flex-col gap-6">
        <SessionTimer />
        <TimerTabs />
      </div>
    </div>
  );
}
