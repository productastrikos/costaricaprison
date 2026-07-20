import React from 'react';
import PrisonBuildingBase, { PrisonBuildingBaseProps } from './PrisonBuildingBase';
import { VISITOR_LAYOUT } from '../buildingLayout';
import { buildVisitorInterior } from './interiors/layouts';

export type VisitorProcessingProps = PrisonBuildingBaseProps;

/** Visitor processing — the public-facing building nearest the entrance and parking lot. */
export default function VisitorProcessing(props: VisitorProcessingProps) {
  return (
    <PrisonBuildingBase
      id="VIS"
      label="Visitor Processing"
      interior={buildVisitorInterior}
      position={VISITOR_LAYOUT.position}
      width={VISITOR_LAYOUT.width}
      depth={VISITOR_LAYOUT.depth}
      height={7}
      floors={2}
      roofType="gable"
      wallColor="#c9bfa0"
      accentColor="#7c7057"
      doorFacades={['south']}
      {...props}
    />
  );
}
