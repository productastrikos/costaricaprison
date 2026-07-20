import React, { useEffect, useMemo } from 'react';
import { createSidewalkMaterial } from '../../materials/campusMaterials';
import { Point2, segmentBox, mergeStatic, CAMPUS_HALF_DEPTH, RING_ROAD_INSET } from '../../utils/campusGeometry';
import {
  BuildingLayout,
  MAX_LAYOUT,
  BLOCK_A_LAYOUT,
  BLOCK_B_LAYOUT,
  BLOCK_C_LAYOUT,
  REC_LAYOUT,
  MED_LAYOUT,
  INTAKE_LAYOUT,
  VISITOR_LAYOUT,
} from './buildingLayout';

const PATH_WIDTH = 1.4;
const PATH_Y = 0.045;

const south = (l: BuildingLayout): Point2 => ({ x: l.position[0], z: l.position[2] + l.depth / 2 });
const north = (l: BuildingLayout): Point2 => ({ x: l.position[0], z: l.position[2] - l.depth / 2 });
const west = (l: BuildingLayout): Point2 => ({ x: l.position[0] - l.width / 2, z: l.position[2] });
const east = (l: BuildingLayout): Point2 => ({ x: l.position[0] + l.width / 2, z: l.position[2] });

const ringSouthZ = CAMPUS_HALF_DEPTH - RING_ROAD_INSET;

const ROUTES: Array<[Point2, Point2]> = [
  // central spine: MAX -> Cell Block B -> Recreation Yard -> Intake -> vehicle ring road
  [south(MAX_LAYOUT), north(BLOCK_B_LAYOUT)],
  [south(BLOCK_B_LAYOUT), north(REC_LAYOUT)],
  [south(REC_LAYOUT), north(INTAKE_LAYOUT)],
  [south(INTAKE_LAYOUT), { x: INTAKE_LAYOUT.position[0], z: ringSouthZ }],
  // lateral connectors into the spine
  [south(BLOCK_A_LAYOUT), west(BLOCK_B_LAYOUT)],
  [south(BLOCK_C_LAYOUT), east(BLOCK_B_LAYOUT)],
  [south(MED_LAYOUT), west(INTAKE_LAYOUT)],
  [south(VISITOR_LAYOUT), east(INTAKE_LAYOUT)],
];

/** Sidewalk pathways linking every building's entrance into one connected network, tied into the vehicle road at Intake Processing. */
export default function BuildingPathways() {
  const geometry = useMemo(
    () => mergeStatic(ROUTES.map(([a, b]) => segmentBox(a, b, PATH_WIDTH, 0.05, PATH_Y))),
    [],
  );
  const material = useMemo(() => createSidewalkMaterial(), []);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return <mesh geometry={geometry} material={material} receiveShadow />;
}
