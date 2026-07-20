import * as THREE from 'three';
import { bakeTransform, mergeStatic } from '../../../../utils/campusGeometry';

export const INTERIOR_FLOOR_Y = 0.05;
export const INTERIOR_WALL_THICKNESS = 0.16;

/** Thin floor slab for one room, centered on local origin. */
export function buildRoomFloorGeometry(width: number, depth: number): THREE.BufferGeometry {
  return new THREE.BoxGeometry(width, 0.06, depth);
}

/**
 * A four-wall partition ring around a room, merged into a single geometry
 * (one draw call). Corners are de-overlapped so opposite walls don't double up.
 */
export function buildRoomWallGeometry(
  width: number,
  depth: number,
  height: number,
  thickness = INTERIOR_WALL_THICKNESS,
): THREE.BufferGeometry {
  const y = height / 2;
  const north = bakeTransform(new THREE.BoxGeometry(width + thickness, height, thickness), [0, y, -depth / 2]);
  const south = bakeTransform(new THREE.BoxGeometry(width + thickness, height, thickness), [0, y, depth / 2]);
  const east = bakeTransform(new THREE.BoxGeometry(thickness, height, depth - thickness), [width / 2, y, 0]);
  const west = bakeTransform(new THREE.BoxGeometry(thickness, height, depth - thickness), [-width / 2, y, 0]);
  return mergeStatic([north, south, east, west]);
}
