import { useTranslation } from 'react-i18next';
import { SectionTitle } from '@/components/section-title';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function SessionTimer() {
  const { t } = useTranslation();
  const elapsedSeconds = 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <SectionTitle className="self-start">
        {t('practice.sessionTimer')}
      </SectionTitle>
      <span className="font-mono text-[56px] font-bold leading-none">
        {formatTime(elapsedSeconds)}
      </span>
      <span className="font-mono text-xs text-muted-foreground">
        {t('practice.totalElapsed')}
      </span>
    </div>
  );
}
