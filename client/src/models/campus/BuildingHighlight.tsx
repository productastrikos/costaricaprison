import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { CampusBuildingInfo } from './campusBuildings';

export interface BuildingHighlightProps {
  building: CampusBuildingInfo;
  color?: string;
  /** Selected = brighter/thicker ring; hovered = subtle. */
  strong?: boolean;
}

/**
 * A flat ground ring drawn around a building's footprint to highlight it.
 * Reusable for both hover and selection (via color/strong). Uses an unlit,
 * non-tone-mapped material so the highlight stays crisp against the scene.
 */
export default function BuildingHighlight({ building, color = '#4aa8ff', strong = false }: BuildingHighlightProps) {
  const inner = Math.max(building.width, building.depth) * 0.5 + 1.5;
  const outer = inner + (strong ? 1.6 : 0.9);

  const geometry = useMemo(() => new THREE.RingGeometry(inner, outer, 64), [inner, outer]);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: strong ? 0.85 : 0.5,
        side: THREE.DoubleSide,
        toneMapped: false,
        depthWrite: false,
      }),
    [color, strong],
  );

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[building.position[0], 0.12, building.position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
}
