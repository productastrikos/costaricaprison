import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import SearchLight from './SearchLight';
import { SEARCHLIGHT_MOUNTS } from './securityLayout';
import { createHousingMaterial, createBeamMaterial } from '../../../materials/securityMaterials';

export interface SearchLightsProps {
  night: boolean;
}

/** The four watch-tower searchlights. Shared housing/beam geometry + materials. */
export default function SearchLights({ night }: SearchLightsProps) {
  const housingGeometry = useMemo(() => new THREE.CylinderGeometry(0.5, 0.62, 0.85, 14), []);
  // Cone with its apex translated to the origin so the beam emanates from the housing.
  const beamGeometry = useMemo(() => {
    const g = new THREE.ConeGeometry(4.5, 34, 22, 1, true);
    g.translate(0, -17, 0);
    return g;
  }, []);

  const housingMaterial = useMemo(() => createHousingMaterial(), []);
  const beamMaterial = useMemo(() => createBeamMaterial(), []);

  useEffect(() => () => {
    housingGeometry.dispose();
    beamGeometry.dispose();
    housingMaterial.dispose();
    beamMaterial.dispose();
  }, [housingGeometry, beamGeometry, housingMaterial, beamMaterial]);

  return (
    <group>
      {SEARCHLIGHT_MOUNTS.map((mount, i) => (
        <SearchLight
          key={i}
          mount={mount}
          night={night}
          housingGeometry={housingGeometry}
          beamGeometry={beamGeometry}
          housingMaterial={housingMaterial}
          beamMaterial={beamMaterial}
          phase={i * 1.3}
          sweepSpeed={0.3 + (i % 2) * 0.1}
        />
      ))}
    </group>
  );
}
