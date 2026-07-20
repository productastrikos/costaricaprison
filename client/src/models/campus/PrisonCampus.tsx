import React from 'react';
import GreenLandscape from './GreenLandscape';
import InternalRoads from './InternalRoads';
import Sidewalks from './Sidewalks';
import ParkingLot from './ParkingLot';
import PerimeterWall from './PerimeterWall';
import WatchTowers from './WatchTowers';
import MainGate from './MainGate';
import LightingPoles from './LightingPoles';

/**
 * Full prison campus shell viewed from above: perimeter, gate, roads,
 * grounds and site lighting. No interior buildings yet — those compose
 * on top of this same layout in a later phase.
 */
export default function PrisonCampus() {
  return (
    <group>
      <GreenLandscape />
      <InternalRoads />
      <Sidewalks />
      <ParkingLot />
      <PerimeterWall />
      <WatchTowers />
      <MainGate />
      <LightingPoles />
    </group>
  );
}
