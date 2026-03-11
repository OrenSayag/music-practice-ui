import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { usePracticeSessionContext } from './practice-session-provider';

// -- Default timer config --

interface DefaultTimerConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DefaultTimerConfigDialog({ open, onOpenChange }: DefaultTimerConfigDialogProps) {
  const { t } = useTranslation();
  const { defaultTimerSettings, updateDefaultTimerSettings } = usePracticeSessionContext();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">
            {t('practice.timerConfig')}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {t('practice.defaultTimer')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 font-mono text-sm">
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
          <label className="flex items-center gap-3 font-mono text-sm">
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
      </DialogContent>
    </Dialog>
  );
}

// -- Custom timer config --

interface CustomTimerConfigDialogProps {
  timerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomTimerConfigDialog({ timerId, open, onOpenChange }: CustomTimerConfigDialogProps) {
  const { t } = useTranslation();
  const { customTimers, updateCustomTimer } = usePracticeSessionContext();
  const timer = customTimers.find((t) => t.id === timerId);

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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">
            {t('practice.timerConfig')}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {timer.label}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-muted-foreground">
              {t('practice.timerLabel')}
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-accent-green"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-muted-foreground">
              {t('practice.timerDuration')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={999}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-accent-green"
              />
              <span className="font-mono text-xs text-muted-foreground">
                {t('practice.minutes')}
              </span>
              <input
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-16 border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-accent-green"
              />
              <span className="font-mono text-xs text-muted-foreground">
                {t('practice.seconds')}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 font-mono text-sm">
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
                className="border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-accent-green"
              />
            )}
          </div>
          <button
            className="mt-2 border border-accent-green bg-accent-green px-4 py-2 font-mono text-sm text-white transition-colors hover:bg-accent-green/90"
            onClick={handleSave}
          >
            {t('practice.save')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
