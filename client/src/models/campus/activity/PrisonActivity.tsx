import React from 'react';
import PatrolOfficers from './PatrolOfficers';
import VisitorQueue from './VisitorQueue';
import EntryVehicle from './EntryVehicle';
import MedicalActivity from './MedicalActivity';
import PrisonDoors from './PrisonDoors';
import SecurityBeacons from './SecurityBeacons';

export interface PrisonActivityProps {
  night?: boolean;
}

/**
 * All animated "life" in the Digital Twin, composed from reusable, time-based
 * parts: correctional officers walking a foot patrol, a shuffling visitor
 * queue, a jeep admitted through the (separately animated) main gate, medical-
 * wing activity, powered sliding building doors, and blinking security beacons.
 * The rotating CCTV cameras and sweeping tower searchlights live in
 * PrisonSecurity; the sliding perimeter gate lives in SecurityGates — all share
 * the same motion primitives in ../../../animation/motion.
 */
export default function PrisonActivity({ night = false }: PrisonActivityProps) {
  return (
    <group>
      <PatrolOfficers />
      <VisitorQueue />
      <EntryVehicle />
      <MedicalActivity />
      <PrisonDoors />
      <SecurityBeacons night={night} />
    </group>
  );
}
