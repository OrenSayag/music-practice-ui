import { useTranslation } from 'react-i18next';
import { ChevronLeft, Play, Pause } from 'lucide-react';
import { SectionTitle } from '@/components/section-title';
import {
  useMetronomeContext,
  BpmDisplay,
  BpmSlider,
  BeatsCounter,
  AccentRow,
} from './metronome';

interface MobileMetronomeConfigProps {
  onClose: () => void;
}

export function MobileMetronomeConfig({ onClose }: MobileMetronomeConfigProps) {
  const { t } = useTranslation();
  const { bpm, beats, accents, isPlaying, currentBeat, setBpm, setBeats, toggleAccent, togglePlay } =
    useMetronomeContext();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <MobileConfigToolbar
        title={t('practice.metronome')}
        actionLabel={t('practice.done')}
        onBack={onClose}
        onAction={onClose}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
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

      <div className="flex justify-center pb-16">
        <button
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-green text-white transition-opacity hover:opacity-90"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}

function MobileConfigToolbar({
  title,
  actionLabel,
  onBack,
  onAction,
}: {
  title: string;
  actionLabel: string;
  onBack: () => void;
  onAction: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <button
        className="flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4" />
        {t('nav.practice')}
      </button>
      <SectionTitle>{title}</SectionTitle>
      <button
        className="font-mono text-sm text-accent-green transition-opacity hover:opacity-80"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </div>
  );
}
