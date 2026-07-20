import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createAsphaltMaterial, createMarkingMaterial } from '../../materials/campusMaterials';
import { GATE_CENTER_X, CAMPUS_HALF_DEPTH } from '../../utils/campusGeometry';

const LOT_WIDTH = 55;
const LOT_DEPTH = 32;
const LOT_CENTER_X = GATE_CENTER_X - 34; // west of the entrance road, outside the secure perimeter
const LOT_CENTER_Z = CAMPUS_HALF_DEPTH + 24;

const ROWS = 2;
const STALLS_PER_ROW = 12;
const STALL_WIDTH = 2.6;
const STALL_LINE_DEPTH = 5;

/** Visitor parking pad outside the wall, with instanced stall-line markings. */
export default function ParkingLot() {
  const padGeometry = useMemo(() => new THREE.BoxGeometry(LOT_WIDTH, 0.06, LOT_DEPTH), []);
  const padMaterial = useMemo(() => createAsphaltMaterial(), []);
  const lineGeometry = useMemo(() => new THREE.BoxGeometry(0.15, 0.02, STALL_LINE_DEPTH), []);
  const lineMaterial = useMemo(() => createMarkingMaterial(), []);
  const lineMeshRef = useRef<THREE.InstancedMesh>(null);

  const lineCount = ROWS * (STALLS_PER_ROW + 1);

  useLayoutEffect(() => {
    const mesh = lineMeshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    let i = 0;
    for (let row = 0; row < ROWS; row++) {
      const rowZ = LOT_CENTER_Z + (row === 0 ? -LOT_DEPTH / 4 : LOT_DEPTH / 4);
      for (let s = 0; s <= STALLS_PER_ROW; s++) {
        const x = LOT_CENTER_X - LOT_WIDTH / 2 + 3 + s * STALL_WIDTH;
        dummy.position.set(x, 0.09, rowZ);
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useEffect(() => () => {
    padGeometry.dispose();
    padMaterial.dispose();
    lineGeometry.dispose();
    lineMaterial.dispose();
  }, [padGeometry, padMaterial, lineGeometry, lineMaterial]);

  return (
    <group>
      <mesh
        geometry={padGeometry}
        material={padMaterial}
        position={[LOT_CENTER_X, 0.04, LOT_CENTER_Z]}
        receiveShadow
      />
      <instancedMesh ref={lineMeshRef} args={[lineGeometry, lineMaterial, lineCount]} />
    </group>
  );
}
