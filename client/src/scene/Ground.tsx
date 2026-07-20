import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createGroundMaterial } from '../materials/groundMaterial';

export interface GroundProps {
  size?: number;
}

/** Large receiving-shadow ground plane the future campus buildings will sit on. */
export default function Ground({ size = 480 }: GroundProps) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(size, size, 1, 1), [size]);
  const material = useMemo(() => createGroundMaterial(), []);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return (
    <mesh geometry={geometry} material={material} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
  );
}
