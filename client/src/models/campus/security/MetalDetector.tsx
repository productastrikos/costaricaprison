import React from 'react';
import * as THREE from 'three';
import { Mount } from './securityLayout';

export interface MetalDetectorProps {
  mount: Mount;
  frameGeometry: THREE.BufferGeometry;
  panelGeometry: THREE.BufferGeometry;
  frameMaterial: THREE.Material;
  panelMaterial: THREE.Material;
}

/** A single walk-through metal-detector archway (frame + glowing scanner panels). */
export default function MetalDetector({ mount, frameGeometry, panelGeometry, frameMaterial, panelMaterial }: MetalDetectorProps) {
  return (
    <group position={mount.position} rotation={[0, mount.rotationY, 0]}>
      <mesh geometry={frameGeometry} material={frameMaterial} castShadow />
      <mesh geometry={panelGeometry} material={panelMaterial} />
    </group>
  );
}
