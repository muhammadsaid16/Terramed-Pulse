import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/home/zer0/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] });
const ctx = await browser.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
const page = await ctx.newPage();
await page.goto(process.env.APP_URL || 'http://127.0.0.1:5178/?theme=dark', { waitUntil:'networkidle' });
await page.waitForTimeout(2500);
const sel = process.argv[2]; const out = process.argv[3];
const el = await page.$(sel);
if (!el) { console.log('missing', sel); process.exit(1); }
await el.screenshot({ path: out });
console.log('ok', out);
await browser.close();
