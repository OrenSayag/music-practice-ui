import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Bookmark, Maximize2 } from 'lucide-react';
import { useActivePlan } from '@/services/plans';
import { usePracticeSessionContext } from './practice-session-provider';
import { PresetsDialog } from './presets-dialog';

interface PracticeToolbarProps {
  view: 'plan' | 'chat';
  onChatClick: () => void;
  onEndSession?: () => void;
}

export function PracticeToolbar({ view, onChatClick, onEndSession }: PracticeToolbarProps) {
  const { t } = useTranslation();
  const [presetsOpen, setPresetsOpen] = useState(false);
  const { data: activePlan } = useActivePlan();
  const { isInSession } = usePracticeSessionContext();

  const today = new Date();
  const dateStr = today
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' })
    .toLowerCase()
    .replace(',', '');

  const isChatActive = view === 'chat';

  return (
    <>
      <div className="flex h-12 items-center justify-between border-b border-border px-6">
        {isInSession ? (
          <>
            <div className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-accent-green" />
              <span className="rounded bg-accent-green/20 px-2 py-0.5 font-mono text-xs text-accent-green">
                {t('practice.inSession')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 border border-red-500/50 px-2 py-1 font-mono text-xs text-red-500">
                {t('practice.rec')}
              </button>
              <button
                className="flex items-center gap-1.5 bg-red-500 px-3 py-1 font-mono text-xs text-white transition-colors hover:bg-red-600"
                onClick={onEndSession}
              >
                {t('practice.endSession')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <ToolbarButton
                onClick={onChatClick}
                active={isChatActive}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">
                  {t('practice.chat')}
                </span>
              </ToolbarButton>
              <ToolbarButton
                bordered
                active={presetsOpen}
                onClick={() => setPresetsOpen(true)}
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">
                  {t('practice.presets')}
                </span>
              </ToolbarButton>
              <span className="font-mono text-xs text-muted-foreground">
                {dateStr}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ToolbarButton>
                <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
              </ToolbarButton>
            </div>
          </>
        )}
      </div>
      <PresetsDialog
        open={presetsOpen}
        onOpenChange={setPresetsOpen}
        activePlanId={activePlan?.id}
      />
    </>
  );
}

function ToolbarButton({
  children,
  bordered,
  active,
  onClick,
}: {
  children: React.ReactNode;
  bordered?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const activeClass = active
    ? 'border border-accent-green bg-accent-green text-white'
    : bordered
      ? 'border border-border text-muted-foreground'
      : 'text-muted-foreground';

  return (
    <button
      className={`flex items-center gap-1.5 px-2 py-1 transition-colors hover:text-foreground ${activeClass}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
