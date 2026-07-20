import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import SecurityCamera from './SecurityCamera';
import { CAMERA_MOUNTS } from './securityLayout';
import { createCameraBodyMaterial, createHousingMaterial, createLensMaterial } from '../../../materials/securityMaterials';

/**
 * All perimeter CCTV cameras. Geometries and materials are built once here and
 * shared across every camera instance (cheap); each SecurityCamera only owns
 * its animated head transform.
 */
export default function SecurityCameras() {
  const bracketGeometry = useMemo(() => new THREE.BoxGeometry(0.18, 0.18, 0.8), []);
  const bodyGeometry = useMemo(() => new THREE.BoxGeometry(0.5, 0.42, 0.9), []);
  const lensGeometry = useMemo(() => new THREE.CylinderGeometry(0.15, 0.17, 0.22, 12), []);

  const bodyMaterial = useMemo(() => createCameraBodyMaterial(), []);
  const housingMaterial = useMemo(() => createHousingMaterial(), []);
  const lensMaterial = useMemo(() => createLensMaterial(), []);

  useEffect(() => () => {
    bracketGeometry.dispose();
    bodyGeometry.dispose();
    lensGeometry.dispose();
    bodyMaterial.dispose();
    housingMaterial.dispose();
    lensMaterial.dispose();
  }, [bracketGeometry, bodyGeometry, lensGeometry, bodyMaterial, housingMaterial, lensMaterial]);

  return (
    <group>
      {CAMERA_MOUNTS.map((mount, i) => (
        <SecurityCamera
          key={i}
          mount={mount}
          bracketGeometry={bracketGeometry}
          bodyGeometry={bodyGeometry}
          lensGeometry={lensGeometry}
          bodyMaterial={bodyMaterial}
          housingMaterial={housingMaterial}
          lensMaterial={lensMaterial}
          phase={i * 0.9}
          speed={0.45 + (i % 3) * 0.08}
        />
      ))}
    </group>
  );
}
