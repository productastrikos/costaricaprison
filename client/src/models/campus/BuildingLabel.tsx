import React from 'react';
import { Html } from '@react-three/drei';
import { CampusBuildingInfo } from './campusBuildings';

export interface BuildingLabelProps {
  building: CampusBuildingInfo;
  accent?: boolean;
}

/** Floating name tag anchored above a building — used as the hover/selected label. */
export default function BuildingLabel({ building, accent = false }: BuildingLabelProps) {
  return (
    <Html
      position={[building.position[0], building.height + 3.5, building.position[2]]}
      center
      distanceFactor={80}
      zIndexRange={[200, 0]}
      pointerEvents="none"
    >
      <div
        style={{
          whiteSpace: 'nowrap',
          padding: '3px 10px',
          borderRadius: 5,
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.05em',
          color: '#eaf2fb',
          background: 'rgba(8,18,28,0.9)',
          border: `1px solid ${accent ? 'rgba(74,168,255,0.75)' : 'rgba(120,150,180,0.5)'}`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}
      >
        <span style={{ color: '#4aa8ff', marginRight: 6 }}>{building.id}</span>
        {building.label}
      </div>
    </Html>
  );
}
