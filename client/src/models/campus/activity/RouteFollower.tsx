import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RouteSampler, shortestAngleDelta } from '../../../utils/patrolRoute';

export interface RouteFollowerProps {
  route: RouteSampler;
  /** Constant travel speed along the route (world units / second). */
  speed: number;
  /** Starting distance along the route — stagger movers on the same loop. */
  offset?: number;
  /** Ground height for the moved group. */
  y?: number;
  /** Heading smoothing rate; higher turns onto the new bearing faster. */
  turnRate?: number;
  children: React.ReactNode;
}

/**
 * Reusable constant-speed mover: accumulates distance (`speed * delta`, so it is
 * frame-rate independent) along a shared {@link RouteSampler} and drives a group
 * to the sampled pose, easing its heading toward the direction of travel. Used
 * for anything that roams a fixed path — patrolling officers, shuttling staff.
 * The child model faces local +Z (the route's forward direction).
 */
export default function RouteFollower({
  route,
  speed,
  offset = 0,
  y = 0,
  turnRate = 6,
  children,
}: RouteFollowerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const distance = useRef(offset);
  const heading = useRef<number | null>(null);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    distance.current += speed * delta;
    const pose = route.sample(distance.current);
    g.position.set(pose.x, y, pose.z);

    if (heading.current === null) heading.current = pose.angle;
    const d = shortestAngleDelta(heading.current, pose.angle);
    heading.current += d * (1 - Math.exp(-turnRate * delta));
    g.rotation.y = heading.current;
  });

  return <group ref={groupRef}>{children}</group>;
}
