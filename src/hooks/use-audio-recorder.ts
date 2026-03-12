import { useState, useRef, useCallback } from 'react';

const DEVICE_KEY = 'audio-input-device-id';

function getPreferredMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return '';
}

interface RecordingResult {
  blob: Blob;
  durationSeconds: number;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const resolveRef = useRef<((result: RecordingResult) => void) | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const deviceId = localStorage.getItem(DEVICE_KEY) || undefined;
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const mimeType = getPreferredMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        stream.getTracks().forEach((t) => t.stop());
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRecording(false);
        setDurationSeconds(0);
        resolveRef.current?.({ blob, durationSeconds: elapsed });
        resolveRef.current = null;
      };

      recorderRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start(1000);
      setIsRecording(true);

      intervalRef.current = setInterval(() => {
        setDurationSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const stopRecording = useCallback((): Promise<RecordingResult> => {
    return new Promise((resolve) => {
      if (!recorderRef.current || recorderRef.current.state === 'inactive') {
        resolve({ blob: new Blob(), durationSeconds: 0 });
        return;
      }
      resolveRef.current = resolve;
      recorderRef.current.stop();
    });
  }, []);

  return { isRecording, durationSeconds, error, startRecording, stopRecording };
}
