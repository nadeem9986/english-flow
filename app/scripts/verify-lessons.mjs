import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4173/';
const OUT = '/tmp/shots-lessons';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text());
});

const clickByText = async (selector, text) => {
  const els = await page.$$(selector);
  for (const el of els) {
    const label = await el.evaluate((n) => n.textContent);
    if (label && label.includes(text)) {
      await el.click();
      return true;
    }
  }
  return false;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Pre-seed an existing user script, mimicking a user of the deployed v0.1.0.
await page.goto(BASE, { waitUntil: 'networkidle0' });
await page.evaluate(() => {
  const existing = [{ id: 'sample-welcome', name: 'Welcome passage', text: 'Reading aloud is one of the simplest ways to practise spoken English.', createdAt: 1, updatedAt: 1 }];
  localStorage.setItem('english-flow.scripts.v1', JSON.stringify(existing));
});
await page.reload({ waitUntil: 'networkidle0' });
await sleep(300);
await page.screenshot({ path: `${OUT}/1-home-with-lessons.png` });

const state1 = await page.evaluate(() => ({
  lessonNames: [...document.querySelectorAll('.lessons .script-name')].map((n) => n.textContent),
  userNames: [...document.querySelectorAll('.my-scripts .script-name')].map((n) => n.textContent),
  storedCount: JSON.parse(localStorage.getItem('english-flow.scripts.v1') || '[]').length,
}));
console.log('LESSONS SHOWN:', JSON.stringify(state1.lessonNames));
console.log('USER SCRIPTS:', JSON.stringify(state1.userNames), 'stored:', state1.storedCount);

// Open the first lesson straight from the list (no add step).
await clickByText('.lessons .script-open', 'Warm-up');
await sleep(600);
await page.screenshot({ path: `${OUT}/2-reader-lesson.png` });

// Start, let it scroll, pause.
await clickByText('.controls button.primary', 'Start');
await sleep(4200); // 3s countdown + ~1s scroll
await page.screenshot({ path: `${OUT}/3-reader-playing.png` });
await clickByText('.controls button.primary', 'Pause');
await sleep(300);

// Retell toggle.
await clickByText('button', 'Hide text');
await sleep(300);
await page.screenshot({ path: `${OUT}/4-retell.png` });
await clickByText('button', 'Show script');
await sleep(300);

// Back to scripts; reload; user data and lessons must both survive.
await clickByText('button', 'Scripts');
await sleep(300);
await page.reload({ waitUntil: 'networkidle0' });
await sleep(300);
const state2 = await page.evaluate(() => ({
  lessons: document.querySelectorAll('.lessons .script-name').length,
  userNames: [...document.querySelectorAll('.my-scripts .script-name')].map((n) => n.textContent),
  storedCount: JSON.parse(localStorage.getItem('english-flow.scripts.v1') || '[]').length,
  swControlled: !!navigator.serviceWorker?.controller,
}));
console.log('AFTER RELOAD:', JSON.stringify(state2));
await page.screenshot({ path: `${OUT}/5-after-reload.png` });

await browser.close();
console.log('DONE');
