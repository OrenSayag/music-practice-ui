import type { i18n as I18n, TFunction } from 'i18next';
import type { LanguageCode } from '@/i18n/languages';

const CHECKED_STATUSES = new Set(['done', 'partial']);

export interface ShareItem {
  name: string;
  durationSeconds: number;
  bpm?: number | null;
  status: 'done' | 'partial' | 'none' | string;
}

export interface ShareSummary {
  name: string | null;
  durationSeconds: number;
  notes: string | null;
  items: ShareItem[];
}

export interface BuildMessageParams {
  summary: ShareSummary;
  weekTotalSeconds: number | null;
  teacherName: string;
  teacherLanguage: LanguageCode;
  i18n: I18n;
}

export function buildWhatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function formatDurationLabel(seconds: number): string {
  if (seconds <= 0) return '0m';
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${totalMinutes}m`;
}

export async function buildPracticeShareMessage({
  summary,
  weekTotalSeconds,
  teacherName,
  teacherLanguage,
  i18n,
}: BuildMessageParams): Promise<string> {
  const t = await loadFixedT(i18n, teacherLanguage);
  const lines: string[] = [];

  lines.push(t('share.message.greeting', { name: teacherName }));
  if (summary.name) {
    lines.push(t('share.message.session', { name: summary.name }));
  }
  lines.push(t('share.message.totalTime', { time: formatDurationLabel(summary.durationSeconds) }));
  if (weekTotalSeconds !== null) {
    lines.push(t('share.message.weekTotal', { time: formatDurationLabel(weekTotalSeconds) }));
  }

  const checkedItems = summary.items.filter((item) => CHECKED_STATUSES.has(item.status));
  if (checkedItems.length > 0) {
    lines.push('');
    lines.push(t('share.message.itemsHeader'));
    checkedItems.forEach((item, idx) => {
      const bpm = item.bpm
        ? t('share.message.bpmSuffix', { bpm: item.bpm })
        : '';
      lines.push(
        t('share.message.itemLine', {
          idx: idx + 1,
          name: item.name,
          duration: formatDurationLabel(item.durationSeconds),
          bpm,
        }),
      );
    });
  }

  if (summary.notes?.trim()) {
    lines.push('');
    lines.push(t('share.message.notes', { notes: summary.notes.trim() }));
  }

  return lines.join('\n');
}

async function loadFixedT(i18n: I18n, lng: LanguageCode): Promise<TFunction> {
  if (!i18n.hasResourceBundle(lng, 'translation')) {
    await i18n.loadLanguages(lng);
  }
  return i18n.getFixedT(lng);
}
