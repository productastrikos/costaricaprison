import React from 'react';
import PrisonBuildingBase, { PrisonBuildingBaseProps } from './PrisonBuildingBase';
import { INTAKE_LAYOUT } from '../buildingLayout';
import { buildIntakeInterior } from './interiors/layouts';

export type IntakeProcessingProps = PrisonBuildingBaseProps;

/** Intake & processing — the first stop for new admissions, near the main gate. */
export default function IntakeProcessing(props: IntakeProcessingProps) {
  return (
    <PrisonBuildingBase
      id="INT"
      label="Intake & Processing"
      interior={buildIntakeInterior}
      position={INTAKE_LAYOUT.position}
      width={INTAKE_LAYOUT.width}
      depth={INTAKE_LAYOUT.depth}
      height={7}
      floors={2}
      roofType="gable"
      wallColor="#b7bcae"
      accentColor="#6c7362"
      doorFacades={['south']}
      {...props}
    />
  );
}
