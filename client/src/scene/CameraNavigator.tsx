import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSmoothCamera, CameraPose } from '../hooks/useSmoothCamera';
import { DEFAULT_CAMERA_POSITION } from './constants';

/** Live camera telemetry surfaced to the DOM overlays (compass / minimap). */
export interface CameraReadout {
  heading: number;
  camX: number;
  camZ: number;
  targetX: number;
  targetZ: number;
}

export interface CameraNavigatorProps {
  /** Pose to fly to; null resets to the default campus overview. */
  focusPose: CameraPose | null;
  onReadout: (r: CameraReadout) => void;
}

const DEFAULT_POSE: CameraPose = { position: DEFAULT_CAMERA_POSITION, target: [0, 0, 0] };

/**
 * In-canvas navigation controller: flies the camera to the requested pose
 * whenever it changes (via the reusable useSmoothCamera hook) and reports
 * throttled camera telemetry for the DOM navigation overlays. Renders nothing.
 */
export default function CameraNavigator({ focusPose, onReadout }: CameraNavigatorProps) {
  const { moveTo } = useSmoothCamera();
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  useEffect(() => {
    moveTo(focusPose ?? DEFAULT_POSE);
  }, [focusPose, moveTo]);

  const acc = useRef(0);
  useFrame((_, delta) => {
    acc.current += delta;
    if (acc.current < 0.08) return;
    acc.current = 0;
    const targetX = controls ? controls.target.x : 0;
    const targetZ = controls ? controls.target.z : 0;
    const dx = targetX - camera.position.x;
    const dz = targetZ - camera.position.z;
    // Heading: 0° = facing north (−Z), 90° = east (+X).
    const heading = (Math.atan2(dx, -dz) * 180) / Math.PI;
    onReadout({
      heading: (heading + 360) % 360,
      camX: camera.position.x,
      camZ: camera.position.z,
      targetX,
      targetZ,
    });
  });

  return null;
}
