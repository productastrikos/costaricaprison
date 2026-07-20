import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import CameraRig from './CameraRig';
import Lighting from './Lighting';
import Ground from './Ground';
import SkyEnvironment from './SkyEnvironment';
import ProceduralEnvironment from './ProceduralEnvironment';
import DebugHelpers from './DebugHelpers';
import PerformanceStats from './PerformanceStats';
import { useDebugMode } from '../hooks/useDebugMode';
import { CAMPUS_GROUND_SIZE } from './constants';

export interface SceneProps {
  /** Force debug helpers (grid/axes/stats) on or off; defaults to useDebugMode(). */
  debug?: boolean;
  /** Future campus building models mount here. */
  children?: React.ReactNode;
  className?: string;
  /** Fires when a click hits no interactive object (empty background). */
  onPointerMissed?: () => void;
  /** Night mode: hides the day sky and dims the key light. */
  night?: boolean;
}

/**
 * Reusable Digital Twin scene foundation: camera + controls, lighting, sky,
 * ground, and dev-only helpers. Fills its parent container — size it via
 * the wrapping element (see components/DigitalTwinCanvas).
 */
export default function Scene({ debug, children, className, onPointerMissed, night = false }: SceneProps) {
  const autoDebug = useDebugMode();
  const showDebug = debug ?? autoDebug;
  const bg = night ? '#05080e' : '#0b1622';

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
        performance={{ min: 0.5 }}
        onPointerMissed={onPointerMissed}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={night ? [bg, 150, 520] : [bg, 220, 620]} />

        <CameraRig />
        <Lighting night={night} />

        <Suspense fallback={null}>
          {!night && <SkyEnvironment />}
          <ProceduralEnvironment />
          <Ground size={CAMPUS_GROUND_SIZE} />
          {children}
        </Suspense>

        {showDebug && <DebugHelpers gridSize={CAMPUS_GROUND_SIZE} axesSize={40} />}
        {showDebug && <PerformanceStats />}
      </Canvas>
    </div>
  );
}
