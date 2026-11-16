import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4173/';
const OUT = '/tmp/shots';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));

const clickByText = async (selector, text) => {
  for (const el of await page.$$(selector)) {
    const label = await el.evaluate((n) => n.textContent);
    if (label?.includes(text)) {
      await el.click();
      return true;
    }
  }
  return false;
};

await page.goto(BASE, { waitUntil: 'networkidle0' });

// Force dark theme for the dark-mode check.
await clickByText('.tab', 'Settings');
await page.select('.settings select', 'dark');
await new Promise((r) => setTimeout(r, 300));

// Open sample passage in reader for a dark-theme reader shot.
await clickByText('.tab', 'Scripts');
await clickByText('button', 'Add sample passage');
await new Promise((r) => setTimeout(r, 300));
await page.click('.script-open');
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${OUT}/10-reader-dark.png` });

// Record a short scripted attempt with the fake mic.
await clickByText('.record-bar button', 'Record this attempt');
await new Promise((r) => setTimeout(r, 1800));
await page.screenshot({ path: `${OUT}/11-recording.png` });
await clickByText('.record-bar button', 'Stop');
await new Promise((r) => setTimeout(r, 800));

// Check it landed in the Recordings tab, then play it back.
await clickByText('button', 'Scripts');
await new Promise((r) => setTimeout(r, 300));
await clickByText('.tab', 'Recordings');
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: `${OUT}/12-recordings-saved.png` });
const recCount = await page.$$eval('.rec-item', (els) => els.length);
console.log('RECORDINGS FOUND:', recCount);
if (recCount > 0) {
  await clickByText('.rec-item button', 'Listen');
  await new Promise((r) => setTimeout(r, 800));
  const audioOk = await page.$eval('.rec-item audio', (a) => a.readyState >= 1 && isFinite(a.duration));
  console.log('AUDIO PLAYABLE:', audioOk);
  await page.screenshot({ path: `${OUT}/13-playing-back.png` });
}

// Reload: scripts + recording must persist.
await page.reload({ waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 400));
await clickByText('.tab', 'Recordings');
await new Promise((r) => setTimeout(r, 500));
const afterReload = await page.$$eval('.rec-item', (els) => els.length);
console.log('RECORDINGS AFTER RELOAD:', afterReload);

await browser.close();
console.log('DONE');
