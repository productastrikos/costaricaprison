import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Mount } from './securityLayout';

export interface SearchLightProps {
  mount: Mount;
  night: boolean;
  housingGeometry: THREE.BufferGeometry;
  beamGeometry: THREE.BufferGeometry;
  housingMaterial: THREE.Material;
  beamMaterial: THREE.Material;
  phase?: number;
  sweepSpeed?: number;
  sweepAmplitude?: number;
}

/**
 * A tower-mounted searchlight: housing + a visible additive beam cone + a real
 * SpotLight casting a moving pool of light. It sweeps and illuminates only at
 * night — during the day the beam is hidden and the spotlight is off.
 */
export default function SearchLight({
  mount,
  night,
  housingGeometry,
  beamGeometry,
  housingMaterial,
  beamMaterial,
  phase = 0,
  sweepSpeed = 0.35,
  sweepAmplitude = 0.75,
}: SearchLightProps) {
  const sweepRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  useEffect(() => {
    if (spotRef.current && targetRef.current) spotRef.current.target = targetRef.current;
  }, []);

  useFrame((state) => {
    if (night && sweepRef.current) {
      sweepRef.current.rotation.y = Math.sin(state.clock.elapsedTime * sweepSpeed + phase) * sweepAmplitude;
    }
    if (beamRef.current) beamRef.current.visible = night;
    if (spotRef.current) spotRef.current.intensity = night ? 90 : 0;
  });

  return (
    <group position={mount.position} rotation={[0, mount.rotationY, 0]}>
      <group ref={sweepRef}>
        <mesh geometry={housingGeometry} material={housingMaterial} castShadow />
        {/* beam tilted down-and-forward */}
        <group rotation={[-0.95, 0, 0]}>
          <mesh ref={beamRef} geometry={beamGeometry} material={beamMaterial} visible={false} />
          <object3D ref={targetRef} position={[0, -34, 0]} />
        </group>
        <spotLight
          ref={spotRef}
          position={[0, 0, 0]}
          angle={0.32}
          penumbra={0.55}
          distance={80}
          decay={1.4}
          intensity={0}
          color="#fff2c0"
        />
      </group>
    </group>
  );
}
