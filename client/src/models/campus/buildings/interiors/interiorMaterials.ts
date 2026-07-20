import * as THREE from 'three';
import { makeStandard } from '../../../../materials/pbr';

/**
 * Room "kinds" drive floor colour so a layout reads clearly in the cutaway
 * view — circulation greys, secure/cell browns, medical greens, ER red, etc.
 * Floors use the shared polished floor-tile PBR preset; only the tint varies.
 */
export type RoomKind =
  | 'corridor'
  | 'cell'
  | 'security'
  | 'shared'
  | 'reception'
  | 'medical'
  | 'emergency'
  | 'pharmacy'
  | 'process'
  | 'holding';

const FLOOR_COLORS: Record<RoomKind, string> = {
  corridor: '#39424c',
  cell: '#463c3a',
  security: '#33454f',
  shared: '#464a3f',
  reception: '#4a4740',
  medical: '#3a4a44',
  emergency: '#5a3838',
  pharmacy: '#3f4a3a',
  process: '#454136',
  holding: '#413a46',
};

/** Polished institutional floor tile, tinted per room kind. */
export function createFloorMaterial(kind: RoomKind): THREE.MeshStandardMaterial {
  return makeStandard('floorTile', { color: FLOOR_COLORS[kind] });
}

/** Painted concrete-block interior partition wall. */
export function createPartitionMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('partition');
}

/** Security gates read as a distinct barred-metal colour with a warm glow. */
export function createGateMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#c9962e'),
    roughness: 0.4,
    metalness: 0.85,
    envMapIntensity: 1.0,
    emissive: new THREE.Color('#3a2c08'),
    emissiveIntensity: 0.4,
  });
}
