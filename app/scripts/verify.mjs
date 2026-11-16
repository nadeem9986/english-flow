import puppeteer from 'puppeteer-core';

const BASE = 'http://localhost:4173/';
const OUT = '/tmp/shots';
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
page.on('console', (m) => {
  if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text());
});
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));

await page.goto(BASE, { waitUntil: 'networkidle0' });
await page.screenshot({ path: `${OUT}/1-home-empty.png` });

// Add the sample passage, then open it in the reader.
const buttons = await page.$$('button');
for (const b of buttons) {
  const label = await b.evaluate((el) => el.textContent);
  if (label?.includes('Add sample passage')) {
    await b.click();
    break;
  }
}
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${OUT}/2-scripts-list.png` });

await page.click('.script-open');
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: `${OUT}/3-reader-ready.png` });

// Start the countdown and let scrolling begin; countdown default is 3s.
const readerButtons = await page.$$('.controls button.primary');
if (readerButtons[0]) await readerButtons[0].click();
await new Promise((r) => setTimeout(r, 4200));
await page.screenshot({ path: `${OUT}/4-reader-playing.png` });

// Scrub to mid-passage to verify manual position control.
await page.$eval('.scrub input', (el) => {
  const input = el;
  input.value = '400';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${OUT}/5-reader-scrubbed.png` });

// Retell view.
for (const b of await page.$$('.controls button')) {
  const label = await b.evaluate((el) => el.textContent);
  if (label?.includes('Hide text')) {
    await b.click();
    break;
  }
}
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${OUT}/6-retell.png` });

// Back to scripts, open settings.
for (const b of await page.$$('button')) {
  const label = await b.evaluate((el) => el.textContent);
  if (label?.includes('Scripts')) {
    await b.click();
    break;
  }
}
await new Promise((r) => setTimeout(r, 300));
for (const b of await page.$$('.tab')) {
  const label = await b.evaluate((el) => el.textContent);
  if (label === 'Settings') {
    await b.click();
    break;
  }
}
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${OUT}/7-settings.png` });

// Light theme via the settings select.
await page.select('.settings select', 'light');
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${OUT}/8-light-theme.png` });

// Recordings tab (empty state).
for (const b of await page.$$('.tab')) {
  const label = await b.evaluate((el) => el.textContent);
  if (label === 'Recordings') {
    await b.click();
    break;
  }
}
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${OUT}/9-recordings.png` });

// Service worker registered?
const swState = await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) return 'unsupported';
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.active?.state ?? 'registered-no-active-yet' : 'none';
});
console.log('SERVICE WORKER:', swState);

await browser.close();
console.log('DONE');
