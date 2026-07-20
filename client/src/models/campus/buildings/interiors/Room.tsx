import React, { useEffect, useMemo } from 'react';
import { buildRoomFloorGeometry, buildRoomWallGeometry, INTERIOR_FLOOR_Y } from './roomGeometry';
import { createFloorMaterial, createPartitionMaterial, RoomKind } from './interiorMaterials';

export interface RoomProps {
  /** Kept for a later labelling phase; not rendered yet. */
  label?: string;
  kind: RoomKind;
  cx: number;
  cz: number;
  width: number;
  depth: number;
  wallHeight: number;
}

/**
 * Reusable interior room: a coloured floor tile inside a low partition-wall
 * ring. Two meshes; only mounted while its building is selected, so the mesh
 * count stays bounded.
 */
export default function Room({ kind, cx, cz, width, depth, wallHeight }: RoomProps) {
  const floorGeometry = useMemo(() => buildRoomFloorGeometry(width, depth), [width, depth]);
  const wallGeometry = useMemo(() => buildRoomWallGeometry(width, depth, wallHeight), [width, depth, wallHeight]);
  const floorMaterial = useMemo(() => createFloorMaterial(kind), [kind]);
  const wallMaterial = useMemo(() => createPartitionMaterial(), []);

  useEffect(() => () => {
    floorGeometry.dispose();
    wallGeometry.dispose();
    floorMaterial.dispose();
    wallMaterial.dispose();
  }, [floorGeometry, wallGeometry, floorMaterial, wallMaterial]);

  return (
    <group position={[cx, INTERIOR_FLOOR_Y, cz]}>
      <mesh geometry={floorGeometry} material={floorMaterial} receiveShadow />
      <mesh geometry={wallGeometry} material={wallMaterial} castShadow />
    </group>
  );
}
