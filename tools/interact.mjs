import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/home/zer0/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] });
const ctx = await browser.newContext({ viewport:{width:1440,height:900} });
const page = await ctx.newPage();
const errs=[];
page.on('pageerror', e => errs.push('pageerror: '+e.message));
page.on('console', m => { if (m.type()==='error') errs.push('console: '+m.text()); });
await page.goto('http://127.0.0.1:5178/?theme=dark', { waitUntil:'networkidle' });
await page.waitForTimeout(3000);

// Open the Guide wizard
await page.getByRole('button', { name: /Guide/i }).click();
await page.waitForTimeout(1200);
await page.screenshot({ path: '/tmp/opencode/shots/int-wizard.png' });
console.log('wizard opened');

// Apply a case if there's a button
const apply = page.getByRole('button', { name: /Apply|Apply Case|Apply Preset/i }).first();
if (await apply.count()) { await apply.click(); await page.waitForTimeout(2000); console.log('case applied'); }
await page.keyboard.press('Escape');
await page.waitForTimeout(900);
const stillOpen = await page.locator('.modal-overlay').count();
console.log('modal closed after Escape:', stillOpen === 0);

// Expand a provenance row
const prov = page.locator('#section-sources button').nth(0);
await prov.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await prov.click();
await page.waitForTimeout(800);
await page.locator('#section-sources').screenshot({ path: '/tmp/opencode/shots/int-sources-open.png' });
console.log('provenance expanded');

// Switch to light and check the map legend
await page.getByRole('button', { name: /Toggle Light/i }).click();
await page.waitForTimeout(1500);
await page.locator('#section-detective').screenshot({ path: '/tmp/opencode/shots/int-light-map.png' });
console.log('light map shot');

console.log('ERRORS:', errs.length ? [...new Set(errs)].join('\n') : 'none');
await browser.close();
