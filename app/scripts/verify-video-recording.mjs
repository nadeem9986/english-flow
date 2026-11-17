import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4173/';
const OUT = '/tmp/shots-video';
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const click = async (page, sel, text) => {
  for (const el of await page.$$(sel)) {
    const t = await el.evaluate((n) => n.textContent);
    if (t && t.includes(text)) { await el.click(); return true; }
  }
  return false;
};

for (const scheme of ['light', 'dark']) {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await click(page, '.lessons .script-open', 'Warm-up');
  await sleep(400);
  console.log(scheme, 'record-with-camera before camera on (want none):', await click(page, 'button', 'Record with camera'));
  await click(page, '.controls button', 'Camera');
  await sleep(1500);
  await page.evaluate(() => { window.__vt = document.querySelector('.camera-feed').srcObject.getVideoTracks()[0]; });
  console.log(scheme, 'clicked Record with camera:', await click(page, 'button', 'Record with camera'));
  await sleep(2500);
  await page.screenshot({ path: `${OUT}/${scheme}-recording.png` });
  const camBtnDisabled = await page.evaluate(() => [...document.querySelectorAll('.controls button')].find((b) => /Camera/.test(b.textContent))?.disabled);
  console.log(scheme, 'camera toggle disabled while recording (want true):', camBtnDisabled);
  await click(page, '.record-bar button', 'Stop');
  await sleep(1500);
  const after = await page.evaluate(() => ({
    previewTrackLive: window.__vt.readyState,
    micEnded: 'n/a',
  }));
  console.log(scheme, 'camera track after stop (want live):', after.previewTrackLive);
  // Inspect saved record in IndexedDB.
  const rec = await page.evaluate(() => new Promise((res) => {
    indexedDB.databases().then(async (dbs) => {
      const out = [];
      for (const d of dbs) {
        await new Promise((r2) => {
          const q = indexedDB.open(d.name);
          q.onsuccess = () => {
            const db = q.result; const names = [...db.objectStoreNames];
            if (!names.length) return r2();
            const t = db.transaction(names, 'readonly');
            let pending = names.length;
            names.forEach((n) => {
              const g = t.objectStore(n).getAll();
              g.onsuccess = () => { out.push({ store: n, items: g.result.map((x) => (x instanceof Blob ? { blob: x.type, size: x.size } : x)) }); if (--pending === 0) r2(); };
            });
          };
        });
      }
      res(out);
    });
  }));
  console.log(scheme, 'IndexedDB:', JSON.stringify(rec));
  // Turn camera off: all tracks should end.
  await click(page, '.controls button', 'Camera off');
  await sleep(500);
  console.log(scheme, 'camera track after Camera off (want ended):', await page.evaluate(() => window.__vt.readyState));
  // Replay in Recordings.
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await click(page, 'button', 'Recordings');
  await sleep(500);
  console.log(scheme, 'Watch clicked:', await click(page, '.rec-item button', 'Watch'));
  await sleep(2500);
  const play = await page.evaluate(() => {
    const v = document.querySelector('video.rec-video');
    if (!v) return { present: false };
    return { present: true, duration: v.duration, time: v.currentTime, w: v.videoWidth, h: v.videoHeight, err: v.error?.message ?? null, paused: v.paused };
  });
  console.log(scheme, 'playback:', JSON.stringify(play));
  await page.screenshot({ path: `${OUT}/${scheme}-playback.png` });
  await browser.close();
}
