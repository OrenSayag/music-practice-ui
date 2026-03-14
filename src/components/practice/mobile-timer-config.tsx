import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Plus, ArrowLeft } from 'lucide-react';
import { SectionTitle } from '@/components/section-title';
import { SessionTimer } from './session-timer';
import { TimerTabs } from './timer-tabs';
import { usePracticeSessionContext } from './practice-session-provider';

interface MobileTimerConfigProps {
  onClose: () => void;
}

type ConfigView =
  | { type: 'main' }
  | { type: 'defaultConfig' }
  | { type: 'customConfig'; timerId: string };

export function MobileTimerConfig({ onClose }: MobileTimerConfigProps) {
  const [view, setView] = useState<ConfigView>({ type: 'main' });

  const handleConfigRequest = (target: 'default' | string) => {
    if (target === 'default') {
      setView({ type: 'defaultConfig' });
    } else {
      setView({ type: 'customConfig', timerId: target });
    }
  };

  if (view.type === 'defaultConfig') {
    return (
      <MobileDefaultTimerConfig onBack={() => setView({ type: 'main' })} />
    );
  }

  if (view.type === 'customConfig') {
    return (
      <MobileCustomTimerConfig
        timerId={view.timerId}
        onBack={() => setView({ type: 'main' })}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <MobileTimerToolbar onBack={onClose} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <SessionTimer onConfigRequest={handleConfigRequest} />
        <TimerTabs />
      </div>
    </div>
  );
}

function MobileTimerToolbar({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { addCustomTimer } = usePracticeSessionContext();

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <button
        className="flex items-center gap-1 font-mono text-base text-muted-foreground transition-colors hover:text-foreground"
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4" />
        {t('nav.practice')}
      </button>
      <SectionTitle>{t('practice.timers')}</SectionTitle>
      <button
        className="text-muted-foreground transition-colors hover:text-foreground"
        onClick={addCustomTimer}
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

// -- Mobile default timer config sub-view --

function MobileDefaultTimerConfig({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { defaultTimerSettings, updateDefaultTimerSettings } = usePracticeSessionContext();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <button
          className="flex items-center gap-1 font-mono text-base text-muted-foreground transition-colors hover:text-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <SectionTitle>{t('practice.timerConfig')}</SectionTitle>
      </div>
      <div className="flex flex-col gap-4 p-6">
        <label className="flex items-center gap-3 font-mono text-base">
          <input
            type="checkbox"
            checked={defaultTimerSettings.announceNextItem}
            onChange={(e) =>
              updateDefaultTimerSettings({ announceNextItem: e.target.checked })
            }
            className="accent-accent-green"
          />
          {t('practice.announceNextItem')}
        </label>
        <label className="flex items-center gap-3 font-mono text-base">
          <input
            type="checkbox"
            checked={defaultTimerSettings.autoStartNextItem}
            onChange={(e) =>
              updateDefaultTimerSettings({ autoStartNextItem: e.target.checked })
            }
            className="accent-accent-green"
          />
          {t('practice.autoStartNextItem')}
        </label>
      </div>
    </div>
  );
}

// -- Mobile custom timer config sub-view --

function MobileCustomTimerConfig({ timerId, onBack }: { timerId: string; onBack: () => void }) {
  const { t } = useTranslation();
  const { customTimers, updateCustomTimer } = usePracticeSessionContext();
  const timer = customTimers.find((ct) => ct.id === timerId);

  const [label, setLabel] = useState(timer?.label ?? '');
  const [minutes, setMinutes] = useState(Math.floor((timer?.totalSeconds ?? 0) / 60));
  const [seconds, setSeconds] = useState((timer?.totalSeconds ?? 0) % 60);
  const [announceEnabled, setAnnounceEnabled] = useState(timer?.announceEnabled ?? false);
  const [announceText, setAnnounceText] = useState(timer?.announceText ?? '');

  if (!timer) return null;

  const handleSave = () => {
    updateCustomTimer(timerId, {
      label: label || timer.label,
      totalSeconds: minutes * 60 + seconds,
      announceEnabled,
      announceText,
    });
    onBack();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <button
          className="flex items-center gap-1 font-mono text-base text-muted-foreground transition-colors hover:text-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <SectionTitle>{t('practice.timerConfig')}</SectionTitle>
      </div>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-sm text-muted-foreground">
            {t('practice.timerLabel')}
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="border border-border bg-transparent px-3 py-2 font-mono text-base outline-none focus:border-accent-green"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-sm text-muted-foreground">
            {t('practice.timerDuration')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={999}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 border border-border bg-transparent px-3 py-2 font-mono text-base outline-none focus:border-accent-green"
            />
            <span className="font-mono text-sm text-muted-foreground">
              {t('practice.minutes')}
            </span>
            <input
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-16 border border-border bg-transparent px-3 py-2 font-mono text-base outline-none focus:border-accent-green"
            />
            <span className="font-mono text-sm text-muted-foreground">
              {t('practice.seconds')}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 font-mono text-base">
            <input
              type="checkbox"
              checked={announceEnabled}
              onChange={(e) => setAnnounceEnabled(e.target.checked)}
              className="accent-accent-green"
            />
            {t('practice.announceOnEnd')}
          </label>
          {announceEnabled && (
            <input
              type="text"
              value={announceText}
              onChange={(e) => setAnnounceText(e.target.value)}
              placeholder={t('practice.announceTextPlaceholder')}
              className="border border-border bg-transparent px-3 py-2 font-mono text-base outline-none focus:border-accent-green"
            />
          )}
        </div>
        <button
          className="mt-2 border border-accent-green bg-accent-green px-4 py-2 font-mono text-base text-white transition-colors hover:bg-accent-green/90"
          onClick={handleSave}
        >
          {t('practice.save')}
        </button>
      </div>
    </div>
  );
}
