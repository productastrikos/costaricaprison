import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import Vehicle from '../../vehicles/Vehicle';
import {
  createJeepBodyMaterial,
  createJeepGlassMaterial,
  createTireMaterial,
  createBeaconRedMaterial,
  createBeaconBlueMaterial,
} from '../../../materials/patrolMaterials';
import { buildRouteSampler, shortestAngleDelta } from '../../../utils/patrolRoute';
import { clamp, easeInOutCubic, unitPhase } from '../../../animation/motion';
import { ENTRY_LOOP, GATE_CYCLE, ENTRY_WINDOW } from './activityLayout';

const WHEEL_RADIUS = 0.42;

/**
 * A patrol jeep admitted through the main gate. Its progress along the entry
 * loop is a pure function of the shared {@link GATE_CYCLE} clock — it parks
 * outside while the gate is shut and drives its interior circuit only during
 * the gate-open window — so vehicle and gate stay perfectly in sync without any
 * shared state. Wheel spin is derived from the vehicle's own instantaneous
 * speed, keeping everything time-based.
 */
export default function EntryVehicle() {
  const route = useMemo(() => buildRouteSampler(ENTRY_LOOP, true), []);
  const materials = useMemo(
    () => ({
      body: createJeepBodyMaterial(),
      glass: createJeepGlassMaterial(),
      tire: createTireMaterial(),
      beaconA: createBeaconRedMaterial(),
      beaconB: createBeaconBlueMaterial(),
    }),
    [],
  );

  const groupRef = useRef<THREE.Group>(null);
  const prevDistance = useRef(0);
  const heading = useRef<number | null>(null);
  const wheelSpin = useRef(0);

  useEffect(
    () => () => {
      materials.body.dispose();
      materials.glass.dispose();
      materials.tire.dispose();
      materials.beaconA.dispose();
      materials.beaconB.dispose();
    },
    [materials],
  );

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const cycle = unitPhase(state.clock.elapsedTime / GATE_CYCLE.period + GATE_CYCLE.phase);
    const local = clamp((cycle - ENTRY_WINDOW.start) / (ENTRY_WINDOW.end - ENTRY_WINDOW.start));
    const distance = easeInOutCubic(local) * route.length;

    const pose = route.sample(distance);
    g.position.set(pose.x, 0, pose.z);

    if (heading.current === null) heading.current = pose.angle;
    const d = shortestAngleDelta(heading.current, pose.angle);
    heading.current += d * (1 - Math.exp(-6 * delta));
    g.rotation.y = heading.current;

    // Instantaneous speed → wheel angular velocity (smoothed for stability).
    const speed = delta > 0 ? (distance - prevDistance.current) / delta : 0;
    prevDistance.current = distance;
    wheelSpin.current = -speed / WHEEL_RADIUS;
  });

  return (
    <group ref={groupRef}>
      <Vehicle materials={materials} wheelSpinRef={wheelSpin} beacon length={4.6} width={2.0} height={1.8} />
    </group>
  );
}
