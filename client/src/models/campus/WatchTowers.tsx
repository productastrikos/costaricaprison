import React from 'react';
import WatchTower from './WatchTower';
import { CAMPUS_HALF_WIDTH, CAMPUS_HALF_DEPTH } from '../../utils/campusGeometry';

interface CornerSpec {
  position: [number, number, number];
  rotationY: number;
}

const CORNERS: CornerSpec[] = [
  { position: [-CAMPUS_HALF_WIDTH, 0, -CAMPUS_HALF_DEPTH], rotationY: Math.PI * 0.25 },
  { position: [CAMPUS_HALF_WIDTH, 0, -CAMPUS_HALF_DEPTH], rotationY: -Math.PI * 0.25 },
  { position: [CAMPUS_HALF_WIDTH, 0, CAMPUS_HALF_DEPTH], rotationY: -Math.PI * 0.75 },
  { position: [-CAMPUS_HALF_WIDTH, 0, CAMPUS_HALF_DEPTH], rotationY: Math.PI * 0.75 },
];

/** Places a WatchTower at each of the four perimeter wall corners. */
export default function WatchTowers() {
  return (
    <>
      {CORNERS.map((corner, i) => (
        <WatchTower key={i} position={corner.position} rotationY={corner.rotationY} />
      ))}
    </>
  );
}
