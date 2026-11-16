import { describe, expect, it } from 'vitest';
import { CAMERA_CONSTRAINTS, cameraErrorMessage, isCameraSupported } from './camera';

describe('CAMERA_CONSTRAINTS', () => {
  it('asks for the front camera', () => {
    expect(CAMERA_CONSTRAINTS.video).toEqual({ facingMode: 'user' });
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
