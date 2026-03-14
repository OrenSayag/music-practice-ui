import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useIsMobile } from '@/hooks/use-mobile';
import { useActivePlan, useResetPlanItems } from '@/services/plans';
import { useEndSession as useEndSessionMutation } from '@/services/sessions';
import { useUploadRecording } from '@/services/recordings';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import PlanPane from '@/components/practice/plan-pane';
import { PracticeToolbar } from '@/components/practice/practice-toolbar';
import { ToolsPane } from '@/components/practice/tools-pane';
import { MobilePlayerFooter } from '@/components/practice/mobile-player-footer';
import { usePracticeSessionContext } from '@/components/practice/practice-session-provider';
import { useMetronomeContext } from '@/components/practice/metronome';
import { ChatPane } from '@/components/practice/chat-pane';
import { ChatPlanPreview } from '@/components/practice/chat-plan-preview';
import { SessionSummary } from '@/components/practice/session-summary';
import { RecordingPreviewDialog } from '@/components/practice/recording-preview-dialog';
import type { SessionSummaryData } from '@/hooks/use-practice-session';

export default function PracticePage() {
  return <PracticePageInner />;
}

interface PendingRecording {
  blob: Blob;
  durationSeconds: number;
}

function PracticePageInner() {
  const { view, toggleView, isMobile } = usePracticeShell();
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);
  const [pendingRecording, setPendingRecording] = useState<PendingRecording | null>(null);
  const { endSession, cancelSession, clearSession, isInSession, sessionId } = usePracticeSessionContext();
  const metronome = useMetronomeContext();
  const { data: activePlan } = useActivePlan();
  const endSessionMutation = useEndSessionMutation();
  const { isRecording, durationSeconds: recordingDuration, startRecording, stopRecording } = useAudioRecorder();
  const uploadRecording = useUploadRecording();
  const resetPlanItems = useResetPlanItems();

  const handleRecordToggle = useCallback(async () => {
    if (isRecording) {
      const result = await stopRecording();
      if (result.blob.size > 0) {
        setPendingRecording(result);
      }
    } else {
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);

  const handleSaveRecording = useCallback((name: string) => {
    if (!pendingRecording || !sessionId) return;
    const fileName = name.trim() || undefined;
    uploadRecording.mutate(
      { sessionId, blob: pendingRecording.blob, durationSeconds: pendingRecording.durationSeconds, fileName },
      { onSuccess: () => setPendingRecording(null) },
    );
  }, [pendingRecording, sessionId, uploadRecording]);

  const handleDiscardRecording = useCallback(() => {
    setPendingRecording(null);
  }, []);

  const handleEndSession = useCallback(async () => {
    if (!activePlan) return;
    try {
      if (isRecording) {
        const result = await stopRecording();
        if (result.blob.size > 0 && sessionId) {
          await uploadRecording.mutateAsync({
            sessionId,
            blob: result.blob,
            durationSeconds: result.durationSeconds,
          });
        }
      }
      if (metronome.isPlaying) metronome.togglePlay();
      const allItems = activePlan.sections.flatMap((s) => s.items);
      const summary = await endSession(allItems, activePlan.sections);
      if (summary) {
        setPendingRecording(null);
        setSummaryData(summary);
      }
    } catch {
      // Global onError handles toast
    }
  }, [endSession, activePlan, isRecording, stopRecording, sessionId, uploadRecording, metronome]);

  const handleCancelSession = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    cancelSession();
    setPendingRecording(null);
    setSummaryData(null);
    if (activePlan) {
      resetPlanItems.mutate(activePlan.id);
    }
  }, [cancelSession, isRecording, stopRecording, activePlan, resetPlanItems]);

  const handleSummaryDone = useCallback(
    async (notes: string, name: string) => {
      if (!summaryData) return;
      const nameChanged = name !== (summaryData.name ?? '');
      const notesChanged = notes !== (summaryData.notes ?? '');
      if (nameChanged || notesChanged) {
        await endSessionMutation.mutateAsync({
          sessionId: summaryData.sessionId,
          ...(nameChanged && { name }),
          ...(notesChanged && { notes }),
        });
      }
      clearSession();
      setSummaryData(null);
      if (activePlan) {
        resetPlanItems.mutate(activePlan.id);
      }
    },
    [summaryData, endSessionMutation, activePlan, resetPlanItems, clearSession]
  );

  if (summaryData) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <SessionSummary data={summaryData} onDone={handleSummaryDone} onBack={() => setSummaryData(null)} />
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
          onCancelSession={handleCancelSession}
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          onRecordToggle={handleRecordToggle}
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
      {isMobile && <MobilePlayerFooter onEndSession={handleEndSession} onCancelSession={handleCancelSession} />}
      <RecordingPreviewDialog
        open={pendingRecording !== null}
        blob={pendingRecording?.blob ?? null}
        durationSeconds={pendingRecording?.durationSeconds ?? 0}
        saving={uploadRecording.isPending}
        onSave={handleSaveRecording}
        onDiscard={handleDiscardRecording}
      />
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
    navigate(view === 'plan' ? '/practice/chat' : '/practice');
  };

  return { view, toggleView, isMobile };
}
