import {
  CAMPUS_HALF_WIDTH,
  CAMPUS_HALF_DEPTH,
  RING_ROAD_INSET,
  GATE_CENTER_X,
  Point2,
} from '../../../utils/campusGeometry';
import { MED_LAYOUT, VISITOR_LAYOUT } from '../buildingLayout';
import { OpenCloseOptions } from '../../../animation/motion';

/**
 * Placement + timing data for the animated campus activity. Kept separate from
 * the components (mirroring securityLayout.ts) so routes and schedules are
 * data-driven off the shared campus constants, not hardcoded in animation code.
 */

const ringHalfW = CAMPUS_HALF_WIDTH - RING_ROAD_INSET;
const ringHalfD = CAMPUS_HALF_DEPTH - RING_ROAD_INSET;

/** Foot patrol loop — the inner edge of the perimeter ring road. */
const footInset = 2.5;
export const PATROL_LOOP: Point2[] = [
  { x: -ringHalfW + footInset, z: -ringHalfD + footInset },
  { x: ringHalfW - footInset, z: -ringHalfD + footInset },
  { x: ringHalfW - footInset, z: ringHalfD - footInset },
  { x: -ringHalfW + footInset, z: ringHalfD - footInset },
];

/**
 * Vehicle entry loop: a jeep waits outside, is admitted through the main gate,
 * drives one lap of the perimeter ring road (which is clear of buildings) and
 * exits again. Start/end coincide outside the gate so a phase-locked mover parks
 * there while the gate is shut. Both perimeter crossings fall inside the
 * gate-open window (see GATE_CYCLE), and the whole route stays on the road.
 */
export const ENTRY_LOOP: Point2[] = [
  { x: GATE_CENTER_X, z: CAMPUS_HALF_DEPTH + 26 }, // waiting outside the gate
  { x: GATE_CENTER_X, z: CAMPUS_HALF_DEPTH - 2 }, // through the gate
  { x: GATE_CENTER_X, z: ringHalfD }, // spine hub (south ring)
  { x: ringHalfW, z: ringHalfD }, // SE corner
  { x: ringHalfW, z: -ringHalfD }, // NE corner
  { x: -ringHalfW, z: -ringHalfD }, // NW corner
  { x: -ringHalfW, z: ringHalfD }, // SW corner
  { x: GATE_CENTER_X, z: ringHalfD }, // back to the hub
  { x: GATE_CENTER_X, z: CAMPUS_HALF_DEPTH - 2 }, // back out through the gate
];

/**
 * Shared open/close schedule for the main gate AND the entry vehicle, so the
 * two stay in lockstep without prop-passing (both read the global clock). The
 * vehicle only crosses the perimeter while `openCloseCycle` is well open.
 */
export const GATE_CYCLE: Required<OpenCloseOptions> = {
  period: 20,
  closedHold: 0.34,
  openHold: 0.28,
  phase: 0,
};

/** Fraction-of-cycle window during which the entry vehicle drives its loop. */
export const ENTRY_WINDOW = { start: 0.4, end: 0.9 };

/* ── Visitor queue ──────────────────────────────────────────────────── */
const visX = VISITOR_LAYOUT.position[0];
const visSouthZ = VISITOR_LAYOUT.position[2] + VISITOR_LAYOUT.depth / 2;
/**
 * A single-file queue hugging the visitor wing's south wall and filing east→west
 * toward the entrance. `dir` points from the door toward the back of the line;
 * figures face the opposite way (toward the door). Kept between the wall and the
 * ring road so it never overlaps the road or the entry vehicle.
 */
export const VISITOR_QUEUE = {
  headX: visX,
  headZ: visSouthZ + 2.2,
  dir: { x: 1, z: 0 } as Point2,
  spacing: 1.6,
  count: 7,
  /** Seconds between shuffle-forward steps. */
  stepPeriod: 3.2,
};

/* ── Medical wing activity ──────────────────────────────────────────── */
const medX = MED_LAYOUT.position[0];
const medSouthZ = MED_LAYOUT.position[2] + MED_LAYOUT.depth / 2;
export const MEDICAL = {
  ambulance: { x: medX + 6, z: medSouthZ + 5, rotationY: Math.PI },
  crossSign: { x: medX, y: MED_LAYOUT.position[1] + 6, z: medSouthZ + 0.2 },
  /** Short stretcher-shuttle path: ambulance rear ⇄ wing door. */
  medicPath: [
    { x: medX + 6, z: medSouthZ + 3 },
    { x: medX, z: medSouthZ + 1.5 },
  ] as Point2[],
};
