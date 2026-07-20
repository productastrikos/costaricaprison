import React from 'react';
import PrisonBuildingBase, { PrisonBuildingBaseProps } from './PrisonBuildingBase';
import { MED_LAYOUT } from '../buildingLayout';
import { buildMedicalInterior } from './interiors/layouts';

export type MedicalWingProps = PrisonBuildingBaseProps;

/** Medical wing — a lower, clinical building with a pitched roof for visual distinction from housing blocks. */
export default function MedicalWing(props: MedicalWingProps) {
  return (
    <PrisonBuildingBase
      id="MED"
      label="Medical Wing"
      interior={buildMedicalInterior}
      position={MED_LAYOUT.position}
      width={MED_LAYOUT.width}
      depth={MED_LAYOUT.depth}
      height={7.5}
      floors={2}
      roofType="gable"
      wallColor="#c7c2ad"
      accentColor="#7c7566"
      doorFacades={['south']}
      {...props}
    />
  );
}
