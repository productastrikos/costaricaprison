import React, { useEffect, useMemo } from 'react';
import RouteFollower from './RouteFollower';
import Figure from '../../people/Figure';
import { createFigureGeometry, disposeFigureGeometry } from '../../people/figureParts';
import { createUniformMaterial, createSkinMaterial, createCapMaterial } from '../../../materials/patrolMaterials';
import { buildRouteSampler } from '../../../utils/patrolRoute';
import { PATROL_LOOP } from './activityLayout';

export interface PatrolOfficersProps {
  /** Number of officers spread evenly around the patrol loop. */
  count?: number;
  /** Walking speed (world units / second). */
  speed?: number;
}

/**
 * Correctional officers walking a continuous foot patrol around the inner ring.
 * Owns the shared humanoid geometry + uniform materials (disposed here) and
 * spreads several officers along one {@link buildRouteSampler} loop, each offset
 * so they're distributed around the perimeter and out of step with each other.
 */
export default function PatrolOfficers({ count = 4, speed = 1.4 }: PatrolOfficersProps) {
  const geometry = useMemo(() => createFigureGeometry(), []);
  const materials = useMemo(
    () => ({ uniform: createUniformMaterial(), skin: createSkinMaterial(), cap: createCapMaterial() }),
    [],
  );
  const route = useMemo(() => buildRouteSampler(PATROL_LOOP, true), []);

  useEffect(
    () => () => {
      disposeFigureGeometry(geometry);
      materials.uniform.dispose();
      materials.skin.dispose();
      materials.cap.dispose();
    },
    [geometry, materials],
  );

  // Gait cadence scaled to speed so the stride reads as natural walking.
  const cadence = 4.6 * speed;

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <RouteFollower key={i} route={route} speed={speed} offset={(route.length / count) * i} y={0}>
          <Figure geometry={geometry} materials={materials} walking cadence={cadence} phase={i * 1.7} />
        </RouteFollower>
      ))}
    </group>
  );
}
