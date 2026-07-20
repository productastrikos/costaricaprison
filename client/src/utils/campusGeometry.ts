import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Shared layout constants and geometry helpers for the prison campus.
 * Keeping these in one place lets every structure component (wall, roads,
 * towers, gate, ...) agree on the same footprint without duplicating math.
 */

export const CAMPUS_HALF_WIDTH = 95;
export const CAMPUS_HALF_DEPTH = 88;

export const WALL_HEIGHT = 6;
export const WALL_THICKNESS = 1.5;

export const RING_ROAD_INSET = 12;
export const ROAD_WIDTH = 6;
export const ROAD_SURFACE_Y = 0.03;

export const SIDEWALK_WIDTH = 1.6;
export const SIDEWALK_Y = 0.05;

export const GATE_CENTER_X = 28;
export const GATE_WIDTH = 18;

export interface Point2 {
  x: number;
  z: number;
}

// The facility's zone schematic (used across the rest of the app) is authored
// in a 0-100 percentage space, with the perimeter occupying x:[2,98] y:[2,94].
// These calibrate that space to the world units the Phase 2 wall was built in,
// so building placement lines up with the same layout everywhere else.
const SCHEMATIC_PERIMETER = { x: 2, y: 2, w: 96, h: 92 };
const GEO_SCALE_X = (CAMPUS_HALF_WIDTH * 2) / SCHEMATIC_PERIMETER.w;
const GEO_SCALE_Z = (CAMPUS_HALF_DEPTH * 2) / SCHEMATIC_PERIMETER.h;
const GEO_CENTER_X = SCHEMATIC_PERIMETER.x + SCHEMATIC_PERIMETER.w / 2;
const GEO_CENTER_Y = SCHEMATIC_PERIMETER.y + SCHEMATIC_PERIMETER.h / 2;

/** Converts a schematic percentage point (0-100) to world XZ. */
export function geoToWorld(xPct: number, yPct: number): Point2 {
  return {
    x: (xPct - GEO_CENTER_X) * GEO_SCALE_X,
    z: (yPct - GEO_CENTER_Y) * GEO_SCALE_Z,
  };
}

/** Converts a schematic percentage size (width/height) to world width/depth. */
export function geoSizeToWorld(wPct: number, hPct: number): { width: number; depth: number } {
  return { width: wPct * GEO_SCALE_X, depth: hPct * GEO_SCALE_Z };
}

/**
 * Bakes a position/rotation/scale into a geometry's vertices so many parts
 * can be merged into one draw call while still being authored as simple
 * local-space primitives.
 */
export function bakeTransform(
  geometry: THREE.BufferGeometry,
  position: [number, number, number] = [0, 0, 0],
  rotation: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
): THREE.BufferGeometry {
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    new THREE.Vector3(...scale),
  );
  geometry.applyMatrix4(matrix);
  return geometry;
}

/** Merges pre-transformed geometries into a single mesh (one draw call). */
export function mergeStatic(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  return mergeGeometries(geometries, false);
}

/**
 * A flat box spanning from point `a` to point `b`, oriented along that
 * segment — the building block for straight wall/road/sidewalk runs.
 */
export function segmentBox(
  a: Point2,
  b: Point2,
  crossWidth: number,
  riseHeight: number,
  centerY: number,
): THREE.BufferGeometry {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(-dz, dx);
  const geometry = new THREE.BoxGeometry(length, riseHeight, crossWidth);
  return bakeTransform(geometry, [(a.x + b.x) / 2, centerY, (a.z + b.z) / 2], [0, angle, 0]);
}

/** Samples evenly spaced points along a polyline — used to place lighting poles. */
export function samplePolyline(points: Point2[], spacing: number): Point2[] {
  const result: Point2[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const length = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.round(length / spacing));
    for (let s = 0; s <= steps; s++) {
      if (i > 0 && s === 0) continue; // shared with previous segment's endpoint
      const t = s / steps;
      result.push({ x: a.x + dx * t, z: a.z + dz * t });
    }
  }
  return result;
}
