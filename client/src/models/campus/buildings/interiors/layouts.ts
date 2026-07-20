import { InteriorBuilder, RoomSpec, CellRowSpec, GateSpec } from './types';

/**
 * Realistic per-building interior layouts. All coordinates are in the
 * building's local space (origin = centre, +x east across the width,
 * +z south toward the entrance) and are derived from the actual footprint
 * so a layout rescales cleanly if a building's dimensions change.
 */

const MARGIN = 1.2;

function room(id: string, label: string, kind: RoomSpec['kind'], cx: number, cz: number, width: number, depth: number): RoomSpec {
  return { id, label, kind, cx, cz, width, depth };
}

/** Maximum Security Wing: isolation cells · main corridor · guard station · security room. */
export const buildMaxSecurityInterior: InteriorBuilder = (w, d) => {
  const usableW = w - MARGIN * 2;
  const cellCount = Math.max(8, Math.round(usableW / 6));
  const stepX = usableW / cellCount;
  const cells: CellRowSpec = {
    id: 'iso',
    label: 'Isolation Cell',
    kind: 'cell',
    count: cellCount,
    startX: -w / 2 + MARGIN + stepX / 2,
    startZ: -d / 2 + MARGIN + 2.75,
    stepX,
    stepZ: 0,
    cellWidth: stepX * 0.86,
    cellDepth: 5.5,
  };
  return {
    wallHeight: 2.6,
    rooms: [
      room('corridor', 'Main Corridor', 'corridor', 0, -0.25, usableW, 3),
      room('guard', 'Guard Station', 'security', -w * 0.18, d / 2 - MARGIN - 2.75, w * 0.22, 5.5),
      room('secroom', 'Security Room', 'security', w * 0.16, d / 2 - MARGIN - 2.75, w * 0.2, 5.5),
    ],
    cellRows: [cells],
  };
};

/** Cell Block: hallways · individual cells · shared day room · security gates. */
export const buildCellBlockInterior: InteriorBuilder = (w, d) => {
  const sharedDepth = 8;
  const hallHalf = 2;
  const sharedCz = d / 2 - MARGIN - sharedDepth / 2;
  const hallDepth = d - MARGIN * 2 - sharedDepth - 0.6;
  const hallCz = -d / 2 + MARGIN + hallDepth / 2;

  const cellCount = 4;
  const cellDepth = 4;
  const cellStepZ = (hallDepth - 1) / cellCount;
  const cellStartZ = hallCz - hallDepth / 2 + cellStepZ / 2 + 0.5;
  const sideX = w / 2 - MARGIN - (w / 2 - MARGIN - (hallHalf + 0.6)) / 2;
  const cellWidth = w / 2 - MARGIN - (hallHalf + 0.6);

  const west: CellRowSpec = {
    id: 'cells-w', label: 'Cell', kind: 'cell', count: cellCount,
    startX: -sideX, startZ: cellStartZ, stepX: 0, stepZ: cellStepZ,
    cellWidth, cellDepth,
  };
  const east: CellRowSpec = { ...west, id: 'cells-e', startX: sideX };

  const gates: GateSpec[] = [
    { id: 'gate-n', cx: 0, cz: hallCz - hallDepth / 2 + 0.4, width: hallHalf * 2, along: 'x' },
    { id: 'gate-s', cx: 0, cz: hallCz + hallDepth / 2 - 0.4, width: hallHalf * 2, along: 'x' },
  ];

  return {
    wallHeight: 2.6,
    rooms: [
      room('hall', 'Hallway', 'corridor', 0, hallCz, hallHalf * 2, hallDepth),
      room('shared', 'Shared Day Room', 'shared', 0, sharedCz, w - MARGIN * 2, sharedDepth),
    ],
    cellRows: [west, east],
    gates,
  };
};

/** Medical Wing: reception · examination rooms · pharmacy · emergency room. */
export const buildMedicalInterior: InteriorBuilder = (w, d) => {
  const usableW = w - MARGIN * 2;
  const examCount = 4;
  const examStep = usableW / examCount;
  const exam: CellRowSpec = {
    id: 'exam', label: 'Exam Room', kind: 'medical', count: examCount,
    startX: -w / 2 + MARGIN + examStep / 2, startZ: -d / 2 + MARGIN + 3,
    stepX: examStep, stepZ: 0, cellWidth: examStep * 0.88, cellDepth: 6,
  };
  return {
    wallHeight: 2.4,
    rooms: [
      room('pharmacy', 'Pharmacy', 'pharmacy', -w * 0.28, -0.5, w * 0.28, 6),
      room('er', 'Emergency Room', 'emergency', w * 0.26, -0.5, w * 0.32, 6),
      room('reception', 'Reception', 'reception', 0, d / 2 - MARGIN - 3.5, usableW * 0.55, 7),
    ],
    cellRows: [exam],
  };
};

/** Visitor Processing: visitor booths · security checkpoint · waiting area. */
export const buildVisitorInterior: InteriorBuilder = (w, d) => {
  const usableW = w - MARGIN * 2;
  const boothCount = 6;
  const boothStep = usableW / boothCount;
  const booths: CellRowSpec = {
    id: 'booths', label: 'Visitor Booth', kind: 'process', count: boothCount,
    startX: -w / 2 + MARGIN + boothStep / 2, startZ: -d / 2 + MARGIN + 3,
    stepX: boothStep, stepZ: 0, cellWidth: boothStep * 0.82, cellDepth: 6,
  };
  return {
    wallHeight: 2.4,
    rooms: [
      room('checkpoint', 'Security Checkpoint', 'security', 0, -d * 0.03, usableW, 3),
      room('waiting', 'Waiting Area', 'reception', 0, d / 2 - MARGIN - 4.5, usableW, 9),
    ],
    cellRows: [booths],
  };
};

/** Intake Processing: holding room · search area · registration. */
export const buildIntakeInterior: InteriorBuilder = (w, d) => {
  const usableW = w - MARGIN * 2;
  return {
    wallHeight: 2.4,
    rooms: [
      room('holding', 'Holding Room', 'holding', 0, -d / 2 + MARGIN + 4.5, usableW, 9),
      room('search', 'Search Area', 'process', 0, d * 0.06, usableW, 7),
      room('registration', 'Registration', 'reception', 0, d / 2 - MARGIN - 3.5, usableW, 7),
    ],
  };
};
