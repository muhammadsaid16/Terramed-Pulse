/**
 * Rewrite opacity-suffixed token classes into a form Tailwind v3 compiles.
 *
 * `bg-[color:var(--panel)]/90` produces NO rule at all in Tailwind v3: an
 * opacity modifier cannot be applied to an arbitrary var() color. The element
 * silently ends up with no background, which is why the map legend and every
 * translucent panel were rendering transparent.
 *
 * The channel form `bg-[rgb(var(--panel-rgb)/0.9)]` does compile, and gives the
 * same colour with the intended alpha.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

const TOKENS = [
  'bg',
  'bg-deep',
  'panel',
  'panel-2',
  'ink',
  'ink-2',
  'muted',
  'line',
  'line-strong',
  'accent',
  'accent-bright'
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
let rewrites = 0;

for (const file of walk(SRC)) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;

  for (const token of TOKENS) {
    // `dark:bg-[color:var(--panel)]/[0.05]` and `bg-[color:var(--panel)]/90`
    const bracket = new RegExp(
      `(\\bdark:)?(bg|text|border|ring|divide|outline|fill|stroke|from|via|to|shadow)-\\[color:var\\(--${token}\\)\\]/(\\[?[0-9.]+\\]?)`,
      'g'
    );
    after = after.replace(bracket, (match, dark, prefix, alpha) => {
      const a = alpha.replace(/[\[\]]/g, '');
      rewrites += 1;
      return `${dark || ''}${prefix}-[rgb(var(--${token}-rgb)/${a})]`;
    });
  }

  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}

console.log(`rewrote ${rewrites} opacity-suffixed token classes across ${changed} files`);
