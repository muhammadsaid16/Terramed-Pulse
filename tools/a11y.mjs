import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/home/zer0/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] });

for (const theme of ['dark','light']) {
  const ctx = await browser.newContext({ viewport:{width:1440,height:900} });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:5178/?theme=${theme}`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);

  const report = await page.evaluate(() => {
    const out = { noName: [], smallTargets: [], lowContrast: [], headings: [] };

    // Interactive elements without an accessible name.
    const named = el => {
      const aria = el.getAttribute('aria-label');
      if (aria && aria.trim()) return true;
      const labelledby = el.getAttribute('aria-labelledby');
      if (labelledby) return true;
      if ((el.getAttribute('title')||'').trim()) return true;
      if (el.tagName === 'BUTTON' || el.tagName === 'A') {
        if ((el.textContent||'').trim()) return true;
      }
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
        if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return true;
        if (el.closest('label')) return true;
        if (el.getAttribute('placeholder')) return true;
        if (el.getAttribute('aria-label')) return true;
      }
      return false;
    };
    for (const el of document.querySelectorAll('button,a[href],input,select,textarea,[role="button"],[role="tab"]')) {
      if (!named(el)) out.noName.push((el.tagName+'.'+(el.className||'').slice(0,70)).slice(0,120));
    }

    // Touch targets under 32px.
    for (const el of document.querySelectorAll('button,a[href],input,select,textarea,[role="tab"]')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.height < 32 || r.width < 24) {
        out.smallTargets.push(`${el.tagName} ${Math.round(r.width)}x${Math.round(r.height)} "${(el.textContent||'').trim().slice(0,30)}"`);
      }
    }

    // Text contrast against the nearest painted ancestor background.
    const lum = ([r,g,b]) => { const f = c => { c/=255; return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4); }; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
    const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if(!m) return null; const p=m[1].split(',').map(x=>parseFloat(x)); return {rgb:[p[0],p[1],p[2]], a: p.length>3?p[3]:1}; };
    const bgOf = el => {
      let n = el;
      while (n && n !== document.documentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0.5) return c.rgb;
        n = n.parentElement;
      }
      const c = parse(getComputedStyle(document.body).backgroundColor);
      return c ? c.rgb : [255,255,255];
    };
    const seen = new Set();
    for (const el of document.querySelectorAll('p,span,div,h1,h2,h3,h4,a,li,dd,dt,button,label')) {
      const txt = [...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join('');
      if (!txt || txt.length < 2) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.4) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const fg = parse(cs.color); if (!fg) continue;
      const bg = bgOf(el);
      const L1 = lum(fg.rgb), L2 = lum(bg);
      const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
      const size = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight) >= 700;
      const large = size >= 24 || (size >= 18.66 && bold);
      const need = large ? 3 : 4.5;
      if (ratio < need) {
        const key = txt.slice(0,28)+'|'+ratio.toFixed(2);
        if (seen.has(key)) continue;
        seen.add(key);
        out.lowContrast.push(`ratio ${ratio.toFixed(2)} (need ${need}) size ${size}px "${txt.slice(0,42)}"`);
      }
    }

    const h = [...document.querySelectorAll('h1,h2,h3,h4')].map(x=>x.tagName+': '+(x.textContent||'').trim().slice(0,44));
    out.headings = h;
    return out;
  });

  console.log(`\n===== ${theme.toUpperCase()} =====`);
  console.log('interactive without accessible name:', report.noName.length);
  report.noName.slice(0,10).forEach(x=>console.log('   ', x));
  console.log('touch targets under 32px:', report.smallTargets.length);
  report.smallTargets.slice(0,10).forEach(x=>console.log('   ', x));
  console.log('text below WCAG AA:', report.lowContrast.length);
  report.lowContrast.slice(0,14).forEach(x=>console.log('   ', x));
  console.log('heading outline:');
  report.headings.forEach(x=>console.log('   ', x));
  await ctx.close();
}
await browser.close();
