import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from './types';
import { readingDurationSeconds, wordCount } from './store';

describe('wordCount', () => {
  it('counts words across whitespace and newlines', () => {
    expect(wordCount('one two\nthree   four')).toBe(4);
  });

  it('returns 0 for empty text', () => {
    expect(wordCount('   ')).toBe(0);
  });
});

describe('readingDurationSeconds', () => {
  it('scales inversely with wpm', () => {
    expect(readingDurationSeconds(130, 130)).toBeCloseTo(60);
    expect(readingDurationSeconds(130, 65)).toBeCloseTo(120);
  });

  it('returns 0 for an empty script', () => {
    expect(readingDurationSeconds(0, DEFAULT_SETTINGS.wpm)).toBe(0);
  });

  it('clamps unusable wpm values', () => {
    expect(readingDurationSeconds(100, 0)).toBeCloseTo(readingDurationSeconds(100, 20));
  });
});
