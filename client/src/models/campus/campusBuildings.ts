import type { CameraPose } from '../../hooks/useSmoothCamera';
import {
  MAX_LAYOUT,
  BLOCK_A_LAYOUT,
  BLOCK_B_LAYOUT,
  BLOCK_C_LAYOUT,
  REC_LAYOUT,
  MED_LAYOUT,
  INTAKE_LAYOUT,
  VISITOR_LAYOUT,
} from './buildingLayout';

export type BuildingKind = 'housing' | 'medical' | 'admin' | 'yard';

export interface CampusBuildingInfo {
  id: string;
  label: string;
  kind: BuildingKind;
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
}

/**
 * Single source of truth for the campus's navigable buildings. Every
 * interactive system (click-to-focus, minimap, breadcrumb, highlight, hover
 * label) reads from this list rather than hardcoding per-building behaviour —
 * position/size come from the same layout constants the 3D components use.
 */
export const CAMPUS_BUILDINGS: CampusBuildingInfo[] = [
  { id: 'MAX', label: 'Maximum Security Wing', kind: 'housing', ...MAX_LAYOUT, height: 13 },
  { id: 'BLK-A', label: 'Cell Block A', kind: 'housing', ...BLOCK_A_LAYOUT, height: 11 },
  { id: 'BLK-B', label: 'Cell Block B', kind: 'housing', ...BLOCK_B_LAYOUT, height: 11 },
  { id: 'BLK-C', label: 'Cell Block C', kind: 'housing', ...BLOCK_C_LAYOUT, height: 11 },
  { id: 'REC', label: 'Recreation Yard', kind: 'yard', ...REC_LAYOUT, height: 3 },
  { id: 'MED', label: 'Medical Wing', kind: 'medical', ...MED_LAYOUT, height: 7.5 },
  { id: 'INT', label: 'Intake & Processing', kind: 'admin', ...INTAKE_LAYOUT, height: 7 },
  { id: 'VIS', label: 'Visitor Processing', kind: 'admin', ...VISITOR_LAYOUT, height: 7 },
];

export function getBuilding(id: string | null | undefined): CampusBuildingInfo | undefined {
  return id ? CAMPUS_BUILDINGS.find((b) => b.id === id) : undefined;
}

/**
 * Derives a framed 3/4 camera pose for a building from its footprint — so the
 * click-to-focus distance/angle is computed, never hardcoded per building.
 */
export function focusForBuilding(b: CampusBuildingInfo): CameraPose {
  const cy = b.height * 0.5;
  const span = Math.max(b.width, b.depth);
  const dist = span * 1.35 + b.height * 1.2 + 22;
  return {
    position: [b.position[0] + dist * 0.62, cy + dist * 0.7, b.position[2] + dist * 0.62],
    target: [b.position[0], cy, b.position[2]],
  };
}
