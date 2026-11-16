import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4173/';
const OUT = '/tmp/shots-camera';
mkdirSync(OUT, { recursive: true });

const launch = (extraArgs = []) =>
  puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', ...extraArgs],
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const clickByText = async (page, selector, text) => {
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

// --- 1. Full camera flow with a fake front camera -------------------------
{
  const browser = await launch(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']);
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text());
  });

  // Existing user with a saved script.
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const existing = [{ id: 'sample-welcome', name: 'Welcome passage', text: 'Reading aloud is one of the simplest ways to practise spoken English.', createdAt: 1, updatedAt: 1 }];
    localStorage.setItem('english-flow.scripts.v1', JSON.stringify(existing));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(300);

  // Camera must NOT be requested before the user opts in.
  const earlyVideo = await page.$('.camera-feed');
  console.log('video before opt-in (want none):', !!earlyVideo);

  await clickByText(page, '.lessons .script-open', 'Warm-up');
  await sleep(400);
  const readerVideo = await page.$('.camera-feed');
  console.log('video on reader open (want none):', !!readerVideo);

  // Turn Camera mode on.
  await clickByText(page, '.controls button', 'Camera');
  await sleep(1500);
  const camState = await page.evaluate(() => {
    const v = document.querySelector('.camera-feed');
    if (!v || !v.srcObject) return { present: false };
    const tracks = v.srcObject.getTracks();
    return {
      present: true,
      readyState: v.readyState,
      videoTracks: v.srcObject.getVideoTracks().length,
      audioTracks: v.srcObject.getAudioTracks().length,
      trackLive: tracks.every((t) => t.readyState === 'live'),
      viewportClass: document.querySelector('.viewport').className,
    };
  });
  console.log('camera on:', JSON.stringify(camState));
  const t1 = await page.evaluate(() => document.querySelector('.camera-feed')?.currentTime ?? -1);
  await sleep(700);
  const t2 = await page.evaluate(() => document.querySelector('.camera-feed')?.currentTime ?? -1);
  console.log('preview advancing:', t1, '->', t2, t2 > t1 ? 'OK' : 'FAIL');

  // Read aloud over the camera: countdown + scrolling still work.
  await clickByText(page, '.controls button.primary', 'Start');
  await sleep(4200);
  await page.screenshot({ path: `${OUT}/1-camera-playing.png` });
  const playing = await page.evaluate(() => ({
    transform: document.querySelector('.content').style.transform,
    pressed: document.querySelector('[aria-pressed]')?.getAttribute('aria-pressed'),
  }));
  console.log('scrolling over camera:', JSON.stringify(playing));
  await clickByText(page, '.controls button.primary', 'Pause');
  await sleep(300);

  // Audio recording alongside the camera preview (separate opt-in).
  await clickByText(page, '.record-bar button', 'Record this attempt');
  await sleep(1800);
  const recState = await page.evaluate(() => ({
    recText: document.querySelector('.record-bar').textContent,
    camStillLive: [...(document.querySelector('.camera-feed')?.srcObject?.getTracks() ?? [])].every((t) => t.readyState === 'live'),
  }));
  console.log('recording alongside camera:', JSON.stringify(recState));
  await page.screenshot({ path: `${OUT}/2-camera-recording.png` });
  await clickByText(page, '.record-bar button', 'Stop');
  await sleep(800);

  // Keep track refs, then turn Camera off: hardware must actually stop.
  await page.evaluate(() => {
    window.__tracks = document.querySelector('.camera-feed').srcObject.getTracks();
  });
  await clickByText(page, '.controls button', 'Camera off');
  await sleep(400);
  const offState = await page.evaluate(() => ({
    videoGone: !document.querySelector('.camera-feed'),
    tracksEnded: window.__tracks.every((t) => t.readyState === 'ended'),
    pressed: document.querySelector('[aria-pressed]')?.getAttribute('aria-pressed'),
  }));
  console.log('camera off:', JSON.stringify(offState));

  // Back to scripts, reload: saved script survives, camera stays off.
  await clickByText(page, 'button', 'Scripts');
  await sleep(300);
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(300);
  const after = await page.evaluate(() => ({
    userNames: [...document.querySelectorAll('.my-scripts .script-name')].map((n) => n.textContent),
    lessons: document.querySelectorAll('.lessons .script-name').length,
    swControlled: !!navigator.serviceWorker?.controller,
  }));
  console.log('after reload:', JSON.stringify(after));
  await clickByText(page, '.lessons .script-open', 'Warm-up');
  await sleep(400);
  const postReloadVideo = await page.$('.camera-feed');
  console.log('camera auto-started after reload (want false):', !!postReloadVideo);

  // Light theme + camera: text must stay white over the dark scrim.
  await clickByText(page, 'button', 'Scripts');
  await sleep(200);
  await clickByText(page, '.tab', 'Settings');
  await sleep(200);
  await page.select('.settings select', 'light');
  await sleep(200);
  await clickByText(page, '.lessons .script-open', 'Warm-up');
  await sleep(400);
  await clickByText(page, '.controls button', 'Camera');
  await sleep(1200);
  await clickByText(page, '.controls button.primary', 'Start');
  await sleep(4200);
  await page.screenshot({ path: `${OUT}/3-camera-light-theme.png` });
  const lightCheck = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    textColor: getComputedStyle(document.querySelector('.viewport.camera-on .content p')).color,
  }));
  console.log('light theme camera:', JSON.stringify(lightCheck));
  await browser.close();
}

// --- 2. Denied permission: graceful fallback, reader unaffected -----------
{
  const browser = await launch(['--use-fake-device-for-media-stream']); // no fake-ui: prompt denied
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await sleep(300);
  await clickByText(page, '.lessons .script-open', 'Sound contrasts');
  await sleep(400);
  await clickByText(page, '.controls button', 'Camera');
  await sleep(1200);
  const denied = await page.evaluate(() => ({
    error: document.querySelector('.error')?.textContent ?? null,
    video: !!document.querySelector('.camera-feed'),
  }));
  console.log('denied path:', JSON.stringify(denied));
  await page.screenshot({ path: `${OUT}/4-camera-denied.png` });
  // Reader still fully works after denial.
  await clickByText(page, '.controls button.primary', 'Start');
  await sleep(4200);
  const moved = await page.evaluate(() => document.querySelector('.content').style.transform);
  console.log('reader works after denial, transform:', moved);
  await browser.close();
}

console.log('DONE');
