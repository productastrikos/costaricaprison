import React from 'react';
import PrisonBuildingBase, { PrisonBuildingBaseProps } from './PrisonBuildingBase';
import { BLOCK_B_LAYOUT } from '../buildingLayout';
import { buildCellBlockInterior } from './interiors/layouts';

export type CellBlockBProps = PrisonBuildingBaseProps;

/** General-population housing block B — the campus's central housing block. */
export default function CellBlockB(props: CellBlockBProps) {
  return (
    <PrisonBuildingBase
      id="BLK-B"
      label="Cell Block B"
      interior={buildCellBlockInterior}
      position={BLOCK_B_LAYOUT.position}
      width={BLOCK_B_LAYOUT.width}
      depth={BLOCK_B_LAYOUT.depth}
      height={11}
      floors={3}
      roofType="flat"
      wallColor="#94979b"
      accentColor="#54595f"
      doorFacades={['south']}
      {...props}
    />
  );
}
