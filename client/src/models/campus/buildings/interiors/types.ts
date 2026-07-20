import { RoomKind } from './interiorMaterials';

/** A single named room, positioned in the building's local XZ (origin = building centre). */
export interface RoomSpec {
  id: string;
  label: string;
  kind: RoomKind;
  cx: number;
  cz: number;
  width: number;
  depth: number;
}

/** A run of identical small cells along one axis — rendered as merged geometry. */
export interface CellRowSpec {
  id: string;
  label: string;
  kind: RoomKind;
  count: number;
  /** Centre of the first cell. */
  startX: number;
  startZ: number;
  /** Per-cell offset. */
  stepX: number;
  stepZ: number;
  cellWidth: number;
  cellDepth: number;
}

/** A security gate: a barred divider drawn across a corridor. */
export interface GateSpec {
  id: string;
  cx: number;
  cz: number;
  width: number;
  along: 'x' | 'z';
}

export interface InteriorLayout {
  wallHeight: number;
  rooms: RoomSpec[];
  cellRows?: CellRowSpec[];
  gates?: GateSpec[];
}

/** Builds a layout scaled to the actual building footprint. */
export type InteriorBuilder = (width: number, depth: number, height: number) => InteriorLayout;
