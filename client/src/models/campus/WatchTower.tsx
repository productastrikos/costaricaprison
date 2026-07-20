import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createConcreteMaterial, createMetalMaterial } from '../../materials/campusMaterials';
import { bakeTransform, mergeStatic } from '../../utils/campusGeometry';

export interface WatchTowerProps {
  position: [number, number, number];
  rotationY?: number;
}

const BASE_HEIGHT = 7;
const BASE_RADIUS = 2.2;
const CABIN_SIZE = 3.6;
const CABIN_HEIGHT = 2.6;
const ROOF_HEIGHT = 1.2;

/** A single corner guard tower: tapered base, observation cabin, pyramid roof. */
export default function WatchTower({ position, rotationY = 0 }: WatchTowerProps) {
  const structureGeometry = useMemo(() => {
    const base = bakeTransform(
      new THREE.CylinderGeometry(BASE_RADIUS, BASE_RADIUS * 1.3, BASE_HEIGHT, 8),
      [0, BASE_HEIGHT / 2, 0],
    );
    const platform = bakeTransform(
      new THREE.BoxGeometry(CABIN_SIZE + 0.8, 0.3, CABIN_SIZE + 0.8),
      [0, BASE_HEIGHT + 0.15, 0],
    );
    const cabin = bakeTransform(
      new THREE.BoxGeometry(CABIN_SIZE, CABIN_HEIGHT, CABIN_SIZE),
      [0, BASE_HEIGHT + 0.3 + CABIN_HEIGHT / 2, 0],
    );
    return mergeStatic([base, platform, cabin]);
  }, []);

  const roofGeometry = useMemo(
    () =>
      bakeTransform(
        new THREE.ConeGeometry(CABIN_SIZE * 0.8, ROOF_HEIGHT, 4),
        [0, BASE_HEIGHT + 0.3 + CABIN_HEIGHT + ROOF_HEIGHT / 2, 0],
        [0, Math.PI / 4, 0],
      ),
    [],
  );

  const concrete = useMemo(() => createConcreteMaterial(), []);
  const metal = useMemo(() => createMetalMaterial(), []);

  useEffect(() => () => {
    structureGeometry.dispose();
    roofGeometry.dispose();
    concrete.dispose();
    metal.dispose();
  }, [structureGeometry, roofGeometry, concrete, metal]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={structureGeometry} material={concrete} castShadow receiveShadow />
      <mesh geometry={roofGeometry} material={metal} castShadow />
    </group>
  );
}
