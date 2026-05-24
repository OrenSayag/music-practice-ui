import { useTranslation } from 'react-i18next';
import { Share2 } from 'lucide-react';
import { useAuthUser } from '@/layouts/authenticated-layout';
import { useWeekStats } from '@/services/sessions';
import { isCompleteTeacher } from '@/services/user/teacher-schema';
import { isSupportedLanguage, type LanguageCode } from '@/i18n/languages';
import {
  buildPracticeShareMessage,
  buildWhatsappUrl,
  type ShareSummary,
} from '@/lib/share-practice';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
  summary: ShareSummary;
}

export function SharePracticeButton({ summary }: Props) {
  const { t, i18n } = useTranslation();
  const { user } = useAuthUser();
  const { data: weekStats } = useWeekStats();
  const teacher = user.teacher;
  const enabled = isCompleteTeacher(teacher);

  const handleShare = async () => {
    if (!enabled) return;
    const language: LanguageCode = isSupportedLanguage(teacher.language)
      ? teacher.language
      : 'en';
    const message = await buildPracticeShareMessage({
      summary,
      weekTotalSeconds: weekStats?.totalSeconds ?? null,
      teacherName: teacher.name,
      teacherLanguage: language,
      i18n,
    });
    window.open(buildWhatsappUrl(teacher.phone, message), '_blank', 'noopener,noreferrer');
  };

  const button = (
    <button
      type="button"
      disabled={!enabled}
      onClick={handleShare}
      className="flex items-center gap-1.5 border border-border px-4 py-1.5 font-mono text-base text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted-foreground"
    >
      <Share2 className="h-3.5 w-3.5" />
      {t('share.toTeacher')}
    </button>
  );

  if (enabled) return button;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{button}</span>
        </TooltipTrigger>
        <TooltipContent>{t('share.noTeacherTooltip')}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
