import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { AudioPlayer } from './audio-player';

interface RecordingPreviewDialogProps {
  open: boolean;
  blob: Blob | null;
  durationSeconds: number;
  saving?: boolean;
  onSave: (name: string) => void;
  onDiscard: () => void;
}

export function RecordingPreviewDialog({
  open,
  blob,
  durationSeconds,
  saving,
  onSave,
  onDiscard,
}: RecordingPreviewDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setBlobUrl(null);
      return;
    }
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  useEffect(() => {
    if (open) setName('');
  }, [open]);

  const durationStr = formatRecDuration(durationSeconds);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="font-mono sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono text-base">
            {'> '}
            {t('recording.preview')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            // {durationStr}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <input
          type="text"
          className="w-full border-b border-border bg-transparent py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder={t('recording.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {blobUrl && <AudioPlayer src={blobUrl} durationHint={durationSeconds} />}

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onDiscard}
            disabled={saving}
          >
            {t('recording.discard')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onSave(name)}
            disabled={saving}
          >
            {saving ? '...' : t('recording.save')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function formatRecDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
