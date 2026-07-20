import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { strobe } from '../../animation/motion';

export interface VehicleMaterials {
  body: THREE.Material;
  glass: THREE.Material;
  tire: THREE.Material;
  /** Left/right beacon colours (alternate flash). Omit to hide the light bar. */
  beaconA?: THREE.Material;
  beaconB?: THREE.Material;
}

export interface VehicleProps {
  materials: VehicleMaterials;
  /** Overall length in metres (a jeep ≈ 4.4, an ambulance ≈ 5.6). */
  length?: number;
  width?: number;
  height?: number;
  /** Wheel angular velocity (rad/s) supplied by the mover; wheels integrate it. */
  wheelSpin?: number;
  /** Per-frame wheel angular velocity (rad/s); overrides `wheelSpin` without a re-render. */
  wheelSpinRef?: React.MutableRefObject<number>;
  /** Flash the roof light bar. */
  beacon?: boolean;
  /** Beacon flash period (s). */
  beaconPeriod?: number;
  /** Tall boxy body (ambulance/van) vs. low jeep. */
  boxy?: boolean;
}

/**
 * Reusable four-wheeled vehicle built from primitives — a police jeep by
 * default, an ambulance when `boxy`. It owns nothing that moves it across the
 * campus (a mover parents it); it only spins its own wheels from the supplied
 * angular velocity and flashes its roof beacons. Fully time-based.
 */
export default function Vehicle({
  materials,
  length = 4.4,
  width = 2.0,
  height = 1.7,
  wheelSpin = 0,
  wheelSpinRef,
  beacon = false,
  beaconPeriod = 0.9,
  boxy = false,
}: VehicleProps) {
  const wheelRefs = useRef<THREE.Mesh[]>([]);
  const beaconARef = useRef<THREE.Mesh>(null);
  const beaconBRef = useRef<THREE.Mesh>(null);

  const wheelGeometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 16);
    g.rotateZ(Math.PI / 2); // roll about local X (the vehicle's side axis)
    return g;
  }, []);
  const bodyGeometry = useMemo(() => new THREE.BoxGeometry(width, height * 0.55, length), [width, height, length]);
  const cabinGeometry = useMemo(
    () => new THREE.BoxGeometry(width * 0.92, height * (boxy ? 0.6 : 0.5), length * (boxy ? 0.72 : 0.5)),
    [width, height, length, boxy],
  );
  const beaconGeometry = useMemo(() => new THREE.BoxGeometry(0.28, 0.16, 0.22), []);

  useEffect(
    () => () => {
      wheelGeometry.dispose();
      bodyGeometry.dispose();
      cabinGeometry.dispose();
      beaconGeometry.dispose();
    },
    [wheelGeometry, bodyGeometry, cabinGeometry, beaconGeometry],
  );

  const wheelX = width / 2 - 0.1;
  const wheelZ = length / 2 - 0.9;
  const wheelY = 0.42;
  const bodyY = height * 0.55;
  const cabinY = bodyY + height * (boxy ? 0.3 : 0.24);
  const cabinZ = boxy ? -length * 0.06 : length * 0.08;

  useFrame((state, delta) => {
    const spin = wheelSpinRef ? wheelSpinRef.current : wheelSpin;
    for (const w of wheelRefs.current) {
      if (w) w.rotation.x += spin * delta;
    }
    if (beacon) {
      const t = state.clock.elapsedTime;
      const a = strobe(t, { period: beaconPeriod, duty: 0.5 });
      if (beaconARef.current) beaconARef.current.visible = a > 0.5;
      if (beaconBRef.current) beaconBRef.current.visible = a <= 0.5;
    }
  });

  const wheelPositions: [number, number, number][] = [
    [wheelX, wheelY, wheelZ],
    [-wheelX, wheelY, wheelZ],
    [wheelX, wheelY, -wheelZ],
    [-wheelX, wheelY, -wheelZ],
  ];

  return (
    <group>
      <mesh geometry={bodyGeometry} material={materials.body} position={[0, bodyY, 0]} castShadow receiveShadow />
      <mesh geometry={cabinGeometry} material={materials.glass} position={[0, cabinY, cabinZ]} castShadow />
      {wheelPositions.map((p, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) wheelRefs.current[i] = m;
          }}
          geometry={wheelGeometry}
          material={materials.tire}
          position={p}
          castShadow
        />
      ))}
      {beacon && materials.beaconA && materials.beaconB && (
        <group position={[0, cabinY + height * 0.32, cabinZ]}>
          <mesh ref={beaconARef} geometry={beaconGeometry} material={materials.beaconA} position={[0.16, 0, 0]} />
          <mesh ref={beaconBRef} geometry={beaconGeometry} material={materials.beaconB} position={[-0.16, 0, 0]} />
        </group>
      )}
    </group>
  );
}
