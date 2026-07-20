import React, { useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { createWallMaterial, createWindowMaterial, createDoorMaterial, createRoofMaterial } from '../../../materials/buildingMaterials';
import { mergeStatic } from '../../../utils/campusGeometry';
import { computeFacadeWindows, buildFlatRoof, buildGableRoof, buildDoor, Facade } from './buildingParts';
import InteriorLayout from './interiors/InteriorLayout';
import { InteriorBuilder } from './interiors/types';

export type RoofType = 'flat' | 'gable';

export interface PrisonBuildingBaseProps {
  id?: string;
  label?: string;
  selected?: boolean;
  onSelect?: (id: string, label: string) => void;
  onHover?: (id: string | null) => void;
  interior?: InteriorBuilder;
  position?: [number, number, number];
  rotationY?: number;
  width?: number;
  depth?: number;
  height?: number;
  floors?: number;
  roofType?: RoofType;
  doorFacades?: Facade[];
  wallColor?: string;
  accentColor?: string;
}

/**
 * Generic rectangular institutional building: walls, a roof (flat+parapet or
 * gable), instanced windows, and flush entrance doors. Clicking selects the
 * building — which turns the outer shell translucent, hides the roof, and
 * reveals the interior room layout with a floating name tag. Every named
 * building (MaximumSecurityWing, CellBlockA, ...) is a thin wrapper around
 * this; position/dimensions/interior are all overridable via props.
 */
export default function PrisonBuildingBase({
  id = 'building',
  label = 'Building',
  selected = false,
  onSelect,
  onHover,
  interior,
  position = [0, 0, 0],
  rotationY = 0,
  width = 30,
  depth = 20,
  height = 10,
  floors = 3,
  roofType = 'flat',
  doorFacades = ['south'],
  wallColor = '#9a9c98',
  accentColor = '#54595f',
}: PrisonBuildingBaseProps) {
  const wallGeometry = useMemo(() => new THREE.BoxGeometry(width, height, depth), [width, height, depth]);
  const wallMaterial = useMemo(() => createWallMaterial(wallColor), [wallColor]);

  // Reveal the interior by turning the shell translucent when selected.
  useEffect(() => {
    wallMaterial.transparent = selected;
    wallMaterial.opacity = selected ? 0.16 : 1;
    wallMaterial.depthWrite = !selected;
    wallMaterial.needsUpdate = true;
  }, [selected, wallMaterial]);

  const flatRoofParts = useMemo(
    () => (roofType === 'flat' ? buildFlatRoof(width, depth, height) : null),
    [roofType, width, depth, height],
  );
  const gableRoofGeometry = useMemo(
    () => (roofType === 'gable' ? buildGableRoof(width, depth, height) : null),
    [roofType, width, depth, height],
  );
  const roofMaterial = useMemo(() => createRoofMaterial(accentColor), [accentColor]);

  const doorGeometry = useMemo(
    () => mergeStatic(doorFacades.map((f) => buildDoor(f, width, depth))),
    [doorFacades, width, depth],
  );
  const doorMaterial = useMemo(() => createDoorMaterial(), []);

  const windowSpecs = useMemo(() => computeFacadeWindows(width, depth, height, floors), [width, depth, height, floors]);
  const windowGeometry = useMemo(() => new THREE.BoxGeometry(1.0, 1.3, 0.12), []);
  const windowMaterial = useMemo(() => createWindowMaterial(), []);
  const windowRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = windowRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    windowSpecs.forEach((w, i) => {
      dummy.position.set(...w.position);
      dummy.rotation.set(0, w.rotationY, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [windowSpecs]);

  useEffect(() => () => {
    wallGeometry.dispose();
    wallMaterial.dispose();
    flatRoofParts?.[0].dispose();
    flatRoofParts?.[1].dispose();
    gableRoofGeometry?.dispose();
    roofMaterial.dispose();
    doorGeometry.dispose();
    doorMaterial.dispose();
    windowGeometry.dispose();
    windowMaterial.dispose();
  }, [wallGeometry, wallMaterial, flatRoofParts, gableRoofGeometry, roofMaterial, doorGeometry, doorMaterial, windowGeometry, windowMaterial]);

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

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh
        geometry={wallGeometry}
        material={wallMaterial}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      />

      {/*
        Shell detail — toggled with `visible` rather than mounted/unmounted so
        the windows InstancedMesh (whose per-instance matrices are set once,
        imperatively) survives selection toggles and reappears intact.
      */}
      <group visible={!selected}>
        {flatRoofParts && (
          <>
            <mesh geometry={flatRoofParts[0]} material={roofMaterial} castShadow receiveShadow />
            <mesh geometry={flatRoofParts[1]} material={roofMaterial} castShadow />
          </>
        )}
        {gableRoofGeometry && <mesh geometry={gableRoofGeometry} material={roofMaterial} castShadow receiveShadow />}
        <mesh geometry={doorGeometry} material={doorMaterial} />
        <instancedMesh ref={windowRef} args={[windowGeometry, windowMaterial, windowSpecs.length]} />
      </group>

      {/* Interior — only mounted while selected */}
      {selected && interior && <InteriorLayout width={width} depth={depth} height={height} build={interior} />}
    </group>
  );
}
