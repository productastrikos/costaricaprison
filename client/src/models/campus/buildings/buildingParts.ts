import * as THREE from 'three';
import { bakeTransform, mergeStatic, segmentBox, Point2 } from '../../../utils/campusGeometry';

export interface WindowInstance {
  position: [number, number, number];
  rotationY: number;
}

function facadeRow(
  out: WindowInstance[],
  faceSpan: number,
  floors: number,
  floorHeight: number,
  rotationY: number,
  mapCoordToPos: (coord: number, y: number) => [number, number, number],
  spacing: number,
  margin: number,
) {
  const usable = faceSpan - margin * 2;
  if (usable <= 0) return;
  const cols = Math.max(1, Math.floor(usable / spacing) + 1);
  const step = cols > 1 ? usable / (cols - 1) : 0;
  for (let r = 0; r < floors; r++) {
    const y = floorHeight * (r + 0.85);
    for (let c = 0; c < cols; c++) {
      const coord = cols > 1 ? -usable / 2 + step * c : 0;
      out.push({ position: mapCoordToPos(coord, y), rotationY });
    }
  }
}

/** Window instances tiled across all four facades of a rectangular building. */
export function computeFacadeWindows(
  width: number,
  depth: number,
  height: number,
  floors: number,
  spacing = 3.4,
  margin = 1.8,
): WindowInstance[] {
  const windows: WindowInstance[] = [];
  const floorHeight = height / (floors + 0.6);
  const offset = 0.08;
  facadeRow(windows, width, floors, floorHeight, 0, (c, y) => [c, y, depth / 2 + offset], spacing, margin);
  facadeRow(windows, width, floors, floorHeight, Math.PI, (c, y) => [c, y, -(depth / 2 + offset)], spacing, margin);
  facadeRow(windows, depth, floors, floorHeight, Math.PI / 2, (c, y) => [width / 2 + offset, y, c], spacing, margin);
  facadeRow(windows, depth, floors, floorHeight, -Math.PI / 2, (c, y) => [-(width / 2 + offset), y, c], spacing, margin);
  return windows;
}

/** Flat roof slab + a raised parapet lip around the edge, sitting atop `baseY`. */
export function buildFlatRoof(
  width: number,
  depth: number,
  baseY: number,
): [slab: THREE.BufferGeometry, parapet: THREE.BufferGeometry] {
  const slab = bakeTransform(new THREE.BoxGeometry(width + 0.4, 0.4, depth + 0.4), [0, baseY + 0.2, 0]);
  const hw = width / 2;
  const hd = depth / 2;
  const corners: Point2[] = [
    { x: -hw, z: -hd }, { x: hw, z: -hd }, { x: hw, z: hd }, { x: -hw, z: hd }, { x: -hw, z: -hd },
  ];
  const parapetY = baseY + 0.4 + 0.4;
  const segs = corners.slice(0, 4).map((_, i) => segmentBox(corners[i], corners[i + 1], 0.3, 0.8, parapetY));
  return [slab, mergeStatic(segs)];
}

/** Simple gable (A-frame) roof as one extruded prism, ridge running along the X (width) axis. */
export function buildGableRoof(
  width: number,
  depth: number,
  baseY: number,
  pitch = Math.PI / 5.5,
  overhang = 0.6,
): THREE.BufferGeometry {
  const halfDepth = depth / 2 + overhang;
  const riseHeight = halfDepth * Math.tan(pitch);
  const extrudeWidth = width + overhang * 2;
  const shape = new THREE.Shape();
  shape.moveTo(-halfDepth, 0);
  shape.lineTo(0, riseHeight);
  shape.lineTo(halfDepth, 0);
  shape.lineTo(-halfDepth, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: extrudeWidth, bevelEnabled: false, curveSegments: 1 });
  geometry.translate(0, 0, -extrudeWidth / 2);
  geometry.rotateY(Math.PI / 2);
  return bakeTransform(geometry, [0, baseY, 0]);
}

export type Facade = 'north' | 'south' | 'east' | 'west';

/** A flush door panel centered on one facade at ground level. */
export function buildDoor(facade: Facade, width: number, depth: number, doorWidth = 1.8, doorHeight = 2.4): THREE.BufferGeometry {
  const offset = 0.1;
  let position: [number, number, number];
  let rotationY: number;
  switch (facade) {
    case 'south':
      position = [0, doorHeight / 2, depth / 2 + offset];
      rotationY = 0;
      break;
    case 'north':
      position = [0, doorHeight / 2, -(depth / 2 + offset)];
      rotationY = Math.PI;
      break;
    case 'east':
      position = [width / 2 + offset, doorHeight / 2, 0];
      rotationY = Math.PI / 2;
      break;
    default:
      position = [-(width / 2 + offset), doorHeight / 2, 0];
      rotationY = -Math.PI / 2;
  }
  return bakeTransform(new THREE.BoxGeometry(doorWidth, doorHeight, 0.18), position, [0, rotationY, 0]);
}
