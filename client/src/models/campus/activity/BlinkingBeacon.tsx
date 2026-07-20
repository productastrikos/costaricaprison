import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { makeEmissive } from '../../../materials/pbr';
import { pulse, strobe } from '../../../animation/motion';

export interface BlinkingBeaconProps {
  position: [number, number, number];
  /** Shared lamp geometry (owned/disposed by the parent). */
  geometry: THREE.BufferGeometry;
  color?: string;
  /** 'strobe' = hard blink; 'pulse' = smooth breathe. */
  mode?: 'strobe' | 'pulse';
  /** Blink cycle length (strobe) or breathing period (pulse), in seconds. */
  period?: number;
  /** Phase offset as a fraction of the period. */
  phase?: number;
  peakIntensity?: number;
  /** Emit a matching point light (e.g. only at night) with this peak intensity. */
  lightIntensity?: number;
  lightDistance?: number;
}

/**
 * A single self-contained blinking light: an emissive lamp whose glow is driven
 * by a time-based {@link strobe} or {@link pulse}, plus an optional coloured
 * point light. Each beacon owns its own emissive material so beacons can blink
 * on independent phases. Reused for perimeter warning lights, rooftop hazard
 * blinkers and the medical bay.
 */
export default function BlinkingBeacon({
  position,
  geometry,
  color = '#ff2d2d',
  mode = 'strobe',
  period = 1.1,
  phase = 0,
  peakIntensity = 2.4,
  lightIntensity = 0,
  lightDistance = 14,
}: BlinkingBeaconProps) {
  const material = useMemo(() => makeEmissive('#140404', color, 0.2, 0.4), [color]);
  const lightRef = useRef<THREE.PointLight>(null);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const level =
      mode === 'strobe'
        ? strobe(t, { period, duty: 0.5, phase }) * peakIntensity
        : pulse(t, { speed: (Math.PI * 2) / period, min: 0.2, max: peakIntensity, phase: phase * Math.PI * 2 });
    material.emissiveIntensity = level;
    if (lightRef.current) lightRef.current.intensity = (level / peakIntensity) * lightIntensity;
  });

  return (
    <group position={position}>
      <mesh geometry={geometry} material={material} />
      {lightIntensity > 0 && (
        <pointLight ref={lightRef} color={color} intensity={0} distance={lightDistance} decay={2} />
      )}
    </group>
  );
}
