import * as THREE from 'three';
import { makeStandard, makeEmissive } from './pbr';

/**
 * Materials for the security elements (CCTV, searchlights, detectors, gates,
 * barriers, fence lights). All derived from the shared PBR presets in ./pbr —
 * no image textures. Emissive parts (lens, beams, indicator panels, lamps)
 * read against both day and night lighting.
 */

export function createCameraBodyMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('steel', { color: '#2b2e33', roughness: 0.5, metalness: 0.7 });
}

export function createLensMaterial(): THREE.MeshStandardMaterial {
  return makeEmissive('#2a0000', '#ff3b3b', 1.3, 0.2);
}

export function createHousingMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('steel', { color: '#3a3f45' });
}

export function createDetectorFrameMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('steel', { color: '#33373d', roughness: 0.55, metalness: 0.6 });
}

export function createDetectorPanelMaterial(): THREE.MeshStandardMaterial {
  return makeEmissive('#04121a', '#2fd6ff', 0.6, 0.4);
}

export function createFenceLightMaterial(): THREE.MeshStandardMaterial {
  return makeEmissive('#12161c', '#dfeaff', 0.5, 0.3);
}

/** Additive translucent cone used as the visible searchlight beam. */
export function createBeamMaterial(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color('#fff2c0'),
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

export function createStripeRedMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('paint', { color: '#c0392b', roughness: 0.55 });
}

export function createStripeWhiteMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('paint', { color: '#e7e7df' });
}

export function createBollardMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('paint', { color: '#e0b53a', roughness: 0.5 });
}

export function createGatePanelMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('steel', { color: '#5a626b' });
}
