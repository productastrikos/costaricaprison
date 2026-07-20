import * as THREE from 'three';
import { makeStandard, makeEmissive, makeGlass } from './pbr';

/**
 * Materials for the roaming patrol: correctional officers and police jeeps.
 * All derived from the shared PBR presets in ./pbr — no image textures.
 */

/* ── Officers ───────────────────────────────────────────────────────── */
export function createUniformMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('steel', { color: '#1b2a44', roughness: 0.85, metalness: 0.04 });
}
export function createSkinMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('paint', { color: '#b9825c', roughness: 0.78 });
}
export function createCapMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('steel', { color: '#101826', roughness: 0.8, metalness: 0.05 });
}

/* Civilian clothing — visitors queueing. Pass any shirt colour. */
export function createCivilianMaterial(color: string): THREE.MeshStandardMaterial {
  return makeStandard('paint', { color, roughness: 0.85 });
}
export const CIVILIAN_COLORS = ['#8c5a4a', '#4a5d6c', '#6b6f4a', '#7a4a63', '#5a6b5a', '#93794a', '#4a4f6b'];

/* ── Police jeeps ───────────────────────────────────────────────────── */
export function createJeepBodyMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('steel', { color: '#1d2b3f', roughness: 0.42, metalness: 0.55 });
}
export function createTireMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('asphalt', { color: '#14161a', roughness: 0.95, metalness: 0.0 });
}
export function createJeepGlassMaterial(): THREE.MeshPhysicalMaterial {
  return makeGlass('#2b3d4d');
}

/* Light-bar beacons — emissiveIntensity is animated to flash red/blue. */
export function createBeaconRedMaterial(): THREE.MeshStandardMaterial {
  return makeEmissive('#2a0000', '#ff2d2d', 1.2, 0.35);
}
export function createBeaconBlueMaterial(): THREE.MeshStandardMaterial {
  return makeEmissive('#001028', '#3b7bff', 1.2, 0.35);
}
/* Amber hazard/warning beacon — perimeter and rooftop blinkers. */
export function createBeaconAmberMaterial(): THREE.MeshStandardMaterial {
  return makeEmissive('#241400', '#ffb020', 1.2, 0.35);
}

/* ── Medical (ambulance + staff) ────────────────────────────────────── */
export function createAmbulanceBodyMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('paint', { color: '#eef2f4', roughness: 0.4, metalness: 0.2 });
}
export function createMedicCrossMaterial(): THREE.MeshStandardMaterial {
  return makeEmissive('#2a0000', '#ff3b3b', 1.0, 0.4);
}
export function createMedicUniformMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('paint', { color: '#0f8a7e', roughness: 0.8 });
}
export function createMedicCapMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('paint', { color: '#f4f6f7', roughness: 0.75 });
}
