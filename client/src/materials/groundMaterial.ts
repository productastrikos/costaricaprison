import * as THREE from 'three';
import { makeStandard } from './pbr';

/**
 * Factory for the campus ground material — a factory rather than a shared
 * singleton so each <Ground> instance owns disposable GPU resources.
 */
export function createGroundMaterial(): THREE.MeshStandardMaterial {
  return makeStandard('campusGround');
}
