import React from 'react';
import PrisonBuildingBase, { PrisonBuildingBaseProps } from './PrisonBuildingBase';
import { BLOCK_A_LAYOUT } from '../buildingLayout';
import { buildCellBlockInterior } from './interiors/layouts';

export type CellBlockAProps = PrisonBuildingBaseProps;

/** General-population housing block A. */
export default function CellBlockA(props: CellBlockAProps) {
  return (
    <PrisonBuildingBase
      id="BLK-A"
      label="Cell Block A"
      interior={buildCellBlockInterior}
      position={BLOCK_A_LAYOUT.position}
      width={BLOCK_A_LAYOUT.width}
      depth={BLOCK_A_LAYOUT.depth}
      height={11}
      floors={3}
      roofType="flat"
      wallColor="#9a9d9f"
      accentColor="#54595f"
      doorFacades={['south']}
      {...props}
    />
  );
}
