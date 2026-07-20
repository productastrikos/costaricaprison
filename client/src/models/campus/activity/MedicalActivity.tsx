import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import Vehicle from '../../vehicles/Vehicle';
import Figure from '../../people/Figure';
import RouteFollower from './RouteFollower';
import BlinkingBeacon from './BlinkingBeacon';
import { createFigureGeometry, disposeFigureGeometry } from '../../people/figureParts';
import { buildRouteSampler } from '../../../utils/patrolRoute';
import { bakeTransform, mergeStatic } from '../../../utils/campusGeometry';
import {
  createAmbulanceBodyMaterial,
  createJeepGlassMaterial,
  createTireMaterial,
  createBeaconRedMaterial,
  createBeaconBlueMaterial,
  createSkinMaterial,
  createMedicUniformMaterial,
  createMedicCapMaterial,
} from '../../../materials/patrolMaterials';
import { MEDICAL } from './activityLayout';

/**
 * Medical-wing activity: an ambulance parked at the wing with its light bar
 * strobing, a red-cross sign pulsing over the door, and a medic shuttling back
 * and forth between the ambulance and the entrance. Composes the reusable
 * Vehicle, Figure, RouteFollower and BlinkingBeacon parts.
 */
export default function MedicalActivity() {
  const { ambulance, crossSign, medicPath } = MEDICAL;

  const vehicleMaterials = useMemo(
    () => ({
      body: createAmbulanceBodyMaterial(),
      glass: createJeepGlassMaterial(),
      tire: createTireMaterial(),
      beaconA: createBeaconRedMaterial(),
      beaconB: createBeaconBlueMaterial(),
    }),
    [],
  );

  const figureGeometry = useMemo(() => createFigureGeometry(), []);
  const medicMaterials = useMemo(
    () => ({ uniform: createMedicUniformMaterial(), skin: createSkinMaterial(), cap: createMedicCapMaterial() }),
    [],
  );
  // A red-cross '+' — two bars merged into one draw call.
  const crossGeometry = useMemo(
    () =>
      mergeStatic([
        bakeTransform(new THREE.BoxGeometry(0.45, 1.4, 0.16)),
        bakeTransform(new THREE.BoxGeometry(1.4, 0.45, 0.16)),
      ]),
    [],
  );

  const medicRoute = useMemo(() => buildRouteSampler(medicPath, true), [medicPath]);

  useEffect(
    () => () => {
      vehicleMaterials.body.dispose();
      vehicleMaterials.glass.dispose();
      vehicleMaterials.tire.dispose();
      vehicleMaterials.beaconA.dispose();
      vehicleMaterials.beaconB.dispose();
      disposeFigureGeometry(figureGeometry);
      medicMaterials.uniform.dispose();
      medicMaterials.skin.dispose();
      medicMaterials.cap.dispose();
      crossGeometry.dispose();
    },
    [vehicleMaterials, figureGeometry, medicMaterials, crossGeometry],
  );

  return (
    <group>
      {/* Parked ambulance, beacons strobing */}
      <group position={[ambulance.x, 0, ambulance.z]} rotation={[0, ambulance.rotationY, 0]}>
        <Vehicle materials={vehicleMaterials} wheelSpin={0} beacon boxy length={5.6} width={2.2} height={2.4} />
      </group>

      {/* Medic shuttling between the ambulance and the wing door */}
      <RouteFollower route={medicRoute} speed={1.1} turnRate={5}>
        <Figure geometry={figureGeometry} materials={medicMaterials} walking cadence={5.5} swing={0.4} />
      </RouteFollower>

      {/* Pulsing red-cross sign over the entrance */}
      <BlinkingBeacon
        position={[crossSign.x, crossSign.y, crossSign.z]}
        geometry={crossGeometry}
        color="#ff3b3b"
        mode="pulse"
        period={2.2}
        peakIntensity={1.8}
      />
    </group>
  );
}
