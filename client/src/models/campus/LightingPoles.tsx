import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createMetalMaterial, createLampEmissiveMaterial } from '../../materials/campusMaterials';
import {
  CAMPUS_HALF_WIDTH,
  CAMPUS_HALF_DEPTH,
  RING_ROAD_INSET,
  GATE_CENTER_X,
  Point2,
  samplePolyline,
} from '../../utils/campusGeometry';

const POLE_HEIGHT = 8;
const POLE_RADIUS = 0.14;
const LAMP_RADIUS = 0.3;
const SPACING = 26;

// Poles sit in the gravel clear-zone strip between the wall and the patrol
// road, plus a pair flanking the entrance road — both realistic security
// lighting placements.
const poleHalfW = CAMPUS_HALF_WIDTH - RING_ROAD_INSET / 2;
const poleHalfD = CAMPUS_HALF_DEPTH - RING_ROAD_INSET / 2;

const PERIMETER_LOOP: Point2[] = [
  { x: -poleHalfW, z: -poleHalfD },
  { x: poleHalfW, z: -poleHalfD },
  { x: poleHalfW, z: poleHalfD },
  { x: -poleHalfW, z: poleHalfD },
  { x: -poleHalfW, z: -poleHalfD },
];

const ENTRANCE_LEFT: Point2[] = [
  { x: GATE_CENTER_X - 4, z: CAMPUS_HALF_DEPTH },
  { x: GATE_CENTER_X - 4, z: poleHalfD },
];
const ENTRANCE_RIGHT: Point2[] = [
  { x: GATE_CENTER_X + 4, z: CAMPUS_HALF_DEPTH },
  { x: GATE_CENTER_X + 4, z: poleHalfD },
];

const POSITIONS: Point2[] = [
  ...samplePolyline(PERIMETER_LOOP, SPACING),
  ...samplePolyline(ENTRANCE_LEFT, SPACING * 0.6),
  ...samplePolyline(ENTRANCE_RIGHT, SPACING * 0.6),
];

/** Instanced security lighting poles along the perimeter clear-zone and entrance road. */
export default function LightingPoles() {
  const poleGeometry = useMemo(() => new THREE.CylinderGeometry(POLE_RADIUS, POLE_RADIUS * 1.4, POLE_HEIGHT, 6), []);
  const lampGeometry = useMemo(() => new THREE.SphereGeometry(LAMP_RADIUS, 8, 6), []);
  const poleMaterial = useMemo(() => createMetalMaterial(), []);
  const lampMaterial = useMemo(() => createLampEmissiveMaterial(), []);
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const lampRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    POSITIONS.forEach((p, i) => {
      dummy.position.set(p.x, POLE_HEIGHT / 2, p.z);
      dummy.updateMatrix();
      poleRef.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(p.x, POLE_HEIGHT, p.z);
      dummy.updateMatrix();
      lampRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (poleRef.current) poleRef.current.instanceMatrix.needsUpdate = true;
    if (lampRef.current) lampRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  useEffect(() => () => {
    poleGeometry.dispose();
    lampGeometry.dispose();
    poleMaterial.dispose();
    lampMaterial.dispose();
  }, [poleGeometry, lampGeometry, poleMaterial, lampMaterial]);

  return (
    <group>
      <instancedMesh ref={poleRef} args={[poleGeometry, poleMaterial, POSITIONS.length]} castShadow />
      <instancedMesh ref={lampRef} args={[lampGeometry, lampMaterial, POSITIONS.length]} />
      <pointLight
        position={[GATE_CENTER_X, POLE_HEIGHT, CAMPUS_HALF_DEPTH - 6]}
        intensity={8}
        distance={30}
        decay={2}
        color="#ffdd88"
      />
    </group>
  );
}
