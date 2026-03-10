import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useIsMobile } from '@/hooks/use-mobile';
import { useActivePlan } from '@/services/plans';
import { useEndSession as useEndSessionMutation } from '@/services/sessions';
import PlanPane from '@/components/practice/plan-pane';
import { PracticeToolbar } from '@/components/practice/practice-toolbar';
import { ToolsPane } from '@/components/practice/tools-pane';
import { MobilePlayerFooter } from '@/components/practice/mobile-player-footer';
import { MetronomeProvider } from '@/components/practice/metronome';
import {
  PracticeSessionProvider,
  usePracticeSessionContext,
} from '@/components/practice/practice-session-provider';
import { ChatPane } from '@/components/practice/chat-pane';
import { ChatPlanPreview } from '@/components/practice/chat-plan-preview';
import { SessionSummary } from '@/components/practice/session-summary';
import type { SessionSummaryData } from '@/hooks/use-practice-session';

export default function PracticePage() {
  return (
    <MetronomeProvider>
      <PracticeSessionProvider>
        <PracticePageInner />
      </PracticeSessionProvider>
    </MetronomeProvider>
  );
}

function PracticePageInner() {
  const { view, toggleView, isMobile } = usePracticeShell();
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);
  const { endSession, isInSession, sessionId } = usePracticeSessionContext();
  const { data: activePlan } = useActivePlan();
  const endSessionMutation = useEndSessionMutation();

  const handleEndSession = useCallback(async () => {
    if (!activePlan) return;
    const allItems = activePlan.sections.flatMap((s) => s.items);
    const summary = await endSession(allItems, activePlan.sections);
    if (summary) {
      setSummaryData(summary);
    }
  }, [endSession, activePlan]);

  const handleSummaryDone = useCallback(
    async (notes: string) => {
      // Save notes if changed
      if (summaryData && notes !== (summaryData.notes ?? '')) {
        await endSessionMutation.mutateAsync({
          sessionId: summaryData.sessionId,
          notes,
        });
      }
      setSummaryData(null);
    },
    [summaryData, endSessionMutation]
  );

  if (summaryData) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <SessionSummary data={summaryData} onDone={handleSummaryDone} />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!isMobile && (
        <PracticeToolbar
          view={view}
          onChatClick={toggleView}
          onEndSession={handleEndSession}
        />
      )}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {view === 'plan' ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
              <PlanPane />
            </div>
            {!isMobile && <ToolsPane />}
          </>
        ) : (
          <>
            <div className="flex flex-1 flex-col overflow-hidden">
              <ChatPane />
            </div>
            {!isMobile && <ChatPlanPreview />}
          </>
        )}
      </div>
      {isMobile && <MobilePlayerFooter onEndSession={handleEndSession} />}
    </div>
  );
}

// -- Hook --

function usePracticeShell() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const view = pathname === '/practice/chat' ? 'chat' : 'plan';

  const toggleView = () => {
    navigate(view === 'plan' ? '/practice/chat' : '/practice', { replace: true });
  };

  return { view, toggleView, isMobile };
}
