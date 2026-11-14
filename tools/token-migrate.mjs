/**
 * One-off migration: fold the legacy hardcoded Tailwind slate palette onto the
 * design tokens in index.css, so light and dark stop being two different sites.
 *
 * Rule: a "slate-NNN ... dark:text-white/NN" pair is one token in disguise.
 * Map it to the semantic token that already carries the intended hierarchy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');


// Ordered longest-first so a longer token is never eaten by a shorter one.
const PAIRS = [
  // ---- text: slate + dark:white pairs -------------------------------------
  ['text-slate-900 dark:text-white/95', 'text-[color:var(--ink)]'],
  ['text-slate-900 dark:text-white/90', 'text-[color:var(--ink)]'],
  ['text-slate-900 dark:text-white/80', 'text-[color:var(--ink)]'],
  ['text-slate-900 dark:text-white', 'text-[color:var(--ink)]'],
  ['text-slate-800 dark:text-white/90', 'text-[color:var(--ink)]'],
  ['text-slate-800 dark:text-white/85', 'text-[color:var(--ink)]'],
  ['text-slate-800 dark:text-white/80', 'text-[color:var(--ink)]'],
  ['text-slate-800 dark:text-white', 'text-[color:var(--ink)]'],
  ['text-slate-700 dark:text-white/80', 'text-[color:var(--ink-2)]'],
  ['text-slate-700 dark:text-white/75', 'text-[color:var(--ink-2)]'],
  ['text-slate-700 dark:text-white/70', 'text-[color:var(--ink-2)]'],
  ['text-slate-700 dark:text-white/60', 'text-[color:var(--ink-2)]'],
  ['text-slate-700 dark:text-white/50', 'text-[color:var(--ink-2)]'],
  ['text-slate-700 dark:text-white', 'text-[color:var(--ink-2)]'],
  ['text-slate-600 dark:text-white/80', 'text-[color:var(--ink-2)]'],
  ['text-slate-600 dark:text-white/70', 'text-[color:var(--ink-2)]'],
  ['text-slate-600 dark:text-white/60', 'text-[color:var(--ink-2)]'],
  ['text-slate-600 dark:text-white/50', 'text-[color:var(--ink-2)]'],
  ['text-slate-600 dark:text-white/45', 'text-[color:var(--ink-2)]'],
  ['text-slate-600 dark:text-white', 'text-[color:var(--ink-2)]'],
  ['text-slate-500 dark:text-white/60', 'text-[color:var(--muted)]'],
  ['text-slate-500 dark:text-white/50', 'text-[color:var(--muted)]'],
  ['text-slate-500 dark:text-white/45', 'text-[color:var(--muted)]'],
  ['text-slate-500 dark:text-white/40', 'text-[color:var(--muted)]'],
  ['text-slate-500 dark:text-white', 'text-[color:var(--muted)]'],
  ['text-slate-400 dark:text-white/35', 'text-[color:var(--muted)]'],
  ['text-slate-400 dark:text-white/20', 'text-[color:var(--muted)]'],
  ['text-slate-400 dark:text-white', 'text-[color:var(--muted)]'],
  ['text-slate-300 dark:text-white/30', 'text-[color:var(--muted)]'],

  // ---- text: slate only (light surface) ------------------------------------
  ['text-slate-900', 'text-[color:var(--ink)]'],
  ['text-slate-800', 'text-[color:var(--ink)]'],
  ['text-slate-700', 'text-[color:var(--ink-2)]'],
  ['text-slate-600', 'text-[color:var(--ink-2)]'],
  ['text-slate-500', 'text-[color:var(--muted)]'],
  ['text-slate-400', 'text-[color:var(--muted)]'],
  ['text-slate-300', 'text-[color:var(--muted)]'],

  // ---- borders -------------------------------------------------------------
  ['border-slate-200/90 dark:border-white/10', 'border-[color:var(--line-strong)]'],
  ['border-slate-200/90 dark:border-white/[0.08]', 'border-[color:var(--line-strong)]'],
  ['border-slate-200/90', 'border-[color:var(--line-strong)]'],
  ['border-slate-300/90 dark:border-white/10', 'border-[color:var(--line-strong)]'],
  ['border-slate-200/80 dark:border-white/[0.08]', 'border-[color:var(--line)]'],
  ['border-slate-200/80 dark:border-white/[0.06]', 'border-[color:var(--line)]'],
  ['border-slate-200/80 dark:border-white/[0.05]', 'border-[color:var(--line)]'],
  ['border-slate-200/80 dark:border-white/[0.04]', 'border-[color:var(--line)]'],
  ['border-slate-200/80', 'border-[color:var(--line)]'],
  ['border-slate-300 dark:border-white/10', 'border-[color:var(--line-strong)]'],
  ['border-slate-200 dark:border-white/10', 'border-[color:var(--line-strong)]'],
  ['border-slate-200 dark:border-white/[0.06]', 'border-[color:var(--line)]'],
  ['border-slate-200', 'border-[color:var(--line)]'],
  ['border-slate-300', 'border-[color:var(--line-strong)]'],
  ['border-slate-400', 'border-[color:var(--line-strong)]'],

  // ---- backgrounds ---------------------------------------------------------
  ['bg-slate-50 dark:bg-white/[0.03]', 'bg-[color:var(--panel-2)]'],
  ['bg-slate-50 dark:bg-white/[0.02]', 'bg-[color:var(--panel-2)]'],
  ['bg-slate-50', 'bg-[color:var(--panel-2)]'],
  ['bg-slate-100 dark:bg-white/[0.06]', 'bg-[color:var(--panel-2)]'],
  ['bg-slate-100 dark:bg-white/[0.04]', 'bg-[color:var(--panel-2)]'],
  ['bg-slate-100', 'bg-[color:var(--panel-2)]'],
  ['bg-slate-200/80 dark:bg-white/[0.08]', 'bg-[color:var(--line)]'],
  ['bg-slate-200/80 dark:bg-white/[0.06]', 'bg-[color:var(--line)]'],
  ['bg-slate-200/80', 'bg-[color:var(--line)]'],
  ['bg-slate-200 dark:bg-white/[0.06]', 'bg-[color:var(--line)]'],
  ['bg-slate-200', 'bg-[color:var(--line)]'],
  ['bg-white/70 dark:bg-white/[0.02]', 'bg-[color:var(--panel-2)]'],
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.jsx?$/.test(entry.name) && !/\.test\.mjs$/.test(entry.name)) out.push(full);
  }
  return out;
}

let changedFiles = 0;
const report = [];

for (const file of walk(SRC)) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;

  for (const [from, to] of PAIRS) {
    if (!after.includes(from)) continue;
    // Only rewrite inside className strings, so print styles and plain CSS
    // in .jsx files are never touched by accident.
    after = after.replace(/(className=(?:"[^"]*"|'[^']*'|\{`[^`]*`\}))/g, (attr) =>
      attr.split(from).join(to)
    );
  }

  if (after !== before) {
    fs.writeFileSync(file, after);
    changedFiles += 1;
    const beforeCount = (before.match(/text-slate-|border-slate-|bg-slate-|dark:text-white|dark:border-white|dark:bg-white/g) || []).length;
    const afterCount = (after.match(/text-slate-|border-slate-|bg-slate-|dark:text-white|dark:border-white|dark:bg-white/g) || []).length;
    report.push(`${path.relative(ROOT, file)}: ${beforeCount} -> ${afterCount}`);
  }
}

console.log(`rewrote ${changedFiles} files`);
console.log(report.join('\n'));
