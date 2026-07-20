import React from 'react';
import MaximumSecurityWing from './buildings/MaximumSecurityWing';
import CellBlockA from './buildings/CellBlockA';
import CellBlockB from './buildings/CellBlockB';
import CellBlockC from './buildings/CellBlockC';
import RecreationYard from './buildings/RecreationYard';
import MedicalWing from './buildings/MedicalWing';
import IntakeProcessing from './buildings/IntakeProcessing';
import VisitorProcessing from './buildings/VisitorProcessing';
import BuildingPathways from './BuildingPathways';
import BuildingHighlight from './BuildingHighlight';
import BuildingLabel from './BuildingLabel';
import { getBuilding } from './campusBuildings';

export interface PrisonBuildingsProps {
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (id: string, label: string) => void;
  onHover?: (id: string | null) => void;
}

/**
 * All major campus buildings, the pathways connecting them, and the in-scene
 * navigation affordances (selection ring, hover ring, hover/selected name
 * label). Selection/hover state is lifted to the caller and highlights are
 * driven off the shared building registry — nothing per-building is hardcoded.
 */
export default function PrisonBuildings({ selectedId = null, hoveredId = null, onSelect, onHover }: PrisonBuildingsProps) {
  const sel = (id: string) => selectedId === id;
  const shared = { onSelect, onHover };

  const selectedBuilding = getBuilding(selectedId);
  const hoveredBuilding = getBuilding(hoveredId);
  // Label the hovered building, or the selected one when nothing is hovered.
  const labelBuilding = hoveredBuilding ?? selectedBuilding;

  return (
    <group>
      <BuildingPathways />
      <MaximumSecurityWing selected={sel('MAX')} {...shared} />
      <CellBlockA selected={sel('BLK-A')} {...shared} />
      <CellBlockB selected={sel('BLK-B')} {...shared} />
      <CellBlockC selected={sel('BLK-C')} {...shared} />
      <RecreationYard selected={sel('REC')} {...shared} />
      <MedicalWing selected={sel('MED')} {...shared} />
      <IntakeProcessing selected={sel('INT')} {...shared} />
      <VisitorProcessing selected={sel('VIS')} {...shared} />

      {selectedBuilding && <BuildingHighlight building={selectedBuilding} color="#4aa8ff" strong />}
      {hoveredBuilding && hoveredBuilding.id !== selectedId && (
        <BuildingHighlight building={hoveredBuilding} color="#9fd0ff" />
      )}
      {labelBuilding && <BuildingLabel building={labelBuilding} accent={labelBuilding.id === selectedId} />}
    </group>
  );
}
