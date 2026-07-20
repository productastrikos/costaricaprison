import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  createGrassMaterial,
  createGravelMaterial,
  createFoliageMaterial,
  createBarkMaterial,
} from '../../materials/campusMaterials';
import {
  CAMPUS_HALF_WIDTH,
  CAMPUS_HALF_DEPTH,
  RING_ROAD_INSET,
  bakeTransform,
  mergeStatic,
} from '../../utils/campusGeometry';

const lawnHalfW = CAMPUS_HALF_WIDTH - RING_ROAD_INSET - 1;
const lawnHalfD = CAMPUS_HALF_DEPTH - RING_ROAD_INSET - 1;

// Sparse ornamental trees around the entrance/parking — the interior stays
// clear of landscaping since buildings (and their own grounds) come later.
const TREE_POSITIONS: Array<[number, number]> = [
  [-10, 96], [4, 100], [-40, 96], [-52, 100],
  [60, -78], [-70, -70], [72, 70], [-78, 60],
];

/** Lawn interior, gravel security clear-zone ring against the wall, and a scattering of trees. */
export default function GreenLandscape() {
  const lawnGeometry = useMemo(() => new THREE.PlaneGeometry(lawnHalfW * 2, lawnHalfD * 2), []);
  const lawnMaterial = useMemo(() => createGrassMaterial(), []);

  const gravelGeometry = useMemo(() => {
    const outerW = CAMPUS_HALF_WIDTH * 2 - 0.2;
    const innerD = lawnHalfD * 2;
    const stripDepth = CAMPUS_HALF_DEPTH - lawnHalfD;
    const stripWidth = CAMPUS_HALF_WIDTH - lawnHalfW;
    const north = bakeTransform(
      new THREE.PlaneGeometry(outerW, stripDepth),
      [0, 0, -CAMPUS_HALF_DEPTH + stripDepth / 2],
      [-Math.PI / 2, 0, 0],
    );
    const south = bakeTransform(
      new THREE.PlaneGeometry(outerW, stripDepth),
      [0, 0, CAMPUS_HALF_DEPTH - stripDepth / 2],
      [-Math.PI / 2, 0, 0],
    );
    const east = bakeTransform(
      new THREE.PlaneGeometry(stripWidth, innerD),
      [CAMPUS_HALF_WIDTH - stripWidth / 2, 0, 0],
      [-Math.PI / 2, 0, 0],
    );
    const west = bakeTransform(
      new THREE.PlaneGeometry(stripWidth, innerD),
      [-CAMPUS_HALF_WIDTH + stripWidth / 2, 0, 0],
      [-Math.PI / 2, 0, 0],
    );
    return mergeStatic([north, south, east, west]);
  }, []);
  const gravelMaterial = useMemo(() => createGravelMaterial(), []);

  const trunkGeometry = useMemo(() => new THREE.CylinderGeometry(0.25, 0.32, 2.2, 6), []);
  const canopyGeometry = useMemo(() => new THREE.ConeGeometry(1.6, 3.2, 7), []);
  const barkMaterial = useMemo(() => createBarkMaterial(), []);
  const foliageMaterial = useMemo(() => createFoliageMaterial(), []);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopyRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    TREE_POSITIONS.forEach(([x, z], i) => {
      dummy.position.set(x, 1.1, z);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 2.8, z);
      dummy.updateMatrix();
      canopyRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (canopyRef.current) canopyRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  useEffect(() => () => {
    lawnGeometry.dispose();
    lawnMaterial.dispose();
    gravelGeometry.dispose();
    gravelMaterial.dispose();
    trunkGeometry.dispose();
    canopyGeometry.dispose();
    barkMaterial.dispose();
    foliageMaterial.dispose();
  }, [lawnGeometry, lawnMaterial, gravelGeometry, gravelMaterial, trunkGeometry, canopyGeometry, barkMaterial, foliageMaterial]);

  return (
    <group>
      <mesh geometry={lawnGeometry} material={lawnMaterial} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow />
      <mesh geometry={gravelGeometry} material={gravelMaterial} position={[0, 0.012, 0]} receiveShadow />
      <instancedMesh ref={trunkRef} args={[trunkGeometry, barkMaterial, TREE_POSITIONS.length]} castShadow />
      <instancedMesh ref={canopyRef} args={[canopyGeometry, foliageMaterial, TREE_POSITIONS.length]} castShadow />
    </group>
  );
}
