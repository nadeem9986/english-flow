export interface Script {
  id: string;
  name: string;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export type ThemeChoice = 'light' | 'dark' | 'system';

export interface Settings {
  wpm: number;
  fontSize: number;
  lineHeight: number;
  theme: ThemeChoice;
  countdownSeconds: number;
}

export const DEFAULT_SETTINGS: Settings = {
  wpm: 130,
  fontSize: 28,
  lineHeight: 1.6,
  theme: 'system',
  countdownSeconds: 3,
};

export type RecordingKind = 'scripted' | 'retell';

export interface RecordingMeta {
  id: string;
  scriptId: string | null;
  scriptName: string;
  kind: RecordingKind;
  createdAt: number;
  durationMs: number;
  mimeType: string;
  /** True when the recording also holds the camera video. Absent on older audio-only recordings. */
  hasVideo?: boolean;
}
