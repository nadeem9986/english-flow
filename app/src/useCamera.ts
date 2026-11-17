import { useCallback, useEffect, useRef, useState } from 'react';
import { CAMERA_CONSTRAINTS, cameraErrorMessage, describeCameraStream, isCameraSupported } from './camera';

export type CameraState = 'off' | 'requesting' | 'on' | 'error';

/**
 * Optional front-camera preview behind the reading text. Off by default;
 * tracks stop when the mode is turned off, the tab is hidden, or the
 * component unmounts. Video only: audio:false keeps the microphone free for
 * the separate opt-in recorder.
 */
export function useCamera() {
  const [state, setState] = useState<CameraState>('off');
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef(0);

  const stop = useCallback(() => {
    requestIdRef.current += 1; // cancel any in-flight permission request
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    setState((s) => (s === 'error' ? s : 'off'));
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!isCameraSupported()) {
      setState('error');
      setError('This browser cannot open the camera. The normal reader still works.');
      return;
    }
    const requestId = ++requestIdRef.current;
    setState('requesting');
    let s: MediaStream;
    try {
      s = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
    } catch (err) {
      if (requestId !== requestIdRef.current) return; // superseded by a newer toggle
      setState('error');
      setError(cameraErrorMessage(err));
      return;
    }
    if (requestId !== requestIdRef.current) {
      // Turned off while the permission prompt was open: release immediately.
      s.getTracks().forEach((t) => t.stop());
      return;
    }
    streamRef.current = s;
    setStream(s);
    setState('on');
  }, []);

  const toggle = useCallback(() => {
    if (streamRef.current) {
      stop();
    } else {
      void start();
    }
  }, [start, stop]);

  // Never hold the camera while hidden or on unmount.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stop();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [stop]);

  // What the browser actually delivered (track settings), for the readout.
  const details = stream
    ? (() => {
        const track = stream.getVideoTracks()[0];
        if (!track) return null;
        const caps = typeof track.getCapabilities === 'function' ? track.getCapabilities() : null;
        return describeCameraStream(track.getSettings(), caps, track.label);
      })()
    : null;

  return { state, error, stream, details, toggle };
}
