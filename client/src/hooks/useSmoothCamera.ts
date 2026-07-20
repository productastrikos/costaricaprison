import { useCallback, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

/** A camera position + look-at target. Generic — not campus-specific. */
export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Reusable animated camera controller. Drives the default camera and the
 * default OrbitControls (from drei `makeDefault`) toward a target pose over
 * `duration` seconds with an ease-in-out curve. Damping is suspended during
 * the tween so the controls don't fight the animation, then restored.
 *
 * Must be called from a component rendered inside the R3F <Canvas>.
 */
export function useSmoothCamera(duration = 1.15) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  const anim = useRef<{
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    t: number;
  } | null>(null);
  const prevDamping = useRef(true);

  const moveTo = useCallback(
    (pose: CameraPose) => {
      anim.current = {
        fromPos: camera.position.clone(),
        toPos: new THREE.Vector3(...pose.position),
        fromTarget: controls ? controls.target.clone() : new THREE.Vector3(),
        toTarget: new THREE.Vector3(...pose.target),
        t: 0,
      };
      if (controls) {
        prevDamping.current = controls.enableDamping;
        controls.enableDamping = false;
      }
    },
    [camera, controls],
  );

  useFrame((_, delta) => {
    const a = anim.current;
    if (!a) return;
    a.t = Math.min(1, a.t + delta / duration);
    const k = easeInOutCubic(a.t);
    camera.position.lerpVectors(a.fromPos, a.toPos, k);
    if (controls) {
      controls.target.lerpVectors(a.fromTarget, a.toTarget, k);
      controls.update();
    }
    if (a.t >= 1) {
      anim.current = null;
      if (controls) controls.enableDamping = prevDamping.current;
    }
  });

  return { moveTo };
}
