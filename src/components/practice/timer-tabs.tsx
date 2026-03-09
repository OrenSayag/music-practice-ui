import { useState } from 'react';

export function TimerTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['t1', 't2', '5'];

  return (
    <div className="flex justify-center gap-1">
      {tabs.map((label, i) => (
        <button
          key={i}
          className={`px-3 py-1.5 font-mono text-[11px] transition-colors ${
            i === activeTab
              ? 'border border-accent-green bg-accent-green text-white'
              : 'border border-border text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab(i)}
        >
          {label}
        </button>
      ))}
      <button className="border border-border px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground">
        +
      </button>
    </div>
  );
}
