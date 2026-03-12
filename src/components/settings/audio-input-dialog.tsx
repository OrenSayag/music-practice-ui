import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAudioDevices } from '@/hooks/use-audio-devices';

interface AudioInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AudioInputDialog({ open, onOpenChange }: AudioInputDialogProps) {
  const { t } = useTranslation();
  const { devices, selectedDeviceId, enumerate, selectDevice } = useAudioDevices();

  useEffect(() => {
    if (open) {
      enumerate();
    }
  }, [open, enumerate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-background font-mono sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">
            {'> '}
            {t('settings.audioInputSettings').toLowerCase()}
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          {t('settings.audioInputDescription')}
        </p>
        <div className="mt-2">
          <p className="mb-2 text-xs text-muted-foreground">
            // {t('settings.inputDevice')}
          </p>
          {devices.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {t('settings.noDevices')}
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {devices.map((device) => (
                <AudioDeviceOption
                  key={device.deviceId}
                  label={device.label}
                  selected={device.deviceId === selectedDeviceId}
                  onClick={() => selectDevice(device.deviceId)}
                />
              ))}
            </div>
          )}
        </div>
        <button
          className="mt-4 w-full bg-accent-green py-2 font-mono text-xs text-white transition-colors hover:bg-accent-green/90"
          onClick={() => onOpenChange(false)}
        >
          $ {t('settings.done')}
        </button>
      </DialogContent>
    </Dialog>
  );
}

function AudioDeviceOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex items-center gap-2 border px-3 py-2 text-start transition-colors ${
        selected
          ? 'border-accent-green/50 bg-accent-green/10 text-accent-green'
          : 'border-border text-foreground hover:bg-muted'
      }`}
      onClick={onClick}
    >
      <Mic className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate text-xs">{label}</span>
      {selected && <Check className="h-3.5 w-3.5 shrink-0 text-accent-green" />}
    </button>
  );
}
