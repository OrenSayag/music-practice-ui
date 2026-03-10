import { useTranslation } from 'react-i18next';
import { ChevronLeft, Plus } from 'lucide-react';
import { SectionTitle } from '@/components/section-title';
import { SessionTimer } from './session-timer';
import { TimerTabs } from './timer-tabs';

interface MobileTimerConfigProps {
  onClose: () => void;
}

export function MobileTimerConfig({ onClose }: MobileTimerConfigProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <MobileTimerToolbar onBack={onClose} />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <SessionTimer />
        <TimerTabs />
      </div>
    </div>
  );
}

function MobileTimerToolbar({ onBack }: { onBack: () => void }) {
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
      <SectionTitle>{t('practice.timers')}</SectionTitle>
      <button className="text-muted-foreground transition-colors hover:text-foreground">
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
