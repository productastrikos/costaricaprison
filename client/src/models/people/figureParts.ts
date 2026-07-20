import * as THREE from 'three';

/**
 * Shared geometry + skeletal dimensions for the simple primitive humanoid used
 * by every animated person on the campus (patrol officers, the visitor queue,
 * medical staff). Built once and passed into many {@link Figure} instances so a
 * crowd is cheap. Limbs are authored so their *pivot* sits at the top (hip /
 * shoulder), letting them swing naturally about that joint.
 */

export const FIGURE = {
  hipY: 0.9,
  legLength: 0.9,
  legSize: 0.18,
  torsoY: 1.2,
  torsoHeight: 0.62,
  shoulderY: 1.46,
  armLength: 0.6,
  armSize: 0.14,
  headY: 1.72,
} as const;

export interface FigureGeometry {
  torso: THREE.BufferGeometry;
  /** Limb baked so its top (the joint) is at local y = 0, hanging down −length. */
  limb: THREE.BufferGeometry;
  arm: THREE.BufferGeometry;
  head: THREE.BufferGeometry;
  cap: THREE.BufferGeometry;
}

function hangingLimb(width: number, length: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(width, length, width);
  g.translate(0, -length / 2, 0); // pivot at the joint
  return g;
}

/** Creates the shared set of humanoid part geometries (caller disposes each). */
export function createFigureGeometry(): FigureGeometry {
  return {
    torso: new THREE.BoxGeometry(0.5, FIGURE.torsoHeight, 0.28),
    limb: hangingLimb(FIGURE.legSize, FIGURE.legLength),
    arm: hangingLimb(FIGURE.armSize, FIGURE.armLength),
    head: new THREE.SphereGeometry(0.16, 16, 12),
    cap: new THREE.BoxGeometry(0.34, 0.12, 0.36),
  };
}

/** Disposes every geometry in a {@link FigureGeometry}. */
export function disposeFigureGeometry(g: FigureGeometry): void {
  g.torso.dispose();
  g.limb.dispose();
  g.arm.dispose();
  g.head.dispose();
  g.cap.dispose();
}
