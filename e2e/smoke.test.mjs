import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright-core';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const port = Number(process.env.E2E_PORT || 4173);
const base = `http://127.0.0.1:${port}`;

let server;
let browser;
let page;

function findChromium() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/brave-browser'
  ].filter(Boolean);

  const cache = path.join(os.homedir(), '.cache', 'ms-playwright');
  if (fs.existsSync(cache)) {
    for (const entry of fs.readdirSync(cache)) {
      if (!entry.startsWith('chromium-')) continue;
      for (const rel of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
        const candidate = path.join(cache, entry, rel);
        if (fs.existsSync(candidate)) candidates.push(candidate);
      }
    }
  }

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error('No Chromium executable found. Set CHROME_PATH to a Chromium binary.');
  }
  return found;
}

async function waitForServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Vite server did not start at ${base}`);
}

async function open(route) {
  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
}

before(async () => {
  server = spawn(
    process.execPath,
    [viteBin, '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    { cwd: root, stdio: 'ignore' }
  );
  await waitForServer();
  browser = await chromium.launch({
    executablePath: findChromium(),
    headless: true,
    args: ['--no-sandbox']
  });
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
});

after(async () => {
  await browser?.close();
  server?.kill('SIGTERM');
});

test('English KPI shows the 3-study evidence base', async () => {
  await open('/?lang=en&gov=aswan');
  await page.waitForFunction(
    () => document.body.innerText.includes('3 Peer-Reviewed Studies'),
    null,
    { timeout: 15000 }
  );
  const body = await page.locator('body').innerText();
  assert.match(body, /3 Peer-Reviewed Studies/);
  assert.doesNotMatch(body, /1,735|1,159/);
});

test('specialty switch updates Module 2 metrics', async () => {
  await open('/?lang=en&gov=aswan');
  await page.getByRole('button', { name: /Pulmonology/ }).first().click();
  await page.waitForFunction(
    () => {
      const section = document.querySelector('#section-doctor');
      return section && /Relative Priority Index: [1-9]\d* \/ 100/.test(section.innerText);
    },
    null,
    { timeout: 15000 }
  );
  const text = await page.locator('#section-doctor').innerText();
  assert.match(text, /Environmental Disease Burden Share: [1-9]\d*%/);
});

test('language toggle renders RTL Arabic and the ER-pressure metric', async () => {
  await open('/?lang=en&gov=aswan');
  await page.getByRole('button', { name: /عربي/ }).first().click();
  await page.waitForFunction(
    () =>
      document.documentElement.dir === 'rtl' &&
      document.body.innerText.includes('خفض ضغط الطوارئ المرتبط بالإجهاد المناخي'),
    null,
    { timeout: 20000 }
  );
  const body = await page.locator('body').innerText();
  assert.match(body, /خفض ضغط الطوارئ المرتبط بالإجهاد المناخي/);
});

test('governorate selection persists', async () => {
  await open('/?lang=en');
  const selector = page.locator('#section-detective select').first();
  await selector.waitFor({ state: 'visible' });
  await selector.selectOption('aswan');
  await page.waitForFunction(
    () => localStorage.getItem('terrapulse_selected_gov') === 'aswan',
    null,
    { timeout: 5000 }
  );
  assert.equal(await page.evaluate(() => localStorage.getItem('terrapulse_selected_gov')), 'aswan');
});

test('governorate comparison updates both cards', async () => {
  await open('/?lang=en');
  const section = page.locator('#section-compare');
  await section.waitFor({ state: 'visible' });
  await page.locator('#compare-a').selectOption('cairo');
  await page.locator('#compare-b').selectOption('aswan');
  await page.waitForFunction(
    () => {
      const el = document.querySelector('#section-compare');
      return el && el.innerText.includes('Cairo') && el.innerText.includes('Aswan');
    },
    null,
    { timeout: 5000 }
  );
  const text = await section.innerText();
  assert.match(text, /Higher need/);
});

test('methodology modal documents the ER model and 3 studies', async () => {
  await open('/?lang=en');
  const mathButton = page.getByRole('button', { name: /Methodology/ }).first();
  await mathButton.waitFor({ state: 'visible', timeout: 15000 });
  await mathButton.click();
  await page.waitForFunction(
    () => document.body.innerText.includes('Climate-Sensitive ER Pressure Model'),
    null,
    { timeout: 10000 }
  );
  const body = await page.locator('body').innerText();
  assert.match(body, /Three-Study Meta-Synthesis/);
  assert.match(body, /does not estimate absolute admissions/);
});

test('English print brief uses ER pressure and no absolute counts', async () => {
  await page.addInitScript(() => {
    window.print = () => { window.__printed = true; };
  });
  await open('/?lang=en&gov=aswan');
  await page.locator('button[title="Print Brief"]:visible').first().click();
  await page.waitForFunction(() => window.__printed === true, null, { timeout: 5000 });
  const printText = await page.locator('#print-executive-brief').textContent();
  assert.match(printText, /Climate-Sensitive ER Pressure Reduction/);
  assert.doesNotMatch(printText, /1,159|1,735/);
});

test('Arabic print brief renders RTL content and no absolute counts', async () => {
  await page.addInitScript(() => {
    window.print = () => { window.__printed = true; };
  });
  await open('/?lang=ar&gov=aswan');
  await page.locator('button[title="طباعة التقرير التنفيذي"]:visible').first().click();
  await page.waitForFunction(() => window.__printed === true, null, { timeout: 5000 });
  const printText = await page.locator('#print-executive-brief').textContent();
  assert.match(printText, /خفض ضغط الطوارئ المرتبط بالإجهاد المناخي/);
  assert.doesNotMatch(printText, /1,159|1,735/);
});
