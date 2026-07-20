import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { bakeTransform, mergeStatic } from '../../../utils/campusGeometry';
import { createGatePanelMaterial } from '../../../materials/securityMaterials';
import { MAIN_GATE_OPENING } from './securityLayout';
import { openCloseCycle } from '../../../animation/motion';
import { GATE_CYCLE } from '../activity/activityLayout';

const GATE_HEIGHT = 4.6;

/** Builds one sliding gate panel of the given width: top/bottom rails + vertical bars. */
function buildPanel(width: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [
    bakeTransform(new THREE.BoxGeometry(width, 0.2, 0.14), [0, GATE_HEIGHT - 0.1, 0]),
    bakeTransform(new THREE.BoxGeometry(width, 0.2, 0.14), [0, 0.1, 0]),
  ];
  const bars = Math.max(2, Math.floor(width / 0.55));
  const step = width / bars;
  for (let i = 0; i <= bars; i++) {
    const x = -width / 2 + i * step;
    parts.push(bakeTransform(new THREE.BoxGeometry(0.08, GATE_HEIGHT, 0.08), [x, GATE_HEIGHT / 2, 0]));
  }
  return mergeStatic(parts);
}

/**
 * The main vehicle entrance's sliding security gate — two barred panels that
 * bi-part along the perimeter opening. They slide open and shut on the shared
 * {@link GATE_CYCLE} (also driving the entry vehicle), so a vehicle is only ever
 * admitted while the gate stands open. Purely time-based (no frame counting).
 */
export default function SecurityGates() {
  const { centerX, z, width } = MAIN_GATE_OPENING;
  const panelWidth = width / 2 - 0.4;
  const closedX = width / 4; // panel centre offset from the opening centre when shut
  const travel = panelWidth * 0.96; // how far each panel slides into the wall

  const geometry = useMemo(() => buildPanel(panelWidth), [panelWidth]);
  const material = useMemo(() => createGatePanelMaterial(), []);
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame((state) => {
    const open = openCloseCycle(state.clock.elapsedTime, GATE_CYCLE);
    const slide = open * travel;
    if (leftRef.current) leftRef.current.position.x = centerX - closedX - slide;
    if (rightRef.current) rightRef.current.position.x = centerX + closedX + slide;
  });

  return (
    <group>
      <mesh ref={leftRef} geometry={geometry} material={material} position={[centerX - closedX, 0, z]} castShadow />
      <mesh ref={rightRef} geometry={geometry} material={material} position={[centerX + closedX, 0, z]} castShadow />
    </group>
  );
}
