import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/home/zer0/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] });
const ctx = await browser.newContext({ viewport:{width:1440,height:900} });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:5178/?theme=light', { waitUntil:'networkidle' });
await page.waitForTimeout(3000);
const legend = await page.evaluate(() => {
  const el = [...document.querySelectorAll('div')].find(d => d.textContent.includes('Critical Peak') || d.textContent.includes('peak') );
  const nodes = [...document.querySelectorAll('div.absolute.bottom-4.left-4')];
  if (!nodes.length) return 'legend not found';
  const cs = getComputedStyle(nodes[0]);
  return { bg: cs.backgroundColor, color: cs.color, cls: nodes[0].className };
});
console.log(JSON.stringify(legend, null, 1));
await browser.close();
