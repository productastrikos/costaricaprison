import React from 'react';

export interface DebugHelpersProps {
  gridSize?: number;
  axesSize?: number;
}

/** Grid + axes helpers for development navigation reference. Debug-only. */
export default function DebugHelpers({ gridSize = 400, axesSize = 40 }: DebugHelpersProps) {
  return (
    <>
      <gridHelper args={[gridSize, Math.round(gridSize / 5), '#3a5a8a', '#22364f']} />
      <axesHelper args={[axesSize]} />
    </>
  );
}
