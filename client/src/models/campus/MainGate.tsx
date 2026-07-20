import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createConcreteMaterial, createMetalMaterial } from '../../materials/campusMaterials';
import {
  bakeTransform,
  mergeStatic,
  GATE_CENTER_X,
  GATE_WIDTH,
  CAMPUS_HALF_DEPTH,
  WALL_HEIGHT,
} from '../../utils/campusGeometry';

const PILLAR_HEIGHT = WALL_HEIGHT + 1.5;
const PILLAR_SIZE = 2.2;

/** Main entrance: gate pillars + lintel, a guard booth, and a boom barrier. */
export default function MainGate() {
  const pillarGeometry = useMemo(() => {
    const left = bakeTransform(
      new THREE.BoxGeometry(PILLAR_SIZE, PILLAR_HEIGHT, PILLAR_SIZE),
      [GATE_CENTER_X - GATE_WIDTH / 2, PILLAR_HEIGHT / 2, CAMPUS_HALF_DEPTH],
    );
    const right = bakeTransform(
      new THREE.BoxGeometry(PILLAR_SIZE, PILLAR_HEIGHT, PILLAR_SIZE),
      [GATE_CENTER_X + GATE_WIDTH / 2, PILLAR_HEIGHT / 2, CAMPUS_HALF_DEPTH],
    );
    const lintel = bakeTransform(
      new THREE.BoxGeometry(GATE_WIDTH + PILLAR_SIZE, 1.2, PILLAR_SIZE),
      [GATE_CENTER_X, PILLAR_HEIGHT + 0.6, CAMPUS_HALF_DEPTH],
    );
    return mergeStatic([left, right, lintel]);
  }, []);

  const boothGeometry = useMemo(
    () =>
      bakeTransform(new THREE.BoxGeometry(3.4, 3, 3.4), [
        GATE_CENTER_X - GATE_WIDTH / 2 - 3.6,
        1.5,
        CAMPUS_HALF_DEPTH - 4,
      ]),
    [],
  );

  const barrierGeometry = useMemo(
    () =>
      bakeTransform(new THREE.BoxGeometry(GATE_WIDTH * 0.85, 0.25, 0.25), [
        GATE_CENTER_X,
        1.1,
        CAMPUS_HALF_DEPTH - 2,
      ]),
    [],
  );

  const concrete = useMemo(() => createConcreteMaterial(), []);
  const metal = useMemo(() => createMetalMaterial(), []);

  useEffect(() => () => {
    pillarGeometry.dispose();
    boothGeometry.dispose();
    barrierGeometry.dispose();
    concrete.dispose();
    metal.dispose();
  }, [pillarGeometry, boothGeometry, barrierGeometry, concrete, metal]);

  return (
    <group>
      <mesh geometry={pillarGeometry} material={concrete} castShadow receiveShadow />
      <mesh geometry={boothGeometry} material={concrete} castShadow receiveShadow />
      <mesh geometry={barrierGeometry} material={metal} castShadow />
    </group>
  );
}
