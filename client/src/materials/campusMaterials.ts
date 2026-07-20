import * as THREE from 'three';
import { makeStandard, makeEmissive } from './pbr';

/**
 * Campus surface materials — thin wrappers over the shared PBR presets in
 * ./pbr so every structure component pulls consistent, physically-based
 * concrete / asphalt / steel / grass values. Factories (not singletons) so
 * each mesh owns disposable GPU resources.
 */

export function createConcreteMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('perimeterConcrete');
}

export function createAsphaltMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('asphalt');
}

/** Paved concrete tiles — sidewalks and building pathways. */
export function createSidewalkMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('concreteTile');
}

export function createGrassMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('grass');
}

export function createGravelMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('gravel');
}

/** Galvanised steel — lighting poles, gate barrier, watchtower trim. */
export function createMetalMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('steel');
}

/** Security fencing / razor-wire topper — darker, rougher steel panels. */
export function createSecurityFenceMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('securityFence');
}

export function createMarkingMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('paint');
}

export function createLampEmissiveMaterial(): THREE.MeshStandardMaterial {
  return makeEmissive('#fff2c8', '#ffdd88', 1.4);
}

export function createFoliageMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('foliage');
}

export function createBarkMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('bark');
}
