import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/home/zer0/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] });
const ctx = await browser.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:5178/?theme=dark', { waitUntil:'networkidle' });
await page.waitForTimeout(4000);
const el = await page.$('.bento-card.grid');
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
await el.screenshot({ path: '/tmp/opencode/shots/crop-kpi.png' });
const next = await page.evaluate(() => {
  const el = document.querySelector('.bento-card.grid');
  const sib = el.nextElementSibling;
  return sib ? sib.textContent.slice(0,200) : 'none';
});
console.log('next:', next);
await browser.close();
