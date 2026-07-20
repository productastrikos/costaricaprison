import React from 'react';
import PrisonBuildingBase, { PrisonBuildingBaseProps } from './PrisonBuildingBase';
import { MAX_LAYOUT } from '../buildingLayout';
import { buildMaxSecurityInterior } from './interiors/layouts';

export type MaximumSecurityWingProps = PrisonBuildingBaseProps;

/** The facility's maximum-security housing wing — the largest, tallest block on campus. */
export default function MaximumSecurityWing(props: MaximumSecurityWingProps) {
  return (
    <PrisonBuildingBase
      id="MAX"
      label="Maximum Security Wing"
      interior={buildMaxSecurityInterior}
      position={MAX_LAYOUT.position}
      width={MAX_LAYOUT.width}
      depth={MAX_LAYOUT.depth}
      height={13}
      floors={4}
      roofType="flat"
      wallColor="#82858a"
      accentColor="#44474c"
      doorFacades={['south']}
      {...props}
    />
  );
}
