import React, { useEffect, useMemo } from 'react';
import SlidingDoor from './SlidingDoor';
import { createDoorMaterial } from '../../../materials/buildingMaterials';
import {
  MAX_LAYOUT,
  BLOCK_A_LAYOUT,
  BLOCK_B_LAYOUT,
  BLOCK_C_LAYOUT,
  INTAKE_LAYOUT,
  BuildingLayout,
} from '../buildingLayout';

interface DoorSpec {
  layout: BuildingLayout;
  width: number;
  phase: number;
}

// Powered entrances on the south face of the housing blocks and intake.
const DOORS: DoorSpec[] = [
  { layout: MAX_LAYOUT, width: 3.4, phase: 0 },
  { layout: BLOCK_A_LAYOUT, width: 3, phase: 0.2 },
  { layout: BLOCK_B_LAYOUT, width: 3, phase: 0.45 },
  { layout: BLOCK_C_LAYOUT, width: 3, phase: 0.7 },
  { layout: INTAKE_LAYOUT, width: 3.2, phase: 0.55 },
];

const DOOR_PERIOD = 9;

/**
 * Sliding entrance doors on the prison buildings, each opening and closing on
 * the shared {@link SlidingDoor} curve with a staggered phase so the campus
 * doesn't cycle in unison. One shared door material, disposed here.
 */
export default function PrisonDoors() {
  const material = useMemo(() => createDoorMaterial(), []);
  useEffect(() => () => material.dispose(), [material]);

  return (
    <group>
      {DOORS.map((d, i) => {
        const southZ = d.layout.position[2] + d.layout.depth / 2 + 0.12;
        return (
          <SlidingDoor
            key={i}
            position={[d.layout.position[0], 0, southZ]}
            width={d.width}
            height={2.7}
            material={material}
            cycle={{ period: DOOR_PERIOD, openHold: 0.2, closedHold: 0.4, phase: d.phase }}
          />
        );
      })}
    </group>
  );
}
