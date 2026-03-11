import { createContext, useContext, useEffect } from 'react';
import {
  usePracticeSession,
  type PracticeSessionState,
  type PracticeSessionActions,
} from '@/hooks/use-practice-session';
import { usePracticeSync } from '@/layouts/authenticated-layout';
import { collectPracticeState } from '@/hooks/use-practice-state-sync';

type PracticeSessionContextValue = PracticeSessionState & PracticeSessionActions;
const PracticeSessionContext = createContext<PracticeSessionContextValue | null>(null);

export function usePracticeSessionContext() {
  const ctx = useContext(PracticeSessionContext);
  if (!ctx)
    throw new Error('usePracticeSessionContext must be used within PracticeSessionProvider');
  return ctx;
}

export function PracticeSessionProvider({ children }: { children: React.ReactNode }) {
  const session = usePracticeSession();
  const { syncToServer } = usePracticeSync();

  useSyncSessionState(session, syncToServer);

  return (
    <PracticeSessionContext value={session}>
      {children}
    </PracticeSessionContext>
  );
}

function useSyncSessionState(
  session: PracticeSessionState,
  syncToServer: (state: ReturnType<typeof collectPracticeState>) => void,
) {
  useEffect(() => {
    syncToServer(collectPracticeState());
  }, [
    session.sessionId,
    session.sessionStartedAt,
    session.activeItem?.id,
    session.remainingSeconds,
    session.customTimers,
    session.defaultTimerSettings,
    session.selectedTimerId,
    syncToServer,
  ]);
}
