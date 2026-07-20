import { geoToWorld, geoSizeToWorld } from '../../utils/campusGeometry';

/**
 * Default building footprints, mirrored from the same zone schematic
 * (percentage space) used across the rest of the app — so the Digital
 * Twin's buildings line up with the zone data in Security Ops, Incident
 * Management, etc. Each building component can still override these via
 * its own position/width/depth props.
 */
const ZONE_GEO = {
  MAX: { x: 15, y: 8, w: 70, h: 13 },
  BLK_A: { x: 8, y: 26, w: 24, h: 22 },
  BLK_B: { x: 38, y: 26, w: 24, h: 22 },
  BLK_C: { x: 68, y: 26, w: 24, h: 22 },
  REC: { x: 15, y: 52, w: 70, h: 9 },
  MED: { x: 8, y: 66, w: 26, h: 22 },
  INT: { x: 40, y: 66, w: 20, h: 22 },
  VIS: { x: 66, y: 66, w: 26, h: 22 },
} as const;

export interface BuildingLayout {
  position: [number, number, number];
  width: number;
  depth: number;
}

function layoutFor(geo: { x: number; y: number; w: number; h: number }, footprintRatio: number): BuildingLayout {
  const center = geoToWorld(geo.x + geo.w / 2, geo.y + geo.h / 2);
  const lot = geoSizeToWorld(geo.w, geo.h);
  return {
    position: [center.x, 0, center.z],
    width: lot.width * footprintRatio,
    depth: lot.depth * footprintRatio,
  };
}

// Buildings sit at ~70% of their allotted zone lot, leaving yard/setback
// margin; the recreation yard uses more of its lot since it's open ground.
export const MAX_LAYOUT = layoutFor(ZONE_GEO.MAX, 0.7);
export const BLOCK_A_LAYOUT = layoutFor(ZONE_GEO.BLK_A, 0.7);
export const BLOCK_B_LAYOUT = layoutFor(ZONE_GEO.BLK_B, 0.7);
export const BLOCK_C_LAYOUT = layoutFor(ZONE_GEO.BLK_C, 0.7);
export const REC_LAYOUT = layoutFor(ZONE_GEO.REC, 0.85);
export const MED_LAYOUT = layoutFor(ZONE_GEO.MED, 0.7);
export const INTAKE_LAYOUT = layoutFor(ZONE_GEO.INT, 0.7);
export const VISITOR_LAYOUT = layoutFor(ZONE_GEO.VIS, 0.7);
