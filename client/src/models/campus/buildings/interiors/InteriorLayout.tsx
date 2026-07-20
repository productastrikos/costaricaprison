import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { bakeTransform, mergeStatic } from '../../../../utils/campusGeometry';
import { INTERIOR_FLOOR_Y } from './roomGeometry';
import { createGateMaterial } from './interiorMaterials';
import Room from './Room';
import CellRow from './CellRow';
import { InteriorBuilder } from './types';

export interface InteriorLayoutProps {
  width: number;
  depth: number;
  height: number;
  build: InteriorBuilder;
}

/**
 * Renders a building's interior from an InteriorBuilder: reusable Room and
 * CellRow components plus merged security-gate bars. Mounted only while the
 * building is selected.
 */
export default function InteriorLayout({ width, depth, height, build }: InteriorLayoutProps) {
  const layout = useMemo(() => build(width, depth, height), [build, width, depth, height]);

  const gateGeometry = useMemo(() => {
    if (!layout.gates?.length) return null;
    const h = layout.wallHeight;
    const bars = layout.gates.map((g) => {
      const w = g.along === 'x' ? g.width : 0.18;
      const d = g.along === 'x' ? 0.18 : g.width;
      return bakeTransform(new THREE.BoxGeometry(w, h, d), [g.cx, h / 2, g.cz]);
    });
    return mergeStatic(bars);
  }, [layout]);
  const gateMaterial = useMemo(() => createGateMaterial(), []);

  useEffect(() => () => {
    gateGeometry?.dispose();
    gateMaterial.dispose();
  }, [gateGeometry, gateMaterial]);

  return (
    <group>
      {layout.rooms.map((r) => (
        <Room
          key={r.id}
          label={r.label}
          kind={r.kind}
          cx={r.cx}
          cz={r.cz}
          width={r.width}
          depth={r.depth}
          wallHeight={layout.wallHeight}
        />
      ))}
      {layout.cellRows?.map((c) => (
        <CellRow
          key={c.id}
          label={c.label}
          kind={c.kind}
          count={c.count}
          startX={c.startX}
          startZ={c.startZ}
          stepX={c.stepX}
          stepZ={c.stepZ}
          cellWidth={c.cellWidth}
          cellDepth={c.cellDepth}
          wallHeight={layout.wallHeight}
        />
      ))}
      {gateGeometry && (
        <group position={[0, INTERIOR_FLOOR_Y, 0]}>
          <mesh geometry={gateGeometry} material={gateMaterial} castShadow />
        </group>
      )}
    </group>
  );
}
