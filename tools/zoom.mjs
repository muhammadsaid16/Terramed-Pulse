import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/home/zer0/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] });
const ctx = await browser.newContext({ viewport:{width:1440,height:900} });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:5178/?theme=dark', { waitUntil:'networkidle' });
await page.waitForTimeout(2500);
const targets = process.argv.slice(2);
for (const t of targets) {
  const [id, name] = t.split('@');
  const el = await page.$(id);
  if (!el) { console.log('missing', id); continue; }
  await el.screenshot({ path:`/tmp/opencode/shots/${name}.png` });
  console.log('ok', name);
}
await browser.close();
