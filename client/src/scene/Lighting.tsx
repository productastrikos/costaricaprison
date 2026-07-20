import React from 'react';
import { SUN_POSITION } from './constants';

export interface LightingProps {
  night?: boolean;
}

/**
 * Ambient fill + a shadow-casting directional key light sized to cover the
 * whole campus ground plane. At night the key light dims to a cool "moonlight"
 * so the animated searchlights and fence/security glows carry the scene.
 */
export default function Lighting({ night = false }: LightingProps) {
  return (
    <>
      <ambientLight intensity={night ? 0.12 : 0.45} color={night ? '#3d4c6b' : '#bcd4ff'} />
      <directionalLight
        color={night ? '#93a9d6' : '#fff4e0'}
        intensity={night ? 0.28 : 1.35}
        position={SUN_POSITION}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={500}
        shadow-camera-left={-180}
        shadow-camera-right={180}
        shadow-camera-top={180}
        shadow-camera-bottom={-180}
        shadow-bias={-0.0004}
      />
    </>
  );
}
