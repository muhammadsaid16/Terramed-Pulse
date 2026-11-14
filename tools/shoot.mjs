import { chromium } from 'playwright-core';
import fs from 'node:fs';

const APP_URL = process.env.APP_URL || 'http://127.0.0.1:5178/';
const OUT = process.env.OUT_DIR || '/tmp/opencode/shots';
const only = process.argv[2] || 'all';

fs.mkdirSync(OUT, { recursive: true });

const shots = [
  { name: 'desktop-dark-hero', w: 1440, h: 900, theme: 'dark', full: false, y: 0 },
  { name: 'desktop-dark-full', w: 1440, h: 900, theme: 'dark', full: true },
  { name: 'desktop-light-hero', w: 1440, h: 900, theme: 'light', full: false, y: 0 },
  { name: 'desktop-light-full', w: 1440, h: 900, theme: 'light', full: true },
  { name: 'mobile-dark-hero', w: 390, h: 844, theme: 'dark', full: false, y: 0 },
  { name: 'mobile-dark-full', w: 390, h: 844, theme: 'dark', full: true },
  { name: 'rtl-hero', w: 1440, h: 900, theme: 'dark', full: false, y: 0, lang: 'ar' },
  { name: 'rtl-full', w: 1440, h: 900, theme: 'dark', full: true, lang: 'ar' },
  { name: 'tablet-dark-full', w: 820, h: 1180, theme: 'dark', full: true }
];

const browser = await chromium.launch({
  executablePath: '/home/zer0/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

const errors = [];

for (const s of shots) {
  if (only !== 'all' && !s.name.includes(only)) continue;
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 1
  });
  const page = await ctx.newPage();
  page.on('console', m => {
    if (m.type() === 'error') errors.push(`[${s.name}] ${m.text()}`);
  });
  page.on('pageerror', e => errors.push(`[${s.name}] pageerror: ${e.message}`));

  const url = new globalThis.URL(APP_URL);
  if (s.theme) url.searchParams.set('theme', s.theme);
  if (s.lang) url.searchParams.set('lang', s.lang);

  await page.goto(url.toString(), { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  if (s.y) await page.evaluate(y => window.scrollTo(0, y), s.y);
  await page.waitForTimeout(600);

  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.full });
  console.log('shot', s.name);
  await ctx.close();
}

await browser.close();
if (errors.length) {
  console.log('\n=== CONSOLE ERRORS ===');
  console.log([...new Set(errors)].join('\n'));
} else {
  console.log('\nno console errors');
}
