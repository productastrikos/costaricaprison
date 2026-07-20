import {
  CAMPUS_HALF_WIDTH,
  CAMPUS_HALF_DEPTH,
  WALL_HEIGHT,
  GATE_CENTER_X,
  GATE_WIDTH,
  RING_ROAD_INSET,
} from '../../../utils/campusGeometry';
import { INTAKE_LAYOUT, VISITOR_LAYOUT } from '../buildingLayout';

/**
 * Placement data for every security element. Kept separate from the
 * components so positions are data-driven (derived from the shared campus
 * constants), not hardcoded inside geometry code.
 */

export interface Mount {
  position: [number, number, number];
  rotationY: number;
}

const CAM_Y = WALL_HEIGHT - 0.5;
const inW = CAMPUS_HALF_WIDTH - 1.2;
const inD = CAMPUS_HALF_DEPTH - 1.2;

/** CCTV cameras on the inside of the perimeter wall, facing inward (+local Z). */
export const CAMERA_MOUNTS: Mount[] = [
  { position: [-45, CAM_Y, -inD], rotationY: 0 },
  { position: [45, CAM_Y, -inD], rotationY: 0 },
  { position: [-55, CAM_Y, inD], rotationY: Math.PI },
  { position: [62, CAM_Y, inD], rotationY: Math.PI },
  { position: [inW, CAM_Y, -40], rotationY: -Math.PI / 2 },
  { position: [inW, CAM_Y, 40], rotationY: -Math.PI / 2 },
  { position: [-inW, CAM_Y, -40], rotationY: Math.PI / 2 },
  { position: [-inW, CAM_Y, 40], rotationY: Math.PI / 2 },
];

/** Searchlights on top of the four corner watch towers (sweep across the yard). */
const towerInset = 2;
const TOWER_TOP_Y = 9.4;
export const SEARCHLIGHT_MOUNTS: Mount[] = [
  { position: [-CAMPUS_HALF_WIDTH + towerInset, TOWER_TOP_Y, -CAMPUS_HALF_DEPTH + towerInset], rotationY: Math.PI * 0.25 },
  { position: [CAMPUS_HALF_WIDTH - towerInset, TOWER_TOP_Y, -CAMPUS_HALF_DEPTH + towerInset], rotationY: -Math.PI * 0.25 },
  { position: [CAMPUS_HALF_WIDTH - towerInset, TOWER_TOP_Y, CAMPUS_HALF_DEPTH - towerInset], rotationY: -Math.PI * 0.75 },
  { position: [-CAMPUS_HALF_WIDTH + towerInset, TOWER_TOP_Y, CAMPUS_HALF_DEPTH - towerInset], rotationY: Math.PI * 0.75 },
];

/** Walk-through metal detectors at building entrances (south doors) and the pedestrian gate. */
export const METAL_DETECTORS: Mount[] = [
  { position: [INTAKE_LAYOUT.position[0], 0, INTAKE_LAYOUT.position[2] + INTAKE_LAYOUT.depth / 2 + 1.6], rotationY: 0 },
  { position: [VISITOR_LAYOUT.position[0], 0, VISITOR_LAYOUT.position[2] + VISITOR_LAYOUT.depth / 2 + 1.6], rotationY: 0 },
  { position: [GATE_CENTER_X - 8, 0, CAMPUS_HALF_DEPTH - 3], rotationY: 0 },
];

/** Sliding security gate panels closing the main vehicle entrance. */
export const MAIN_GATE_OPENING = {
  centerX: GATE_CENTER_X,
  z: CAMPUS_HALF_DEPTH,
  width: GATE_WIDTH,
};

/** Boom-barrier checkpoints on the entrance spine road (inside) and at the outer gate. */
export const CHECKPOINT_BARRIERS: Mount[] = [
  { position: [GATE_CENTER_X, 0, CAMPUS_HALF_DEPTH + 6], rotationY: 0 },
  { position: [GATE_CENTER_X, 0, CAMPUS_HALF_DEPTH - RING_ROAD_INSET - 6], rotationY: 0 },
];

/** Perimeter fence-light spacing (metres) along the top of the wall. */
export const FENCE_LIGHT_SPACING = 13;
export const FENCE_LIGHT_Y = WALL_HEIGHT + 0.2;
