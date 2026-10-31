// Centralized motion tokens — Apple-style: nothing is random.
// Durations, easings and springs referenced instead of scattered literals.
export const DURATION = {
  instant: 0,
  fast: 100,
  base: 150,
  medium: 250,
  slow: 360,
};

export const EASE = {
  // Apple's default UI ease (decelerate)
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  // Emphasized decelerate for entrances
  decelerate: 'cubic-bezier(0.16, 1, 0.3, 1)',
  // Accelerate for exits
  accelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  // Spring-ish overshoot for momentum/flick
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export const SPRING = {
  // Critically damped, no overshoot (default UI)
  default: { damping: 1.0, response: 0.35 },
  // Under-damped, slight bounce (momentum/flick)
  flick: { damping: 0.8, response: 0.35 },
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');
