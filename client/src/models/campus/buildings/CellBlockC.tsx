import React from 'react';
import PrisonBuildingBase, { PrisonBuildingBaseProps } from './PrisonBuildingBase';
import { BLOCK_C_LAYOUT } from '../buildingLayout';
import { buildCellBlockInterior } from './interiors/layouts';

export type CellBlockCProps = PrisonBuildingBaseProps;

/** General-population housing block C. */
export default function CellBlockC(props: CellBlockCProps) {
  return (
    <PrisonBuildingBase
      id="BLK-C"
      label="Cell Block C"
      interior={buildCellBlockInterior}
      position={BLOCK_C_LAYOUT.position}
      width={BLOCK_C_LAYOUT.width}
      depth={BLOCK_C_LAYOUT.depth}
      height={11}
      floors={3}
      roofType="flat"
      wallColor="#9fa2a5"
      accentColor="#54595f"
      doorFacades={['south']}
      {...props}
    />
  );
}
