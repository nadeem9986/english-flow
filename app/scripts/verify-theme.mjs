import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
const BASE = process.env.BASE || 'http://localhost:4173/';
mkdirSync('/tmp/shots-theme', { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
const state = () => page.evaluate(() => `${document.documentElement.dataset.theme} stored=${localStorage.getItem('english-flow.settings.v1')}`);
const firstPaint = async (scheme) => {
  // data-theme at DOMContentLoaded, before React mounts
  await page.evaluateOnNewDocument(() => { document.addEventListener('DOMContentLoaded', () => { window.__early = document.documentElement.dataset.theme; }); });
};
await firstPaint();
for (const scheme of ['dark', 'light']) {
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  console.log(scheme, 'phone, fresh ->', await state(), '| early:', await page.evaluate(() => window.__early));
  await page.reload({ waitUntil: 'networkidle0' });
  console.log(scheme, 'phone, reload ->', await state());
  await page.screenshot({ path: `/tmp/shots-theme/${scheme}-phone-reload.png` });
}
// Dark phone: toggle to light (pins light), reload, toggle back to dark (should return to Follow phone).
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
await page.goto(BASE, { waitUntil: 'networkidle0' });
await page.click('.theme-toggle'); await sleep(300);
console.log('dark phone, toggled ->', await state());
await page.reload({ waitUntil: 'networkidle0' }); console.log('  reload ->', await state());
await page.click('.theme-toggle'); await sleep(300);
console.log('dark phone, toggled back ->', await state());
// Phone flips to light while on Follow phone: app follows live.
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]); await sleep(400);
console.log('phone flips to light live ->', await state());
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]); await sleep(400);
// Settings readout
const tabs = await page.$$('.tab'); for (const t of tabs) if ((await t.evaluate((n) => n.textContent)).includes('Settings')) await t.click();
await sleep(300);
console.log('readout:', await page.evaluate(() => document.querySelector('[aria-label="Theme details"]')?.textContent));
await page.screenshot({ path: '/tmp/shots-theme/settings-dark.png' });
await browser.close();
