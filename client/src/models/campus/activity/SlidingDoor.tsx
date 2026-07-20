import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { openCloseCycle, OpenCloseOptions } from '../../../animation/motion';

export interface SlidingDoorProps {
  position: [number, number, number];
  rotationY?: number;
  width?: number;
  height?: number;
  thickness?: number;
  /** Shared door material (owned/disposed by the parent). */
  material: THREE.Material;
  /** Open/close schedule; stagger doors with `phase`. */
  cycle?: OpenCloseOptions;
  /** Two panels bi-parting from the centre (default) or a single panel. */
  biPart?: boolean;
}

/**
 * A reusable powered sliding door: one or two panels that slide open and shut on
 * a time-based {@link openCloseCycle}. Panels retract into the door pocket
 * (their width) so the doorway clears completely. Used for prison building
 * entrances; the same open/close curve also drives the perimeter security gate.
 */
export default function SlidingDoor({
  position,
  rotationY = 0,
  width = 3,
  height = 2.6,
  thickness = 0.16,
  material,
  cycle,
  biPart = true,
}: SlidingDoorProps) {
  const panelWidth = biPart ? width / 2 : width;
  const geometry = useMemo(
    () => new THREE.BoxGeometry(panelWidth, height, thickness),
    [panelWidth, height, thickness],
  );
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const closedLeftX = biPart ? -panelWidth / 2 : 0;
  const closedRightX = panelWidth / 2;
  const travel = panelWidth * 0.98;

  useFrame((state) => {
    const open = openCloseCycle(state.clock.elapsedTime, cycle);
    const slide = open * travel;
    if (leftRef.current) leftRef.current.position.x = closedLeftX - slide;
    if (rightRef.current) rightRef.current.position.x = closedRightX + slide;
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh ref={leftRef} geometry={geometry} material={material} position={[closedLeftX, height / 2, 0]} castShadow />
      {biPart && (
        <mesh ref={rightRef} geometry={geometry} material={material} position={[closedRightX, height / 2, 0]} castShadow />
      )}
    </group>
  );
}
