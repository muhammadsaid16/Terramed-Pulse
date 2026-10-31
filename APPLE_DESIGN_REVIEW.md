# Apple Design Compliance Review — TerraPulse (Stay & Build Egypt)

Scope: UI layer (`src/`, `src/components/`, `src/components/ui/`, `src/index.css`, `tailwind.config.js`). Reviewed against Apple's fluid-interface principles (response, direct manipulation, interruptibility, momentum, boundaries, translucent materials, typography, reduced motion) and the Apple HIG fundamentals (clarity, deference, depth, feedback, etc.).

## Summary

The codebase is already *styled* in an Apple-adjacent direction (rounded-full pills, backdrop-blur chrome, SF-Pro-fallback font stack, `active:scale-95`, segmented control, translucent header, dark materials). The gaps are mostly **motion-system depth** and **accessibility of motion**, not visual styling. Overall grade: **B+** — strong visual craft, weak interruptibility/momentum and no global reduced-motion handling (now fixed).

## What's Already Good

- **Translucent materials**: header uses `backdrop-blur-2xl` with semi-opaque backgrounds; modals use `backdrop-blur-md`; leaflet controls themed for light/dark. ✅
- **Typography foundations**: Inter/Cairo with SF Pro fallback; `tracking-tight` on titles; `letter-spacing: -0.011em` on html; size-specific tracking on satellite chips. ✅
- **Feedback on press**: `active:scale-95` / `active:scale-[0.98]` on buttons and chips (pointer-down feedback). ✅
- **Segmented control** with sliding-ish active state and `ease-[cubic-bezier(0.2,0,0,1)]`. ✅
- **Motion-reduce awareness in components**: `dialog.jsx` and `card.jsx` use `motion-reduce:animate-none` / `motion-reduce:transform-none`. ✅
- **Bilingual RTL**: `dir="rtl"` toggled, `rtl:space-x-reverse`, `rtl:left-4`, Arabic font. ✅
- **Focus rings**: `focus-visible:ring-2 ring-sky-500/50` on buttons/tabs. ✅
- **Interruptible CSS transitions** (duration-based) are inherently redirectable. ✅

## Gaps & Recommendations (prioritized)

### P0 — Accessibility of motion (FIXED)
- **No global `prefers-reduced-motion` handling.** Only `NumberTicker` checked the media query; infinite animations (marquee, `apple-pulse`, border-beam) ran regardless. **Fixed** by adding a global `@media (prefers-reduced-motion: reduce)` block in `src/index.css` that collapses durations/iterations. Marquee and pulse now stop for affected users.

### P1 — Reduced-motion *strategy*, not just disabling
- Apple guidance: under reduced motion, **cross-fade, don't slide/spring**. The blanket rule makes everything instant, which is acceptable but loses the fade. Consider adding `motion-reduce:transition-opacity` opt-ins on hero/section entrances so content still fades in. Low effort.

### P2 — No spring physics / momentum
- No spring library in `package.json` (no framer-motion/Motion). All motion is `transition-all duration-*` with CSS easings. This is fine for simple UI but means:
  - **No interruptible spring hand-off** when a user grabs a moving element (none exist today, so low risk).
  - **No momentum projection** on swipe/drag. The only drag-like surface is the `Slider` (native range input) and the map (Leaflet). Sliders update via `onChange` with a 75ms bar transition — acceptable.
  - If you add sheets/drawers later, use a spring library (Motion/Framer) and hand off release velocity; don't build with CSS keyframes alone.

### P3 — Direct manipulation gaps
- `Slider` thumb uses `transition-transform duration-100 ease-out` on the thumb while the bar uses `duration-75`. Slight mismatch; unify to one duration token. Also the thumb's `left` is a CSS transition, so it lags the pointer during fast drags — consider driving thumb position directly from the input (no transition) for 1:1 tracking, reserving transitions for hover/focus.
- Map markers (`marker-pulse-ring`) are decorative infinite animations; fine, but should pause under reduced motion (handled by P0).

### P4 — Boundary / rubber-band behavior
- No rubber-band resistance anywhere (drawers, scroll limits). Not currently needed; note for future sheet/modal work.

### P5 — Typography optical sizing
- Inter is loaded as a variable-ish family but only discrete weights (300–800). Apple uses optical sizes (`opsz`). Consider loading `Inter` with `opsz` axis (`font-variation-settings`) for large display text. Minor.

### P6 — Latency / response
- Modal open uses `animate-in zoom-in-95 fade-in` (Tailwind animate plugin) — instant feedback ✅.
- `scrollIntoView({ behavior: 'smooth' })` on tab change is fine but can feel laggy; consider `behavior: 'auto'` when reduced motion. Already covered by blanket rule? `scroll-behavior: auto` set on html under reduced motion ✅.
- Theme/language toggles are synchronous state updates ✅.

### P7 — Feedback completeness
- Four feedback kinds (status/completion/warning/error): the app has sync-status badge and form validation, but inline validation on the physician form should be verified (not audited here). Recommend a pass.

### P8 — Wayfinding
- Mobile menu is a conditional render (`{mobileMenuOpen && …}`) with `animate-fadeIn`, not a slide sheet. Acceptable. Could add slide + backdrop for stronger spatial cue.

## Quick wins applied

1. Global `prefers-reduced-motion` handling in `src/index.css`.
2. **P1 — reduced-motion cross-fade:** `.modal-spring` now fades in (150ms opacity) instead of collapsing to instant under reduced motion.
3. **P3 — Slider 1:1 + press feedback:** fill bar transition removed (`transition-none`) so it tracks the pointer exactly; thumb press feedback fixed — `active:scale-125` never fired on the `pointer-events-none` thumb, now `peer-active:scale-125` + `peer-hover:scale-110` off the real input.
4. **Motion tokens wired in:** `scrollBehavior()` from `src/lib/motionTokens.js` now drives all six `scrollIntoView` calls (`App.jsx` ×4, `Header.jsx`, `WizardModal.jsx`) — smooth scroll, `auto` under reduced motion.
5. **P5 — Optical sizing:** Inter loads with its `opsz` axis (`index.html`) and `font-optical-sizing: auto` is set on `html` in `src/index.css`.
6. **Reduced transparency / high contrast:** new `@media (prefers-reduced-transparency: reduce)` and `(prefers-contrast: more)` blocks flatten `backdrop-blur` chrome to solid surfaces (blur off, solid bg, defined border).

## Suggested next steps (remaining)

- P2: if sheets/drawers with drag gestures are added, adopt a spring library (Motion/Framer) with velocity hand-off and momentum projection — CSS transitions won't interrupt cleanly.
- P4: rubber-band resistance for future gesture-driven surfaces.
- P7: inline-validation pass on the physician form.
- P8: mobile menu could slide + dim with a backdrop for stronger spatial cueing.

## Files touched

- `src/index.css` — reduced-motion block (+ modal cross-fade), reduced-transparency & high-contrast blocks, `font-optical-sizing`.
- `src/components/ui/slider.jsx` — 1:1 fill tracking, `peer` press/hover feedback on thumb.
- `src/lib/motionTokens.js` — new (durations, easings, springs, reduced-motion helpers); now imported.
- `src/App.jsx`, `src/components/Header.jsx`, `src/components/WizardModal.jsx` — `scrollBehavior()` wired into `scrollIntoView`.
- `index.html` — Inter loaded with `opsz,wght` variable axes.
