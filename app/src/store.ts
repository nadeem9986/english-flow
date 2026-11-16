import type { Script, Settings } from './types';
import { DEFAULT_SETTINGS } from './types';

const SCRIPTS_KEY = 'english-flow.scripts.v1';
const SETTINGS_KEY = 'english-flow.settings.v1';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadScripts(): Script[] {
  const scripts = safeParse<Script[]>(localStorage.getItem(SCRIPTS_KEY), []);
  return Array.isArray(scripts) ? scripts : [];
}

export function saveScripts(scripts: Script[]): void {
  localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
}

export function loadSettings(): Settings {
  const stored = safeParse<Partial<Settings>>(localStorage.getItem(SETTINGS_KEY), {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Seconds to read the text at the given words-per-minute. */
export function readingDurationSeconds(words: number, wpm: number): number {
  if (words <= 0) return 0;
  const safeWpm = Math.max(20, wpm);
  return words / (safeWpm / 60);
}
