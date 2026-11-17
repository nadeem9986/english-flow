import { describe, expect, it } from 'vitest';
import { CAMERA_CONSTRAINTS, cameraErrorMessage, describeCameraStream, continuousFocusConstraint, isCameraSupported } from './camera';

describe('CAMERA_CONSTRAINTS', () => {
  it('asks for the front camera at HD quality, as hints rather than hard requirements', () => {
    const video = CAMERA_CONSTRAINTS.video as MediaTrackConstraints;
    expect(video.facingMode).toBe('user');
    // ideal values raise phone previews from the VGA default toward 1080p
    // while never throwing OverconstrainedError on weaker cameras.
    expect(video.width).toEqual({ ideal: 1920 });
    expect(video.height).toEqual({ ideal: 1080 });
    expect(video.frameRate).toEqual({ ideal: 30 });
    expect(video).not.toHaveProperty('exact');
    expect(video.width).not.toHaveProperty('exact');
    expect(video.height).not.toHaveProperty('exact');
  });

  it('never requests audio, so the mic stays free for the recorder', () => {
    expect(CAMERA_CONSTRAINTS.audio).toBe(false);
  });
});

describe('isCameraSupported', () => {
  it('is false where mediaDevices is unavailable', () => {
    // The vitest node environment exposes navigator without mediaDevices.
    expect(isCameraSupported()).toBe(false);
  });
});

describe('cameraErrorMessage', () => {
  it('explains a denied permission and keeps the normal reader as the fallback', () => {
    const msg = cameraErrorMessage({ name: 'NotAllowedError' });
    expect(msg).toContain('Camera permission denied');
    expect(msg).toContain('normal reader still works');
  });

  it('treats SecurityError like a denial', () => {
    expect(cameraErrorMessage({ name: 'SecurityError' })).toContain('Camera permission denied');
  });

  it('explains a missing front camera', () => {
    expect(cameraErrorMessage({ name: 'NotFoundError' })).toContain('No front camera found');
    expect(cameraErrorMessage({ name: 'OverconstrainedError' })).toContain('No front camera found');
  });

  it('explains a busy camera', () => {
    expect(cameraErrorMessage({ name: 'NotReadableError' })).toContain('busy in another app');
  });

  it('falls back to a generic message for unknown failures, never throwing', () => {
    expect(cameraErrorMessage({ name: 'WeirdError' })).toContain('Could not open the camera');
    expect(cameraErrorMessage(null)).toContain('Could not open the camera');
    expect(cameraErrorMessage(undefined)).toContain('Could not open the camera');
  });

  it('never promises recording; preview and recording stay separate', () => {
    for (const name of ['NotAllowedError', 'NotFoundError', 'NotReadableError', 'Other']) {
      expect(cameraErrorMessage({ name })).not.toMatch(/record/i);
    }
  });
});

describe('describeCameraStream', () => {
  it('reports the delivered size, fps, facing and the camera maximum', () => {
    const text = describeCameraStream(
      { width: 1280, height: 720, frameRate: 29.97, facingMode: 'user' },
      { width: { max: 4000 }, height: { max: 3000 } } as Partial<MediaTrackCapabilities>,
      'camera2 1, facing front',
    );
    expect(text).toBe('Delivered 1280\u00d7720 \u00b7 30 fps \u00b7 user \u00b7 max offered 4000\u00d73000 \u00b7 camera2 1, facing front');
  });

  it('degrades gracefully when the browser reports nothing', () => {
    expect(describeCameraStream(null)).toBe('Delivered size unknown');
    expect(describeCameraStream({})).toBe('Delivered size unknown');
  });
});

describe('focus reporting and request', () => {
  it('shows focus info only when reported', () => {
    expect(describeCameraStream({ width: 1, height: 2, focusMode: 'continuous' } as never)).toBe('Delivered 1\u00d72 \u00b7 focus continuous');
    expect(describeCameraStream({ width: 1, height: 2 }, { focusMode: ['manual', 'continuous'] } as never)).toBe('Delivered 1\u00d72 \u00b7 focus modes manual/continuous');
  });
  it('requests continuous focus only when listed and not already on', () => {
    expect(continuousFocusConstraint({}, { focusMode: ['manual', 'continuous'] } as never)).not.toBeNull();
    expect(continuousFocusConstraint({ focusMode: 'continuous' } as never, { focusMode: ['continuous'] } as never)).toBeNull();
    expect(continuousFocusConstraint({}, { focusMode: ['manual'] } as never)).toBeNull();
    expect(continuousFocusConstraint({}, {})).toBeNull();
    expect(continuousFocusConstraint(null, null)).toBeNull();
  });
});
