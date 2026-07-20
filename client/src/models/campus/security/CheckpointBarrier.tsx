import React from 'react';
import * as THREE from 'three';
import { Mount } from './securityLayout';

export interface CheckpointBarrierProps {
  mount: Mount;
  baseGeometry: THREE.BufferGeometry;
  postGeometry: THREE.BufferGeometry;
  armRedGeometry: THREE.BufferGeometry;
  armWhiteGeometry: THREE.BufferGeometry;
  bollardGeometry: THREE.BufferGeometry;
  postMaterial: THREE.Material;
  redMaterial: THREE.Material;
  whiteMaterial: THREE.Material;
  bollardMaterial: THREE.Material;
}

/** A boom-barrier checkpoint: base, post, striped horizontal arm, and flanking bollards. */
export default function CheckpointBarrier({
  mount,
  baseGeometry,
  postGeometry,
  armRedGeometry,
  armWhiteGeometry,
  bollardGeometry,
  postMaterial,
  redMaterial,
  whiteMaterial,
  bollardMaterial,
}: CheckpointBarrierProps) {
  return (
    <group position={mount.position} rotation={[0, mount.rotationY, 0]}>
      <mesh geometry={baseGeometry} material={postMaterial} receiveShadow />
      <mesh geometry={postGeometry} material={postMaterial} castShadow />
      <mesh geometry={armRedGeometry} material={redMaterial} castShadow />
      <mesh geometry={armWhiteGeometry} material={whiteMaterial} castShadow />
      <mesh geometry={bollardGeometry} material={bollardMaterial} position={[-3.6, 0.45, 0]} castShadow />
      <mesh geometry={bollardGeometry} material={bollardMaterial} position={[3.6, 0.45, 0]} castShadow />
    </group>
  );
}
