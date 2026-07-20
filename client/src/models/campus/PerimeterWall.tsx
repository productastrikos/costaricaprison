import React, { useEffect, useMemo } from 'react';
import { createConcreteMaterial, createSecurityFenceMaterial } from '../../materials/campusMaterials';
import {
  CAMPUS_HALF_WIDTH,
  CAMPUS_HALF_DEPTH,
  WALL_HEIGHT,
  WALL_THICKNESS,
  GATE_CENTER_X,
  GATE_WIDTH,
  Point2,
  segmentBox,
  mergeStatic,
} from '../../utils/campusGeometry';

const NW: Point2 = { x: -CAMPUS_HALF_WIDTH, z: -CAMPUS_HALF_DEPTH };
const NE: Point2 = { x: CAMPUS_HALF_WIDTH, z: -CAMPUS_HALF_DEPTH };
const SE: Point2 = { x: CAMPUS_HALF_WIDTH, z: CAMPUS_HALF_DEPTH };
const SW: Point2 = { x: -CAMPUS_HALF_WIDTH, z: CAMPUS_HALF_DEPTH };
const GATE_LEFT: Point2 = { x: GATE_CENTER_X - GATE_WIDTH / 2, z: CAMPUS_HALF_DEPTH };
const GATE_RIGHT: Point2 = { x: GATE_CENTER_X + GATE_WIDTH / 2, z: CAMPUS_HALF_DEPTH };

// South side is split in two so the main gate opening can sit between them.
const WALL_RUNS: Array<[Point2, Point2]> = [
  [NW, NE],
  [NE, SE],
  [SE, GATE_RIGHT],
  [GATE_LEFT, SW],
  [SW, NW],
];

/** High-security perimeter wall enclosing the campus, with a gate gap on the south side. */
export default function PerimeterWall() {
  const wallGeometry = useMemo(() => {
    const y = WALL_HEIGHT / 2;
    return mergeStatic(WALL_RUNS.map(([a, b]) => segmentBox(a, b, WALL_THICKNESS, WALL_HEIGHT, y)));
  }, []);

  const topperGeometry = useMemo(() => {
    const y = WALL_HEIGHT + 0.15;
    return mergeStatic(WALL_RUNS.map(([a, b]) => segmentBox(a, b, WALL_THICKNESS * 0.6, 0.3, y)));
  }, []);

  const concrete = useMemo(() => createConcreteMaterial(), []);
  const metal = useMemo(() => createSecurityFenceMaterial(), []);

  useEffect(() => () => {
    wallGeometry.dispose();
    topperGeometry.dispose();
    concrete.dispose();
    metal.dispose();
  }, [wallGeometry, topperGeometry, concrete, metal]);

  return (
    <group>
      <mesh geometry={wallGeometry} material={concrete} castShadow receiveShadow />
      <mesh geometry={topperGeometry} material={metal} castShadow />
    </group>
  );
}
