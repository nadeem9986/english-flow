import puppeteer from 'puppeteer-core';

const BASE = 'http://localhost:4173/';
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
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
// Open Settings, then switch to Recordings: the settings panel must close.
await clickByText('.tab', 'Settings');
await new Promise((r) => setTimeout(r, 200));
await clickByText('.tab', 'Recordings');
await new Promise((r) => setTimeout(r, 300));
const settingsVisible = await page.$('.settings') !== null;
console.log('SETTINGS STILL OPEN AFTER TAB SWITCH:', settingsVisible);
await page.screenshot({ path: '/tmp/shots/14-recordings-clean.png' });

// Footer wording check.
const footer = await page.$eval('.app-footer', (el) => el.textContent);
console.log('FOOTER:', footer);
await browser.close();
console.log('DONE');
