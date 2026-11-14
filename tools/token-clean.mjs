/**
 * Second pass of the token migration.
 *
 * The first pass left the redundant dark-mode overlays that used to carry the
 * meaning on their own (`dark:bg-white/[0.02]`, `dark:border-white/[0.06]`).
 * Now that every element has a token base class, those overlays are a second,
 * different palette speaking over the first one. Remove them where a token
 * class already sits in the same attribute, and move the few raw `bg-white` /
 * `bg-slate-900` surfaces onto tokens.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

// Dark overlays that are now redundant next to a token base class.
const REDUNDANT = [
  'dark:bg-white/[0.02]', 'dark:bg-white/[0.03]', 'dark:bg-white/[0.04]',
  'dark:bg-white/[0.05]', 'dark:bg-white/[0.06]', 'dark:bg-white/10',
  'dark:border-white/[0.04]', 'dark:border-white/[0.05]', 'dark:border-white/[0.06]',
  'dark:border-white/[0.08]', 'dark:border-white/[0.12]', 'dark:border-white/10',
  'dark:border-white/15', 'dark:border-white/20',
  'dark:text-white/40', 'dark:text-white/45', 'dark:text-white/50',
  'dark:text-white/60', 'dark:text-white/70', 'dark:text-white/80', 'dark:text-white/90'
];

// Raw surfaces that still need a token home.
const SURFACES = [
  ['bg-white/95 dark:bg-black/75', 'bg-[color:var(--panel)]/95 dark:bg-black/75'],
  ['bg-white/95 dark:bg-black/70', 'bg-[color:var(--panel)]/95 dark:bg-black/70'],
  ['bg-white/90 dark:bg-black/70', 'bg-[color:var(--panel)]/90 dark:bg-black/70'],
  ['bg-white/90 dark:bg-black/75', 'bg-[color:var(--panel)]/90 dark:bg-black/75'],
  ['bg-white/95 dark:bg-[#07090F]/90', 'bg-[color:var(--panel)]/95 dark:bg-[#07090F]/90'],
  ['bg-white/95 dark:bg-[#0E1320]', 'bg-[color:var(--panel)]/95 dark:bg-[#0E1320]'],
  ['bg-white/80 dark:bg-[#0c1222]/95', 'bg-[color:var(--panel)]/80 dark:bg-[#0c1222]/95'],
  ['bg-white/95 dark:bg-[#0c1222]/95', 'bg-[color:var(--panel)]/95 dark:bg-[#0c1222]/95'],
  ['bg-white/90 dark:bg-[#0c1222]/80', 'bg-[color:var(--panel)]/90 dark:bg-[#0c1222]/80'],
  ['bg-white/80 dark:bg-[#0a0f1d]/70', 'bg-[color:var(--panel)]/80 dark:bg-[#0a0f1d]/70'],
  ['bg-white dark:bg-[#0c1222]/80', 'bg-[color:var(--panel)] dark:bg-[#0c1222]/80'],
  ['bg-white dark:bg-[#0c1222]', 'bg-[color:var(--panel)] dark:bg-[#0c1222]'],
  ['bg-white dark:bg-black/40', 'bg-[color:var(--panel)] dark:bg-black/40'],
  ['bg-white dark:bg-[#0c101d]', 'bg-[color:var(--panel)] dark:bg-[#0c101d]'],
  ['bg-white', 'bg-[color:var(--panel)]'],
  ['bg-slate-900 dark:bg-white dark:text-black', 'bg-[color:var(--ink)] dark:bg-white dark:text-black'],
  ['bg-slate-900 text-white', 'bg-[color:var(--ink)] text-white'],
  ['bg-slate-900 text-white font-semibold', 'bg-[color:var(--ink)] text-white font-semibold'],
  ['bg-slate-900 text-white border-slate-900', 'bg-[color:var(--ink)] text-white border-[color:var(--ink)]'],
  ['bg-slate-900 text-emerald-400', 'bg-[color:var(--ink)] text-emerald-400'],
  ['bg-slate-900 text-white shadow-lg', 'bg-[color:var(--ink)] text-white shadow-lg']
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.jsx?$/.test(entry.name) && !/\.test\.mjs$/.test(entry.name)) out.push(full);
  }
  return out;
}

let changed = 0;
for (const file of walk(SRC)) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;

  after = after.replace(/(className=(?:"[^"]*"|'[^']*'|\{`[^`]*`\}))/g, (attr) => {
    let out = attr;
    for (const [from, to] of SURFACES) out = out.split(from).join(to);

    // Drop a redundant dark overlay only when a token class is already present
    // in the same attribute, so the element keeps exactly one palette.
    const hasToken = /\[[^\]]*var\(--/.test(out);
    if (hasToken) {
      for (const token of REDUNDANT) {
        out = out.replace(new RegExp(`\\s${token.replace(/[[\]/]/g, '\\$&')}`, 'g'), '');
      }
    }
    return out;
  });

  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}
console.log(`second pass rewrote ${changed} files`);
