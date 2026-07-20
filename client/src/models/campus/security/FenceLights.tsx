import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMPUS_HALF_WIDTH, CAMPUS_HALF_DEPTH, Point2, samplePolyline } from '../../../utils/campusGeometry';
import { createFenceLightMaterial } from '../../../materials/securityMaterials';
import { FENCE_LIGHT_SPACING, FENCE_LIGHT_Y } from './securityLayout';

export interface FenceLightsProps {
  night: boolean;
}

const LOOP: Point2[] = [
  { x: -CAMPUS_HALF_WIDTH, z: -CAMPUS_HALF_DEPTH },
  { x: CAMPUS_HALF_WIDTH, z: -CAMPUS_HALF_DEPTH },
  { x: CAMPUS_HALF_WIDTH, z: CAMPUS_HALF_DEPTH },
  { x: -CAMPUS_HALF_WIDTH, z: CAMPUS_HALF_DEPTH },
  { x: -CAMPUS_HALF_WIDTH, z: -CAMPUS_HALF_DEPTH },
];

/**
 * Perimeter fence lights — small luminaires spaced along the top of the wall,
 * rendered as one InstancedMesh. They glow faintly by day and brightly at
 * night (emissiveIntensity is raised on the shared material).
 */
export default function FenceLights({ night }: FenceLightsProps) {
  const positions = useMemo(() => samplePolyline(LOOP, FENCE_LIGHT_SPACING), []);
  const geometry = useMemo(() => new THREE.BoxGeometry(0.4, 0.28, 0.4), []);
  const material = useMemo(() => createFenceLightMaterial(), []);
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    positions.forEach((p, i) => {
      dummy.position.set(p.x, FENCE_LIGHT_Y, p.z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions]);

  useEffect(() => {
    material.emissiveIntensity = night ? 1.8 : 0.35;
    material.needsUpdate = true;
  }, [night, material]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return <instancedMesh ref={ref} args={[geometry, material, positions.length]} />;
}
