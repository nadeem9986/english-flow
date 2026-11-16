import type { Script } from './types';

export interface Lesson {
  id: string;
  title: string;
  /** What the lesson practises and how to use it. Shown in the lesson list. */
  goal: string;
  /** Where the text comes from and why this technique is taught. */
  source: string;
  text: string;
}

/**
 * Built-in practice lessons. They live in the app bundle, open straight into
 * the reader, and are never written to the user's stored scripts, so updates
 * cannot duplicate or overwrite user data. Keep texts original or clearly
 * public domain, and describe teaching rationale without efficacy promises.
 */
export const LESSONS: Lesson[] = [
  {
    id: 'lesson-rainbow-warmup',
    title: 'Warm-up: The Rainbow Passage',
    goal: 'A balanced warm-up that moves through the sounds of English. Read at a comfortable pace; clear beats fast.',
    source:
      'Public-domain passage from Grant Fairbanks, Voice and Articulation Drillbook (1960), long used in speech research.',
    text: 'When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon.\n\nThere is, according to legend, a boiling pot of gold at one end. People look, but no one ever finds it. When a man looks for something beyond his reach, his friends say he is looking for the pot of gold at the end of the rainbow.',
  },
  {
    id: 'lesson-sound-contrasts',
    title: 'Sound contrasts',
    goal: 'Pairs of words that differ by one sound. Say each line slowly, then naturally. Record and listen for the difference.',
    source: 'Original practice lines using minimal pairs, a standard pronunciation-teaching technique.',
    text: 'The ship sailed past the sheep.\nHe wore a vest to the west.\nI think the sink is full.\nThe light feels right at night.\nThe fan cooled the van.\nA bad cold kept him in bed.\nPat bought a big bat.',
  },
  {
    id: 'lesson-stress-rhythm',
    title: 'Stress and rhythm',
    goal: 'English stresses the important words. Stress the CAPITAL words; keep the small words short and quick.',
    source: 'Original sentences; sentence-stress practice from standard English rhythm teaching.',
    text: 'I WANT to GO to the STORE.\nThe DOCtor SAID I should REST.\nCan you PASS me the SALT, please?\nWe WATCHED a MOvie on FRIday.\nI DECIDED to TAKE the EARlier TRAIN.\nWHAT TIME does the BANK CLOSE?',
  },
  {
    id: 'lesson-linking',
    title: 'Linking and flow',
    goal: 'Join a word\u2019s final consonant to the next vowel: "an apple" sounds like "a-napple". Aim for smooth, not fast.',
    source: 'Original sentences practising connected speech.',
    text: 'I ate an apple and an orange.\nTurn it off when you leave.\nFar away, the hills look blue.\nGo on, tell me about it.\nCome over at eight o\u2019clock.\nNot at all. I\u2019m glad you asked.',
  },
  {
    id: 'lesson-everyday-talk',
    title: 'Everyday talk',
    goal: 'Read it through twice, then hide the text and retell the story in your own words.',
    source: 'Original passage written for this app.',
    text: 'This morning I woke up early and made myself a cup of tea. The kitchen was quiet, and for a few minutes I just listened to the rain outside.\n\nThen my phone rang. It was an old friend, calling after almost a year. We talked about work, about cricket, and about a trip we want to take next winter.\n\nBefore we hung up, he said, "Don\u2019t wait another year to call." He was right. Some things should not wait.',
  },
];

/** A lesson opens in the reader like a script, without entering stored scripts. */
export function lessonToScript(lesson: Lesson): Script {
  return {
    id: lesson.id,
    name: lesson.title,
    text: lesson.text,
    createdAt: 0,
    updatedAt: 0,
  };
}
