import { useTranslation } from 'react-i18next';
import { SectionTitle } from '@/components/section-title';
import { useActivePlan } from '@/services/plans';
import type { PlanSection } from '@/services/plans';

function formatMinutes(min: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (min < 60) return t('dashboard.min', { min });
  const hours = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return t('dashboard.hour', { hours });
  return t('dashboard.hourMin', { hours, min: m });
}

export function ChatPlanPreview() {
  const { t } = useTranslation();
  const { data: plan } = useActivePlan();

  if (!plan) return null;

  const completedCount = plan.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.status === 'completed').length,
    0
  );
  const totalCount = plan.sections.reduce(
    (sum, s) => sum + s.items.length,
    0
  );
  const totalMinutes = plan.sections.reduce(
    (sum, s) => sum + s.items.reduce((s2, i) => s2 + (i.targetDurationMinutes ?? 0), 0),
    0
  );

  return (
    <div className="flex h-full max-h-full w-[480px] shrink-0 flex-col gap-4 overflow-y-auto bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SectionTitle>{t('practice.todaysPlan')}</SectionTitle>
          {totalMinutes > 0 && (
            <span className="font-mono text-xs text-muted-foreground">
              ({formatMinutes(totalMinutes, t)})
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          [{t('practice.progress', { completed: completedCount, total: totalCount })}]
        </span>
      </div>

      {plan.sections.map((section) => (
        <PreviewSection key={section.id} section={section} />
      ))}
    </div>
  );
}

function PreviewSection({ section }: { section: PlanSection }) {
  const { t } = useTranslation();
  const sectionMinutes = section.items.reduce((sum, i) => sum + (i.targetDurationMinutes ?? 0), 0);

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs font-bold text-accent-green">
        &gt; {section.name}
        {sectionMinutes > 0 && (
          <span className="font-normal text-muted-foreground">
            {' '}({formatMinutes(sectionMinutes, t)})
          </span>
        )}
      </span>
      {section.items.map((item) => {
        const durationLabel = item.targetDurationMinutes
          ? t('practice.duration', { min: item.targetDurationMinutes })
          : null;

        return (
          <div
            key={item.id}
            className="flex items-center gap-3 px-2 py-1.5"
          >
            <div className="h-3.5 w-3.5 shrink-0 border border-muted-foreground" />
            <span className="flex-1 font-mono text-xs">{item.name}</span>
            {durationLabel ? (
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {durationLabel}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
