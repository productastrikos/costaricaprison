import React, { useRef } from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import type { PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { DEFAULT_CAMERA_POSITION } from './constants';

/** Perspective camera + damped orbit navigation, clamped so you can't dip below ground. */
export default function CameraRig() {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={50}
        near={0.1}
        far={2000}
        position={DEFAULT_CAMERA_POSITION}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={12}
        maxDistance={340}
        maxPolarAngle={Math.PI / 2 - 0.04}
        target={[0, 0, 0]}
      />
    </>
  );
}
