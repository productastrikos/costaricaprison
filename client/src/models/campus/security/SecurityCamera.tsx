import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Mount } from './securityLayout';
import { oscillate } from '../../../animation/motion';

export interface SecurityCameraProps {
  mount: Mount;
  /** Shared geometries/materials (owned & disposed by the parent collection). */
  bracketGeometry: THREE.BufferGeometry;
  bodyGeometry: THREE.BufferGeometry;
  lensGeometry: THREE.BufferGeometry;
  bodyMaterial: THREE.Material;
  housingMaterial: THREE.Material;
  lensMaterial: THREE.Material;
  /** Sweep amplitude (radians) and speed; phase offsets each camera. */
  amplitude?: number;
  speed?: number;
  phase?: number;
}

/**
 * A single wall-mounted CCTV camera. The bracket/arm are fixed to the wall;
 * the camera head continuously pans back and forth (animated every frame),
 * giving the "sweeping surveillance" motion. Camera forward = local +Z.
 */
export default function SecurityCamera({
  mount,
  bracketGeometry,
  bodyGeometry,
  lensGeometry,
  bodyMaterial,
  housingMaterial,
  lensMaterial,
  amplitude = 0.7,
  speed = 0.5,
  phase = 0,
}: SecurityCameraProps) {
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (headRef.current) {
      headRef.current.rotation.y = oscillate(state.clock.elapsedTime, { speed, amplitude, phase });
    }
  });

  return (
    <group position={mount.position} rotation={[0, mount.rotationY, 0]}>
      {/* fixed wall bracket */}
      <mesh geometry={bracketGeometry} material={housingMaterial} castShadow />
      {/* panning head */}
      <group ref={headRef} position={[0, -0.35, 0.35]}>
        <mesh geometry={bodyGeometry} material={bodyMaterial} castShadow />
        <mesh geometry={lensGeometry} material={lensMaterial} position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]} />
      </group>
    </group>
  );
}
