/**
 * Reusable, time-based motion primitives for the Digital Twin.
 *
 * Every function here is a pure function of *elapsed time* (seconds) — never of
 * a frame counter — so animation speed is identical regardless of frame rate or
 * how many frames have been drawn. Components feed these from a `useFrame`
 * callback (`state.clock.elapsedTime`) and apply the result to a ref, keeping
 * the actual behaviours (sweeping cameras, sliding gates, blinking lights,
 * walking figures) declarative and shared rather than re-implemented per model.
 */

export const TWO_PI = Math.PI * 2;

/** Clamp to [lo, hi]. */
export function clamp(v: number, lo = 0, hi = 1): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Smooth C¹ ease in/out over t ∈ [0,1]. */
export function easeInOutCubic(t: number): number {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Wrap `t` into the half-open unit interval [0,1), handling negatives. */
export function unitPhase(t: number): number {
  return ((t % 1) + 1) % 1;
}

export interface OscillateOptions {
  /** Angular-ish speed (radians of sine argument per second). */
  speed?: number;
  /** Peak deviation from `center`. */
  amplitude?: number;
  /** Constant phase offset (radians) — stagger identical movers. */
  phase?: number;
  /** Value the oscillation is centred on. */
  center?: number;
}

/** Continuous sine oscillation — panning cameras, sweeping searchlights, sway. */
export function oscillate(elapsed: number, opts: OscillateOptions = {}): number {
  const { speed = 1, amplitude = 1, phase = 0, center = 0 } = opts;
  return center + Math.sin(elapsed * speed + phase) * amplitude;
}

export interface PulseOptions {
  speed?: number;
  min?: number;
  max?: number;
  phase?: number;
}

/** Smoothly breathes between `min` and `max` — glowing lamps, soft indicators. */
export function pulse(elapsed: number, opts: PulseOptions = {}): number {
  const { speed = 1, min = 0, max = 1, phase = 0 } = opts;
  const s = 0.5 + 0.5 * Math.sin(elapsed * speed + phase);
  return min + (max - min) * s;
}

export interface StrobeOptions {
  /** Full on+off cycle length (seconds). */
  period?: number;
  /** Fraction of the period spent "on" (0..1). */
  duty?: number;
  /** Phase offset as a fraction of the period. */
  phase?: number;
}

/** Hard on/off blink → 1 while on, 0 while off. Beacons, alarm strobes. */
export function strobe(elapsed: number, opts: StrobeOptions = {}): number {
  const { period = 1, duty = 0.5, phase = 0 } = opts;
  return unitPhase(elapsed / period + phase) < duty ? 1 : 0;
}

export interface OpenCloseOptions {
  /** Full closed→open→closed cycle length (seconds). */
  period?: number;
  /** Fraction of the cycle held fully open. */
  openHold?: number;
  /** Fraction of the cycle held fully closed. */
  closedHold?: number;
  /** Phase offset as a fraction of the period. */
  phase?: number;
}

/**
 * Eased 0→1 "openness" on a repeating dwell cycle: hold closed, ease open,
 * hold open, ease closed. Drives anything that opens and shuts on a timer —
 * sliding gates, prison doors, boom barriers — from a single shared curve.
 */
export function openCloseCycle(elapsed: number, opts: OpenCloseOptions = {}): number {
  const { period = 12, openHold = 0.25, closedHold = 0.25, phase = 0 } = opts;
  const travel = Math.max(1e-4, (1 - openHold - closedHold) / 2);
  const t = unitPhase(elapsed / period + phase);

  const openStart = closedHold;
  const openEnd = closedHold + travel;
  const holdEnd = openEnd + openHold;
  const closeEnd = holdEnd + travel;

  if (t < openStart) return 0;
  if (t < openEnd) return easeInOutCubic((t - openStart) / travel);
  if (t < holdEnd) return 1;
  if (t < closeEnd) return 1 - easeInOutCubic((t - holdEnd) / travel);
  return 0;
}

/**
 * Exponential smoothing toward a target, frame-rate independent (uses `delta`,
 * not a fixed per-frame factor). Handy for easing headings/positions so movers
 * turn and settle naturally. `rate` ≈ how quickly it converges (per second).
 */
export function damp(current: number, target: number, rate: number, delta: number): number {
  return lerp(current, target, 1 - Math.exp(-rate * delta));
}
