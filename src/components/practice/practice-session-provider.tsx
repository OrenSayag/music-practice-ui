import { createContext, useContext } from 'react';
import {
  usePracticeSession,
  type PracticeSessionState,
  type PracticeSessionActions,
} from '@/hooks/use-practice-session';

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
  return (
    <PracticeSessionContext value={session}>
      {children}
    </PracticeSessionContext>
  );
}
