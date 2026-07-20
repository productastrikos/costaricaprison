import React from 'react';
import SecurityCameras from './SecurityCameras';
import SearchLights from './SearchLights';
import FenceLights from './FenceLights';
import MetalDetectors from './MetalDetectors';
import SecurityGates from './SecurityGates';
import CheckpointBarriers from './CheckpointBarriers';

export interface PrisonSecurityProps {
  night?: boolean;
}

/**
 * All prison security elements: rotating CCTV cameras, tower searchlights
 * (which sweep and illuminate at night), perimeter fence lights, walk-through
 * metal detectors, the main sliding security gate, and checkpoint boom
 * barriers. Each subsystem is its own modular component.
 */
export default function PrisonSecurity({ night = false }: PrisonSecurityProps) {
  return (
    <group>
      <SecurityCameras />
      <SearchLights night={night} />
      <FenceLights night={night} />
      <MetalDetectors />
      <SecurityGates />
      <CheckpointBarriers />
    </group>
  );
}
