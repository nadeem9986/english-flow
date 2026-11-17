// Camera-mode helpers. Pure and unit-tested; the hook lives in useCamera.ts.

/**
 * Front camera, video only. Audio stays with the recorder so turning the
 * camera on never grabs the microphone or conflicts with an active recording.
 *
 * Phones default to VGA when no size is requested, which looks soft when the
 * preview is stretched full-screen. Ask for HD as `ideal` values: capable
 * cameras (e.g. a 1080p phone selfie cam) deliver the sharper stream, weaker
 * ones fall back to their best mode instead of failing with
 * OverconstrainedError.
 */
export const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: 'user',
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
  },
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

/**
 * One-line, human-readable summary of the stream the browser actually
 * delivered (track settings), not the hints we asked for. Used for the small
 * camera-details readout so real device behavior can be checked without
 * sharing a photo. Nothing is stored or sent anywhere.
 */
export function describeCameraStream(
  settings: Partial<MediaTrackSettings> | null | undefined,
  capabilities?: Partial<MediaTrackCapabilities> | null,
  label?: string | null,
): string {
  const parts: string[] = [];
  if (settings?.width && settings?.height) {
    parts.push(`Delivered ${settings.width}\u00d7${settings.height}`);
  } else {
    parts.push('Delivered size unknown');
  }
  if (settings?.frameRate) parts.push(`${Math.round(settings.frameRate)} fps`);
  if (settings?.facingMode) parts.push(String(settings.facingMode));
  const maxW = (capabilities?.width as { max?: number } | undefined)?.max;
  const maxH = (capabilities?.height as { max?: number } | undefined)?.max;
  if (maxW && maxH) parts.push(`max offered ${maxW}\u00d7${maxH}`);
  if (label) parts.push(label);
  return parts.join(' \u00b7 ');
}
