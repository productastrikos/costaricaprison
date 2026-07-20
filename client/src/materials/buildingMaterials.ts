import * as THREE from 'three';
import { makeStandard, makeGlass } from './pbr';

/**
 * Building envelope materials, all sourced from the shared PBR presets in
 * ./pbr: concrete walls, brushed-metal doors, physically-based glass windows,
 * and metal-deck roofs. Wall/roof colours are per-building overrides.
 */

export function createWallMaterial(color: string): THREE.MeshStandardMaterial {
  return makeStandard('concreteWall', { color });
}

/** Physically-based glazing (MeshPhysicalMaterial) for window panes. */
export function createWindowMaterial(): THREE.MeshPhysicalMaterial {
  return makeGlass();
}

export function createDoorMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('metalDoor');
}

export function createRoofMaterial(color?: string): THREE.MeshStandardMaterial {
  return makeStandard('roofMetal', color ? { color } : {});
}
