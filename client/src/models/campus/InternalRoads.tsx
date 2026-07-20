import React, { useEffect, useMemo } from 'react';
import { createAsphaltMaterial } from '../../materials/campusMaterials';
import {
  CAMPUS_HALF_WIDTH,
  CAMPUS_HALF_DEPTH,
  RING_ROAD_INSET,
  ROAD_WIDTH,
  ROAD_SURFACE_Y,
  GATE_CENTER_X,
  Point2,
  segmentBox,
  mergeStatic,
} from '../../utils/campusGeometry';

const ringHalfW = CAMPUS_HALF_WIDTH - RING_ROAD_INSET;
const ringHalfD = CAMPUS_HALF_DEPTH - RING_ROAD_INSET;

const RING_NW: Point2 = { x: -ringHalfW, z: -ringHalfD };
const RING_NE: Point2 = { x: ringHalfW, z: -ringHalfD };
const RING_SE: Point2 = { x: ringHalfW, z: ringHalfD };
const RING_SW: Point2 = { x: -ringHalfW, z: ringHalfD };

const GATE_POINT: Point2 = { x: GATE_CENTER_X, z: CAMPUS_HALF_DEPTH };
const SPINE_HUB: Point2 = { x: GATE_CENTER_X, z: RING_SE.z };

/** Perimeter patrol ring road plus a spine road connecting the main gate to the interior. */
export default function InternalRoads() {
  const geometry = useMemo(
    () =>
      mergeStatic([
        segmentBox(RING_NW, RING_NE, ROAD_WIDTH, 0.06, ROAD_SURFACE_Y),
        segmentBox(RING_NE, RING_SE, ROAD_WIDTH, 0.06, ROAD_SURFACE_Y),
        segmentBox(RING_SE, RING_SW, ROAD_WIDTH, 0.06, ROAD_SURFACE_Y),
        segmentBox(RING_SW, RING_NW, ROAD_WIDTH, 0.06, ROAD_SURFACE_Y),
        segmentBox(GATE_POINT, SPINE_HUB, ROAD_WIDTH, 0.06, ROAD_SURFACE_Y),
      ]),
    [],
  );
  const material = useMemo(() => createAsphaltMaterial(), []);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return <mesh geometry={geometry} material={material} receiveShadow />;
}
