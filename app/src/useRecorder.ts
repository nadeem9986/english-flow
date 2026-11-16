import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecordingKind, RecordingMeta } from './types';
import { newId } from './store';
import { putRecording } from './db';

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'saving' | 'error';

const PREFERRED_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  return PREFERRED_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
}

export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      rec.stop();
    }
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    async (scriptId: string | null, scriptName: string, kind: RecordingKind): Promise<void> => {
      setError(null);
      if (typeof MediaRecorder === 'undefined') {
        setState('error');
        setError('This browser cannot record audio. Try current Chrome on Android.');
        return;
      }
      setState('requesting');
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setState('error');
        setError('Microphone permission denied. Recording stays optional; allow the mic to use it.');
        return;
      }
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = rec;
      chunksRef.current = [];
      startedAtRef.current = Date.now();

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const durationMs = Date.now() - startedAtRef.current;
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        chunksRef.current = [];
        stopTracks();
        if (blob.size === 0) {
          setState('idle');
          return;
        }
        const meta: RecordingMeta = {
          id: newId(),
          scriptId,
          scriptName,
          kind,
          createdAt: Date.now(),
          durationMs,
          mimeType: blob.type,
        };
        setState('saving');
        putRecording(meta, blob)
          .catch(() => setError('Could not save the recording on this device. Use export right after recording.'))
          .finally(() => setState('idle'));
      };

      rec.start(250);
      setElapsedMs(0);
      timerRef.current = window.setInterval(() => setElapsedMs(Date.now() - startedAtRef.current), 250);
      setState('recording');
    },
    [stopTracks],
  );

  // Never hold the microphone while hidden or on unmount.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stop();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
      stopTracks();
    };
  }, [stop, stopTracks]);

  return { state, error, elapsedMs, start, stop };
}
