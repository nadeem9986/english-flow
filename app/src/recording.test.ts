import { describe, expect, it } from 'vitest';
import { extForRecording, isVideoMime, pickRecordingMime } from './recording';

describe('recording helpers', () => {
  it('picks a video container when video is requested', () => {
    const ok = (t: string) => t === 'video/webm;codecs=vp8,opus' || t === 'audio/webm';
    expect(pickRecordingMime(true, ok)).toBe('video/webm;codecs=vp8,opus');
    expect(pickRecordingMime(false, ok)).toBe('audio/webm');
  });
  it('returns empty when nothing is supported', () => {
    expect(pickRecordingMime(true, () => false)).toBe('');
  });
  it('never picks a video type for audio-only recording', () => {
    expect(pickRecordingMime(false, (t) => t.startsWith('video/'))).toBe('');
  });
  it('detects video and names exports', () => {
    expect(isVideoMime('video/webm;codecs=vp9,opus')).toBe(true);
    expect(isVideoMime('audio/webm')).toBe(false);
    expect(extForRecording('video/mp4')).toBe('mp4');
    expect(extForRecording('audio/mp4')).toBe('m4a');
    expect(extForRecording('video/webm')).toBe('webm');
    expect(extForRecording('audio/ogg')).toBe('ogg');
  });
});
