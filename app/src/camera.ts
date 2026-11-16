// Camera-mode helpers. Pure and unit-tested; the hook lives in useCamera.ts.

/**
 * Front camera, video only. Audio stays with the recorder so turning the
 * camera on never grabs the microphone or conflicts with an active recording.
 */
export const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: 'user' },
  audio: false,
};

export function isCameraSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices !== 'undefined' &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

/** User-facing copy for a failed getUserMedia call. Camera mode stays optional. */
export function cameraErrorMessage(err: unknown): string {
  const name = (err as { name?: string } | null)?.name;
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Camera permission denied. The normal reader still works; allow the camera to use Camera mode.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'No front camera found on this device. The normal reader still works.';
  }
  if (name === 'NotReadableError') {
    return 'The camera is busy in another app. Close it there, or keep using the normal reader.';
  }
  return 'Could not open the camera. The normal reader still works.';
}
