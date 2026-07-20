import React from 'react';
import { Sky } from '@react-three/drei';
import { SUN_POSITION } from './constants';

/** Daytime sky dome; sun disc aligned with Lighting's directional light. */
export default function SkyEnvironment() {
  return (
    <Sky
      distance={4500}
      sunPosition={SUN_POSITION}
      turbidity={8}
      rayleigh={1.2}
      mieCoefficient={0.006}
      mieDirectionalG={0.8}
    />
  );
}
