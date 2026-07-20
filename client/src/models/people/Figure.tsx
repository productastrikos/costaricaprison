import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FIGURE, FigureGeometry } from './figureParts';
import { oscillate, damp } from '../../animation/motion';

export interface FigureMaterials {
  uniform: THREE.Material;
  skin: THREE.Material;
  cap: THREE.Material;
}

export interface FigureProps {
  geometry: FigureGeometry;
  materials: FigureMaterials;
  /** When true the limbs swing through a walk cycle; when false they ease to rest. */
  walking?: boolean;
  /**
   * Optional per-frame gait target (0..1) that overrides `walking` without a
   * re-render — a parent updates `.current` each frame (e.g. a shuffling queue
   * that only walks during its step phase).
   */
  gaitRef?: React.MutableRefObject<number>;
  /** Stride cadence (radians/sec of the gait). Scale with travel speed for realism. */
  cadence?: number;
  /** Phase offset (radians) so a group of figures don't march in lockstep. */
  phase?: number;
  /** Optional swing amplitude override (radians). */
  swing?: number;
}

/**
 * A single primitive humanoid that animates its own gait. The parent positions
 * and orients the figure (e.g. a route follower or a queue slot); the figure
 * only swings its limbs and bobs — entirely time-based, easing in and out of
 * motion as `walking` toggles. Reused for guards, visitors and medics.
 */
export default function Figure({
  geometry,
  materials,
  walking = false,
  gaitRef,
  cadence = 8,
  phase = 0,
  swing = 0.5,
}: FigureProps) {
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  // Smoothed 0..1 "how much we're walking", so starts/stops aren't instant.
  const gait = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const target = gaitRef ? gaitRef.current : walking ? 1 : 0;
    gait.current = damp(gait.current, target, 6, delta);
    const amp = swing * gait.current;
    const s = oscillate(t, { speed: cadence, amplitude: amp, phase });

    if (legL.current) legL.current.rotation.x = s;
    if (legR.current) legR.current.rotation.x = -s;
    // Arms counter-swing to the legs.
    if (armL.current) armL.current.rotation.x = -s;
    if (armR.current) armR.current.rotation.x = s;
    // Vertical bob at twice the stride frequency.
    if (body.current) {
      body.current.position.y = Math.abs(Math.sin(t * cadence + phase)) * 0.05 * gait.current;
    }
  });

  return (
    <group>
      <group ref={body}>
        <mesh geometry={geometry.torso} material={materials.uniform} position={[0, FIGURE.torsoY, 0]} castShadow />
        <mesh geometry={geometry.head} material={materials.skin} position={[0, FIGURE.headY, 0]} castShadow />
        <mesh geometry={geometry.cap} material={materials.cap} position={[0, FIGURE.headY + 0.14, 0]} castShadow />
        <group ref={armL} position={[0.32, FIGURE.shoulderY, 0]}>
          <mesh geometry={geometry.arm} material={materials.uniform} castShadow />
        </group>
        <group ref={armR} position={[-0.32, FIGURE.shoulderY, 0]}>
          <mesh geometry={geometry.arm} material={materials.uniform} castShadow />
        </group>
      </group>
      <group ref={legL} position={[0.12, FIGURE.hipY, 0]}>
        <mesh geometry={geometry.limb} material={materials.uniform} castShadow />
      </group>
      <group ref={legR} position={[-0.12, FIGURE.hipY, 0]}>
        <mesh geometry={geometry.limb} material={materials.uniform} castShadow />
      </group>
    </group>
  );
}
