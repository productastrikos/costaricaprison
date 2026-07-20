import React, { useCallback, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { createAsphaltMaterial, createSecurityFenceMaterial, createMarkingMaterial } from '../../../materials/campusMaterials';
import { createRoofMaterial } from '../../../materials/buildingMaterials';
import { bakeTransform, mergeStatic, segmentBox, Point2 } from '../../../utils/campusGeometry';
import { REC_LAYOUT } from '../buildingLayout';

export interface RecreationYardProps {
  position?: [number, number, number];
  width?: number;
  depth?: number;
  id?: string;
  label?: string;
  selected?: boolean;
  onSelect?: (id: string, label: string) => void;
  onHover?: (id: string | null) => void;
}

const FENCE_HEIGHT = 2.6;
const SHELTER_SIZE = 6;
const SHELTER_HEIGHT = 3;

/**
 * Open-air recreation yard: a fenced court with painted markings and a
 * small covered shelter. Deliberately not a PrisonBuildingBase — it's
 * outdoor space, not an enclosed building — but still clickable to identify.
 */
export default function RecreationYard({
  position = REC_LAYOUT.position,
  width = REC_LAYOUT.width,
  depth = REC_LAYOUT.depth,
  id = 'REC',
  label = 'Recreation Yard',
  onSelect,
  onHover,
}: RecreationYardProps) {
  const courtGeometry = useMemo(() => new THREE.BoxGeometry(width, 0.05, depth), [width, depth]);
  const courtMaterial = useMemo(() => createAsphaltMaterial(), []);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelect?.(id, label);
    },
    [onSelect, id, label],
  );
  const handleOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = 'pointer';
      onHover?.(id);
    },
    [onHover, id],
  );
  const handleOut = useCallback(() => {
    document.body.style.cursor = '';
    onHover?.(null);
  }, [onHover]);

  const markingGeometry = useMemo(() => {
    const lineWidth = 0.12;
    const hw = width / 2 - 1;
    const hd = depth / 2 - 1;
    const corners: Point2[] = [
      { x: -hw, z: -hd }, { x: hw, z: -hd }, { x: hw, z: hd }, { x: -hw, z: hd }, { x: -hw, z: -hd },
    ];
    const border = corners.slice(0, 4).map((_, i) => segmentBox(corners[i], corners[i + 1], lineWidth, 0.02, 0.06));
    const centerLine = segmentBox({ x: 0, z: -hd }, { x: 0, z: hd }, lineWidth, 0.02, 0.06);
    return mergeStatic([...border, centerLine]);
  }, [width, depth]);
  const markingMaterial = useMemo(() => createMarkingMaterial(), []);

  const fenceGeometry = useMemo(() => {
    const hw = width / 2;
    const hd = depth / 2;
    const corners: Point2[] = [
      { x: -hw, z: -hd }, { x: hw, z: -hd }, { x: hw, z: hd }, { x: -hw, z: hd }, { x: -hw, z: -hd },
    ];
    return mergeStatic(
      corners.slice(0, 4).map((_, i) => segmentBox(corners[i], corners[i + 1], 0.08, FENCE_HEIGHT, FENCE_HEIGHT / 2)),
    );
  }, [width, depth]);
  const fenceMaterial = useMemo(() => createSecurityFenceMaterial(), []);

  const shelterGeometry = useMemo(() => {
    const half = SHELTER_SIZE / 2;
    const postPositions: Point2[] = [
      { x: -half, z: -half }, { x: half, z: -half }, { x: half, z: half }, { x: -half, z: half },
    ];
    const posts = postPositions.map((p) =>
      bakeTransform(new THREE.CylinderGeometry(0.14, 0.14, SHELTER_HEIGHT, 6), [p.x, SHELTER_HEIGHT / 2, p.z]),
    );
    const roof = bakeTransform(new THREE.BoxGeometry(SHELTER_SIZE + 1, 0.2, SHELTER_SIZE + 1), [0, SHELTER_HEIGHT + 0.1, 0]);
    return mergeStatic([...posts, roof]);
  }, []);
  const shelterMaterial = useMemo(() => createRoofMaterial('#6f7a5e'), []);

  useEffect(() => () => {
    courtGeometry.dispose();
    courtMaterial.dispose();
    markingGeometry.dispose();
    markingMaterial.dispose();
    fenceGeometry.dispose();
    fenceMaterial.dispose();
    shelterGeometry.dispose();
    shelterMaterial.dispose();
  }, [courtGeometry, courtMaterial, markingGeometry, markingMaterial, fenceGeometry, fenceMaterial, shelterGeometry, shelterMaterial]);

  return (
    <group position={position}>
      <mesh
        geometry={courtGeometry}
        material={courtMaterial}
        position={[0, 0.03, 0]}
        receiveShadow
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      />
      <mesh geometry={markingGeometry} material={markingMaterial} />
      <mesh geometry={fenceGeometry} material={fenceMaterial} castShadow />
      <group position={[width / 2 - SHELTER_SIZE, 0, -(depth / 2 - SHELTER_SIZE)]}>
        <mesh geometry={shelterGeometry} material={shelterMaterial} castShadow receiveShadow />
      </group>
    </group>
  );
}
