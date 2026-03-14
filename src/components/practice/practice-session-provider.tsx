import { createContext, useContext, useEffect } from 'react';
import {
  usePracticeSession,
  type PracticeSessionState,
  type PracticeSessionActions,
  type InitialSession,
} from '@/hooks/use-practice-session';
import { usePracticeSync } from '@/layouts/authenticated-layout';
import { collectPracticeState } from '@/hooks/use-practice-state-sync';
import { useActiveSession } from '@/services/sessions';

type PracticeSessionContextValue = PracticeSessionState & PracticeSessionActions;
const PracticeSessionContext = createContext<PracticeSessionContextValue | null>(null);

export function usePracticeSessionContext() {
  const ctx = useContext(PracticeSessionContext);
  if (!ctx)
    throw new Error('usePracticeSessionContext must be used within PracticeSessionProvider');
  return ctx;
}

export function PracticeSessionProvider({ children }: { children: React.ReactNode }) {
  const { data } = useActiveSession();

  const initialSession: InitialSession | undefined =
    data?.session
      ? { id: data.session.id, startedAt: new Date(data.session.startedAt) }
      : undefined;

  return (
    <PracticeSessionInner key={initialSession?.id ?? 'none'} initialSession={initialSession}>
      {children}
    </PracticeSessionInner>
  );
}

function PracticeSessionInner({
  initialSession,
  children,
}: {
  initialSession?: InitialSession;
  children: React.ReactNode;
}) {
  const session = usePracticeSession(initialSession);
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
    session.customTimers,
    session.defaultTimerSettings,
    session.selectedTimerId,
    syncToServer,
  ]);
}
