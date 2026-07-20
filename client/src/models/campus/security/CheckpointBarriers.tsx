import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import CheckpointBarrier from './CheckpointBarrier';
import { CHECKPOINT_BARRIERS } from './securityLayout';
import { bakeTransform, mergeStatic } from '../../../utils/campusGeometry';
import {
  createHousingMaterial,
  createStripeRedMaterial,
  createStripeWhiteMaterial,
  createBollardMaterial,
} from '../../../materials/securityMaterials';

const ARM_Y = 1.5;
const SEGMENTS = 7; // spans −3.5 … +3.5 across the road

/** All boom-barrier checkpoints. Shared geometry (striped arm split by colour) + materials. */
export default function CheckpointBarriers() {
  const baseGeometry = useMemo(() => bakeTransform(new THREE.BoxGeometry(1.1, 0.2, 1.1), [0, 0.1, 0]), []);
  const postGeometry = useMemo(() => bakeTransform(new THREE.BoxGeometry(0.4, 1.7, 0.4), [0, 0.85, 0]), []);

  const { armRedGeometry, armWhiteGeometry } = useMemo(() => {
    const red: THREE.BufferGeometry[] = [];
    const white: THREE.BufferGeometry[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const x = -SEGMENTS / 2 + i + 0.5;
      const seg = bakeTransform(new THREE.BoxGeometry(1, 0.16, 0.16), [x, ARM_Y, 0]);
      (i % 2 === 0 ? red : white).push(seg);
    }
    return { armRedGeometry: mergeStatic(red), armWhiteGeometry: mergeStatic(white) };
  }, []);

  const bollardGeometry = useMemo(() => new THREE.CylinderGeometry(0.18, 0.22, 0.9, 12), []);

  const postMaterial = useMemo(() => createHousingMaterial(), []);
  const redMaterial = useMemo(() => createStripeRedMaterial(), []);
  const whiteMaterial = useMemo(() => createStripeWhiteMaterial(), []);
  const bollardMaterial = useMemo(() => createBollardMaterial(), []);

  useEffect(() => () => {
    baseGeometry.dispose();
    postGeometry.dispose();
    armRedGeometry.dispose();
    armWhiteGeometry.dispose();
    bollardGeometry.dispose();
    postMaterial.dispose();
    redMaterial.dispose();
    whiteMaterial.dispose();
    bollardMaterial.dispose();
  }, [baseGeometry, postGeometry, armRedGeometry, armWhiteGeometry, bollardGeometry, postMaterial, redMaterial, whiteMaterial, bollardMaterial]);

  return (
    <group>
      {CHECKPOINT_BARRIERS.map((mount, i) => (
        <CheckpointBarrier
          key={i}
          mount={mount}
          baseGeometry={baseGeometry}
          postGeometry={postGeometry}
          armRedGeometry={armRedGeometry}
          armWhiteGeometry={armWhiteGeometry}
          bollardGeometry={bollardGeometry}
          postMaterial={postMaterial}
          redMaterial={redMaterial}
          whiteMaterial={whiteMaterial}
          bollardMaterial={bollardMaterial}
        />
      ))}
    </group>
  );
}
