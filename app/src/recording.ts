export const AUDIO_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
export const VIDEO_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4',
];

/** First supported container for the chosen kind, or '' to let the browser decide. */
export function pickRecordingMime(withVideo: boolean, isSupported: (t: string) => boolean): string {
  const list = withVideo ? VIDEO_TYPES : AUDIO_TYPES;
  return list.find((t) => isSupported(t)) ?? '';
}

export function isVideoMime(mime: string): boolean {
  return mime.startsWith('video/');
}

/** File extension for an exported recording. */
export function extForRecording(mime: string): string {
  const video = isVideoMime(mime);
  if (mime.includes('mp4')) return video ? 'mp4' : 'm4a';
  if (mime.includes('ogg')) return 'ogg';
  return 'webm';
}

/**
 * Microphone tracks plus the camera's live video track, in one stream for the
 * recorder. The camera hook keeps ownership of the video track, so callers
 * must stop only the audio tracks they opened.
 */
export function combineStream(audio: MediaStream, video: MediaStreamTrack | null): MediaStream {
  const s = new MediaStream(audio.getAudioTracks());
  if (video) s.addTrack(video);
  return s;
}
