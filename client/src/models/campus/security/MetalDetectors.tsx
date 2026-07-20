import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import MetalDetector from './MetalDetector';
import { METAL_DETECTORS } from './securityLayout';
import { bakeTransform, mergeStatic } from '../../../utils/campusGeometry';
import { createDetectorFrameMaterial, createDetectorPanelMaterial } from '../../../materials/securityMaterials';

const PILLAR = 0.9;
const HEIGHT = 2.4;

/** All walk-through metal detectors. Shared archway geometry + materials. */
export default function MetalDetectors() {
  const frameGeometry = useMemo(
    () =>
      mergeStatic([
        bakeTransform(new THREE.BoxGeometry(0.3, HEIGHT, 0.5), [-PILLAR, HEIGHT / 2, 0]),
        bakeTransform(new THREE.BoxGeometry(0.3, HEIGHT, 0.5), [PILLAR, HEIGHT / 2, 0]),
        bakeTransform(new THREE.BoxGeometry(PILLAR * 2 + 0.3, 0.3, 0.5), [0, HEIGHT + 0.15, 0]),
      ]),
    [],
  );
  const panelGeometry = useMemo(
    () =>
      mergeStatic([
        bakeTransform(new THREE.BoxGeometry(0.14, HEIGHT - 0.5, 0.42), [-(PILLAR - 0.18), (HEIGHT - 0.5) / 2 + 0.1, 0]),
        bakeTransform(new THREE.BoxGeometry(0.14, HEIGHT - 0.5, 0.42), [PILLAR - 0.18, (HEIGHT - 0.5) / 2 + 0.1, 0]),
      ]),
    [],
  );

  const frameMaterial = useMemo(() => createDetectorFrameMaterial(), []);
  const panelMaterial = useMemo(() => createDetectorPanelMaterial(), []);

  useEffect(() => () => {
    frameGeometry.dispose();
    panelGeometry.dispose();
    frameMaterial.dispose();
    panelMaterial.dispose();
  }, [frameGeometry, panelGeometry, frameMaterial, panelMaterial]);

  return (
    <group>
      {METAL_DETECTORS.map((mount, i) => (
        <MetalDetector
          key={i}
          mount={mount}
          frameGeometry={frameGeometry}
          panelGeometry={panelGeometry}
          frameMaterial={frameMaterial}
          panelMaterial={panelMaterial}
        />
      ))}
    </group>
  );
}
