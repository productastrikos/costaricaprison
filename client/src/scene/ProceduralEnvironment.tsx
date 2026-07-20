import React from 'react';
import { Environment, Lightformer } from '@react-three/drei';

/**
 * Procedural image-based-lighting environment — built entirely from
 * Lightformer emitters (no HDR/image files). It is baked once into a small
 * cubemap (frames=1) and set as scene.environment, giving the PBR metals,
 * steel fencing and glass something realistic to reflect: a bright sky panel
 * overhead, a warm horizon band, and cool side fill. `background={false}`
 * keeps the visible <Sky> backdrop unchanged.
 */
export default function ProceduralEnvironment() {
  return (
    <Environment resolution={256} frames={1} background={false} environmentIntensity={0.65}>
      {/* Overhead sky panel — the dominant reflection */}
      <Lightformer
        form="rect"
        intensity={1.4}
        color="#cfe0ff"
        scale={[60, 60, 1]}
        position={[0, 40, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* Warm low sun/horizon toward the directional light */}
      <Lightformer
        form="rect"
        intensity={1.1}
        color="#ffe4bf"
        scale={[40, 14, 1]}
        position={[30, 8, 25]}
        rotation={[0, -Math.PI / 4, 0]}
      />
      {/* Cool sky fill on the opposite side */}
      <Lightformer
        form="rect"
        intensity={0.5}
        color="#9fb6d6"
        scale={[40, 14, 1]}
        position={[-30, 10, -25]}
        rotation={[0, (3 * Math.PI) / 4, 0]}
      />
      {/* Darker ground bounce to keep undersides from going flat-black */}
      <Lightformer
        form="rect"
        intensity={0.3}
        color="#4a4a44"
        scale={[60, 60, 1]}
        position={[0, -6, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </Environment>
  );
}
