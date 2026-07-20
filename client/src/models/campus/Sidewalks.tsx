import React, { useEffect, useMemo } from 'react';
import { createSidewalkMaterial } from '../../materials/campusMaterials';
import {
  CAMPUS_HALF_DEPTH,
  RING_ROAD_INSET,
  ROAD_WIDTH,
  SIDEWALK_WIDTH,
  SIDEWALK_Y,
  GATE_CENTER_X,
  Point2,
  segmentBox,
  mergeStatic,
} from '../../utils/campusGeometry';

const SPINE_NORTH_Z = CAMPUS_HALF_DEPTH - RING_ROAD_INSET;
const OFFSET = ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2 + 0.4;

const LEFT_TOP: Point2 = { x: GATE_CENTER_X - OFFSET, z: CAMPUS_HALF_DEPTH };
const LEFT_BOTTOM: Point2 = { x: GATE_CENTER_X - OFFSET, z: SPINE_NORTH_Z };
const RIGHT_TOP: Point2 = { x: GATE_CENTER_X + OFFSET, z: CAMPUS_HALF_DEPTH };
const RIGHT_BOTTOM: Point2 = { x: GATE_CENTER_X + OFFSET, z: SPINE_NORTH_Z };

/** Pedestrian sidewalks flanking the entrance spine road. */
export default function Sidewalks() {
  const geometry = useMemo(
    () =>
      mergeStatic([
        segmentBox(LEFT_TOP, LEFT_BOTTOM, SIDEWALK_WIDTH, 0.05, SIDEWALK_Y),
        segmentBox(RIGHT_TOP, RIGHT_BOTTOM, SIDEWALK_WIDTH, 0.05, SIDEWALK_Y),
      ]),
    [],
  );
  const material = useMemo(() => createSidewalkMaterial(), []);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return <mesh geometry={geometry} material={material} receiveShadow />;
}
