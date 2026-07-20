import * as THREE from 'three';

/**
 * Single source of truth for the campus's physically-based materials.
 *
 * Every surface is defined once as a {@link PBRPreset} (albedo + roughness +
 * metalness + how strongly it samples the environment map) and instantiated
 * through the factories below. No image textures are used — realism comes from
 * correctly-tuned PBR constants reflecting a procedural environment
 * (see scene/ProceduralEnvironment). Keeping the numbers here means concrete
 * reads as concrete and steel as steel everywhere, consistently.
 */
export interface PBRPreset {
  color: string;
  roughness: number;
  metalness: number;
  /** How strongly this surface reflects the scene environment map. */
  envMapIntensity: number;
}

export const SURFACES = {
  /* ── Concrete / masonry ─────────────────────────────────────────────── */
  concrete: { color: '#a6a49c', roughness: 0.94, metalness: 0.0, envMapIntensity: 0.25 },
  concreteWall: { color: '#9a9c98', roughness: 0.9, metalness: 0.0, envMapIntensity: 0.3 },
  perimeterConcrete: { color: '#8f9195', roughness: 0.9, metalness: 0.02, envMapIntensity: 0.28 },
  partition: { color: '#7d8186', roughness: 0.85, metalness: 0.03, envMapIntensity: 0.35 },

  /* ── Ground surfaces ────────────────────────────────────────────────── */
  campusGround: { color: '#3a4048', roughness: 0.97, metalness: 0.02, envMapIntensity: 0.1 },
  asphalt: { color: '#2b2d31', roughness: 0.88, metalness: 0.0, envMapIntensity: 0.18 },
  grass: { color: '#46613a', roughness: 1.0, metalness: 0.0, envMapIntensity: 0.1 },
  gravel: { color: '#6f675a', roughness: 1.0, metalness: 0.0, envMapIntensity: 0.1 },

  /* ── Tiles (institutional flooring / paved walks) ───────────────────── */
  concreteTile: { color: '#b4b3ab', roughness: 0.72, metalness: 0.03, envMapIntensity: 0.4 },
  floorTile: { color: '#9a9d9f', roughness: 0.45, metalness: 0.06, envMapIntensity: 0.6 },

  /* ── Metals ─────────────────────────────────────────────────────────── */
  steel: { color: '#7b828a', roughness: 0.35, metalness: 0.95, envMapIntensity: 1.0 },
  metalDoor: { color: '#3c414a', roughness: 0.42, metalness: 0.9, envMapIntensity: 0.9 },
  securityFence: { color: '#4a5158', roughness: 0.5, metalness: 0.85, envMapIntensity: 0.8 },
  roofMetal: { color: '#565b61', roughness: 0.55, metalness: 0.5, envMapIntensity: 0.6 },

  /* ── Misc ───────────────────────────────────────────────────────────── */
  paint: { color: '#e7e7df', roughness: 0.6, metalness: 0.0, envMapIntensity: 0.2 },
  foliage: { color: '#31502a', roughness: 1.0, metalness: 0.0, envMapIntensity: 0.1 },
  bark: { color: '#4a3626', roughness: 1.0, metalness: 0.0, envMapIntensity: 0.1 },
} satisfies Record<string, PBRPreset>;

export type SurfaceName = keyof typeof SURFACES;

export interface StandardOverrides {
  color?: string;
  roughness?: number;
  metalness?: number;
  envMapIntensity?: number;
}

/** Builds a MeshStandardMaterial from a surface preset (optionally overriding fields). */
export function makeStandard(surface: SurfaceName, over: StandardOverrides = {}): THREE.MeshStandardMaterial {
  const p = SURFACES[surface];
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(over.color ?? p.color),
    roughness: over.roughness ?? p.roughness,
    metalness: over.metalness ?? p.metalness,
    envMapIntensity: over.envMapIntensity ?? p.envMapIntensity,
  });
}

/** Emissive material (lamps, illuminated bars). */
export function makeEmissive(
  color: string,
  emissive: string,
  emissiveIntensity: number,
  roughness = 0.4,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(emissive),
    emissiveIntensity,
    roughness,
    metalness: 0.1,
    envMapIntensity: 0.6,
  });
}

/**
 * Physically-based glass for windows: a dielectric with clearcoat sheen and
 * strong environment reflections, lightly tinted and semi-transparent. No
 * transmission pass (kept cheap for the many instanced window panes) — the
 * reflections + tint sell the glass.
 */
export function makeGlass(tint = '#39505f'): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(tint),
    metalness: 0.0,
    roughness: 0.08,
    ior: 1.45,
    reflectivity: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.5,
    transparent: true,
    opacity: 0.52,
  });
}
