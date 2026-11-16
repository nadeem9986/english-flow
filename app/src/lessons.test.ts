import { describe, expect, it } from 'vitest';
import { LESSONS, lessonToScript } from './lessons';
import { wordCount } from './store';

describe('LESSONS', () => {
  it('has unique, stable-looking ids', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^lesson-[a-z0-9-]+$/);
  });

  it('every lesson has a title, goal, source and enough practice text', () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(4);
    for (const l of LESSONS) {
      expect(l.title.trim().length).toBeGreaterThan(0);
      expect(l.goal.trim().length).toBeGreaterThan(0);
      expect(l.source.trim().length).toBeGreaterThan(0);
      expect(wordCount(l.text)).toBeGreaterThanOrEqual(20);
    }
  });

  it('makes no efficacy promises in user-visible copy', () => {
    for (const l of LESSONS) {
      const copy = `${l.title} ${l.goal} ${l.source} ${l.text}`.toLowerCase();
      expect(copy).not.toMatch(/proven|guarantee|accent-free|perfect pronunciation/);
    }
  });
});

describe('lessonToScript', () => {
  it('maps lesson fields onto a readable script without storing it', () => {
    for (const l of LESSONS) {
      const s = lessonToScript(l);
      expect(s.id).toBe(l.id);
      expect(s.name).toBe(l.title);
      expect(s.text).toBe(l.text);
    }
  });
});
