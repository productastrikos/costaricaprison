import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export interface DoubleClickDragZoomProps {
  /** Zoom sensitivity — larger dollies faster per pixel dragged. */
  speed?: number;
}

/**
 * Adds a "double-click and drag" zoom gesture on top of OrbitControls: press,
 * release, then press-and-hold again and drag vertically to dolly the camera
 * toward / away from the orbit target (drag up = zoom in, down = zoom out).
 * While the gesture is active OrbitControls is temporarily disabled so the two
 * don't fight; normal left-drag rotate / right-drag pan / scroll zoom are
 * untouched. Renders nothing.
 */
export default function DoubleClickDragZoom({ speed = 0.9 }: DoubleClickDragZoomProps) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  const state = useRef({ lastUp: 0, lastX: 0, lastY: 0, active: false, prevY: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const s = state.current;
    const DOUBLE_MS = 320; // max gap between the two presses
    const NEAR_PX = 30; // second press must land near the first

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || !controls) return;
      const now = performance.now();
      const near = Math.hypot(e.clientX - s.lastX, e.clientY - s.lastY) < NEAR_PX;
      if (now - s.lastUp < DOUBLE_MS && near) {
        // Second press of a double-click → enter drag-zoom mode.
        s.active = true;
        s.prevY = e.clientY;
        controls.enabled = false;
        el.setPointerCapture?.(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!s.active || !controls) return;
      const dy = e.clientY - s.prevY;
      s.prevY = e.clientY;
      const offset = camera.position.clone().sub(controls.target);
      const dist = offset.length();
      // Drag up (dy < 0) → closer; drag down (dy > 0) → farther.
      const factor = Math.exp((dy / 100) * speed);
      const next = THREE.MathUtils.clamp(dist * factor, controls.minDistance, controls.maxDistance);
      offset.setLength(next);
      camera.position.copy(controls.target).add(offset);
      controls.update();
    };

    const endGesture = (e: PointerEvent) => {
      s.lastUp = performance.now();
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      if (s.active) {
        s.active = false;
        if (controls) controls.enabled = true;
        el.releasePointerCapture?.(e.pointerId);
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endGesture);
    el.addEventListener('pointercancel', endGesture);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endGesture);
      el.removeEventListener('pointercancel', endGesture);
      if (controls) controls.enabled = true;
    };
  }, [gl, camera, controls, speed]);

  return null;
}
