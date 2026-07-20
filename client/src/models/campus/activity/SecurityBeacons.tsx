import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import BlinkingBeacon from './BlinkingBeacon';
import {
  CAMPUS_HALF_WIDTH,
  CAMPUS_HALF_DEPTH,
  GATE_CENTER_X,
  WALL_HEIGHT,
} from '../../../utils/campusGeometry';

export interface SecurityBeaconsProps {
  /** Beacons also cast a coloured point light at night. */
  night?: boolean;
}

interface BeaconSpec {
  position: [number, number, number];
  color: string;
  mode: 'strobe' | 'pulse';
  period: number;
  phase: number;
}

const TOWER_BEACON_Y = 11.8;
const GATE_BEACON_Y = WALL_HEIGHT + 3.3;

/** Red aviation blinkers on each corner watchtower + amber hazard lights at the gate. */
const BEACONS: BeaconSpec[] = [
  { position: [-CAMPUS_HALF_WIDTH, TOWER_BEACON_Y, -CAMPUS_HALF_DEPTH], color: '#ff2d2d', mode: 'strobe', period: 1.6, phase: 0 },
  { position: [CAMPUS_HALF_WIDTH, TOWER_BEACON_Y, -CAMPUS_HALF_DEPTH], color: '#ff2d2d', mode: 'strobe', period: 1.6, phase: 0.5 },
  { position: [CAMPUS_HALF_WIDTH, TOWER_BEACON_Y, CAMPUS_HALF_DEPTH], color: '#ff2d2d', mode: 'strobe', period: 1.6, phase: 0.25 },
  { position: [-CAMPUS_HALF_WIDTH, TOWER_BEACON_Y, CAMPUS_HALF_DEPTH], color: '#ff2d2d', mode: 'strobe', period: 1.6, phase: 0.75 },
  { position: [GATE_CENTER_X - 4.6, GATE_BEACON_Y, CAMPUS_HALF_DEPTH], color: '#ffb020', mode: 'strobe', period: 0.8, phase: 0 },
  { position: [GATE_CENTER_X + 4.6, GATE_BEACON_Y, CAMPUS_HALF_DEPTH], color: '#ffb020', mode: 'strobe', period: 0.8, phase: 0.5 },
];

/**
 * All blinking security lights: strobing red warning beacons on the watchtowers
 * and amber blinkers flanking the main gate. Shares one small lamp geometry;
 * each {@link BlinkingBeacon} runs on its own phase so they flash out of sync.
 */
export default function SecurityBeacons({ night = false }: SecurityBeaconsProps) {
  const geometry = useMemo(() => new THREE.SphereGeometry(0.28, 12, 10), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      {BEACONS.map((b, i) => (
        <BlinkingBeacon
          key={i}
          position={b.position}
          geometry={geometry}
          color={b.color}
          mode={b.mode}
          period={b.period}
          phase={b.phase}
          peakIntensity={2.6}
          lightIntensity={night ? 6 : 0}
          lightDistance={18}
        />
      ))}
    </group>
  );
}
