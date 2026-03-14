import { usePracticeSessionContext } from './practice-session-provider';

export function TimerTabs() {
  const {
    activeItem,
    selectedTimerId,
    customTimers,
    selectTimer,
    addCustomTimer,
  } = usePracticeSessionContext();

  const activeLabel = activeItem ? activeItem.name : '—';

  return (
    <div className="flex flex-wrap justify-center gap-1">
      <button
        className={`px-3 py-1.5 font-mono text-xs transition-colors ${
          selectedTimerId === null
            ? 'border border-accent-green bg-accent-green text-white'
            : 'border border-border text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => selectTimer(null)}
      >
        <span className="max-w-[80px] truncate">{activeLabel}</span>
      </button>
      {customTimers.map((timer) => (
        <button
          key={timer.id}
          className={`px-3 py-1.5 font-mono text-xs transition-colors ${
            selectedTimerId === timer.id
              ? 'border border-accent-green bg-accent-green text-white'
              : 'border border-border text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => selectTimer(timer.id)}
        >
          <span className="max-w-[80px] truncate">{timer.label}</span>
        </button>
      ))}
      <button
        className="border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        onClick={addCustomTimer}
      >
        +
      </button>
    </div>
  );
}
