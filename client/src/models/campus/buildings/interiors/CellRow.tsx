import React, { useEffect, useMemo } from 'react';
import { bakeTransform, mergeStatic } from '../../../../utils/campusGeometry';
import { buildRoomFloorGeometry, buildRoomWallGeometry, INTERIOR_FLOOR_Y } from './roomGeometry';
import { createFloorMaterial, createPartitionMaterial, RoomKind } from './interiorMaterials';

export interface CellRowProps {
  /** Kept for a later labelling phase; not rendered yet. */
  label?: string;
  kind: RoomKind;
  count: number;
  startX: number;
  startZ: number;
  stepX: number;
  stepZ: number;
  cellWidth: number;
  cellDepth: number;
  wallHeight: number;
}

/**
 * A run of identical cells (isolation cells, individual cells) along an axis.
 * All cell floors merge into one geometry and all cell walls into another —
 * two draw calls regardless of cell count, which keeps dense cell blocks cheap.
 */
export default function CellRow({
  kind,
  count,
  startX,
  startZ,
  stepX,
  stepZ,
  cellWidth,
  cellDepth,
  wallHeight,
}: CellRowProps) {
  const { floorGeometry, wallGeometry } = useMemo(() => {
    const floors = [];
    const walls = [];
    for (let i = 0; i < count; i++) {
      const x = startX + stepX * i;
      const z = startZ + stepZ * i;
      floors.push(bakeTransform(buildRoomFloorGeometry(cellWidth, cellDepth), [x, 0, z]));
      walls.push(bakeTransform(buildRoomWallGeometry(cellWidth, cellDepth, wallHeight), [x, 0, z]));
    }
    return { floorGeometry: mergeStatic(floors), wallGeometry: mergeStatic(walls) };
  }, [count, startX, startZ, stepX, stepZ, cellWidth, cellDepth, wallHeight]);

  const floorMaterial = useMemo(() => createFloorMaterial(kind), [kind]);
  const wallMaterial = useMemo(() => createPartitionMaterial(), []);

  useEffect(() => () => {
    floorGeometry.dispose();
    wallGeometry.dispose();
    floorMaterial.dispose();
    wallMaterial.dispose();
  }, [floorGeometry, wallGeometry, floorMaterial, wallMaterial]);

  return (
    <group position={[0, INTERIOR_FLOOR_Y, 0]}>
      <mesh geometry={floorGeometry} material={floorMaterial} receiveShadow />
      <mesh geometry={wallGeometry} material={wallMaterial} castShadow />
    </group>
  );
}
