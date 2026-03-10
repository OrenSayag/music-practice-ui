import { useLocation, useNavigate } from 'react-router';
import { useIsMobile } from '@/hooks/use-mobile';
import PlanPane from '@/components/practice/plan-pane';
import { PracticeToolbar } from '@/components/practice/practice-toolbar';
import { ToolsPane } from '@/components/practice/tools-pane';
import { MobilePlayerFooter } from '@/components/practice/mobile-player-footer';
import { MetronomeProvider } from '@/components/practice/metronome';
import { PracticeSessionProvider } from '@/components/practice/practice-session-provider';
import { ChatPane } from '@/components/practice/chat-pane';
import { ChatPlanPreview } from '@/components/practice/chat-plan-preview';

export default function PracticePage() {
  const { view, toggleView, isMobile } = usePracticeShell();

  return (
    <MetronomeProvider>
      <PracticeSessionProvider>
      <div className="flex min-h-0 flex-1 flex-col">
        {!isMobile && (
          <PracticeToolbar view={view} onChatClick={toggleView} />
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
        {isMobile && <MobilePlayerFooter />}
      </div>
      </PracticeSessionProvider>
    </MetronomeProvider>
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
