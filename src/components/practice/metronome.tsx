import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';
import { SectionTitle } from '@/components/section-title';
import { useMetronome, type MetronomeState, type MetronomeActions, type MetronomeSound } from '@/hooks/use-metronome';
import { useAuthUser } from '@/layouts/authenticated-layout';
import { createContext, useContext } from 'react';

type MetronomeContextValue = MetronomeState & MetronomeActions;
const MetronomeContext = createContext<MetronomeContextValue | null>(null);

function useMetronomeContext() {
  const ctx = useContext(MetronomeContext);
  if (!ctx) throw new Error('useMetronomeContext must be used within MetronomeProvider');
  return ctx;
}

export function MetronomeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthUser();
  const metronome = useMetronome((user.metronomeSound as MetronomeSound) || 'wood');
  return (
    <MetronomeContext value={metronome}>
      {children}
    </MetronomeContext>
  );
}

export { useMetronomeContext };

export function Metronome() {
  const { t } = useTranslation();
  const { bpm, beats, accents, isPlaying, currentBeat, setBpm, setBeats, toggleAccent } =
    useMetronomeContext();

  return (
    <div className="flex flex-col gap-3 border border-border p-4">
      <SectionTitle>{t('practice.metronome')}</SectionTitle>

      <BpmDisplay bpm={bpm} />
      <BpmSlider bpm={bpm} onBpmChange={setBpm} />

      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          {t('practice.beats')}
        </span>
        <BeatsCounter beats={beats} onBeatsChange={setBeats} />
      </div>

      <AccentRow
        accents={accents}
        currentBeat={isPlaying ? currentBeat : -1}
        onToggle={toggleAccent}
      />
      <span className="font-mono text-[10px] text-muted-foreground/60">
        {t('practice.tapToToggleAccent')}
      </span>
    </div>
  );
}

export function BpmDisplay({ bpm }: { bpm: number }) {
  return (
    <div className="flex items-end justify-center gap-2">
      <span className="font-mono text-4xl font-bold">{bpm}</span>
      <span className="mb-1 font-mono text-sm text-muted-foreground">bpm</span>
    </div>
  );
}

export function BpmSlider({ bpm, onBpmChange }: { bpm: number; onBpmChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <input
        type="range"
        min={40}
        max={200}
        value={bpm}
        onChange={(e) => onBpmChange(Number(e.target.value))}
        className="accent-accent-green"
      />
      <div className="flex justify-between">
        <span className="font-mono text-[11px] text-muted-foreground/60">40</span>
        <span className="font-mono text-[11px] text-muted-foreground/60">200</span>
      </div>
    </div>
  );
}

export function BeatsCounter({
  beats,
  onBeatsChange,
}: {
  beats: number;
  onBeatsChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        className="text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => onBeatsChange(beats - 1)}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-4 text-center font-mono text-sm">{beats}</span>
      <button
        className="text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => onBeatsChange(beats + 1)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function AccentRow({
  accents,
  currentBeat,
  onToggle,
}: {
  accents: boolean[];
  currentBeat: number;
  onToggle: (index: number) => void;
}) {
  return (
    <div className="flex justify-center gap-1.5">
      {accents.map((isAccented, i) => (
        <button
          key={i}
          className={`h-7 w-7 border transition-colors ${
            i === currentBeat
              ? 'border-accent-green bg-accent-green'
              : isAccented
                ? 'border-accent-green bg-accent-green/20'
                : 'border-border'
          }`}
          onClick={() => onToggle(i)}
        />
      ))}
    </div>
  );
}
