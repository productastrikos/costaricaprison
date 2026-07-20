import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import Figure from '../../people/Figure';
import { createFigureGeometry, disposeFigureGeometry } from '../../people/figureParts';
import {
  createSkinMaterial,
  createCapMaterial,
  createCivilianMaterial,
  CIVILIAN_COLORS,
} from '../../../materials/patrolMaterials';
import { clamp, easeInOutCubic, unitPhase } from '../../../animation/motion';
import { VISITOR_QUEUE } from './activityLayout';

/** Fraction of each shuffle cycle spent stepping forward (rest of it standing). */
const MOVE_FRACTION = 0.42;

/**
 * A single-file visitor queue outside the visitor-processing door that shuffles
 * forward on a timer: people step up one slot, wait, and step again. Modelled as
 * a fading conveyor — figures ease into the back of the line and scale away as
 * they reach the door — so it loops seamlessly with no pop. Time-based
 * throughout (position, gait and fade all derive from the clock).
 */
export default function VisitorQueue() {
  const { headX, headZ, dir, spacing, count, stepPeriod } = VISITOR_QUEUE;
  const span = count * spacing;
  const fadeBand = spacing * 0.55;
  // Figures face the door — opposite the "toward the back" direction.
  const facing = Math.atan2(-dir.x, -dir.z);

  const geometry = useMemo(() => createFigureGeometry(), []);
  const skin = useMemo(() => createSkinMaterial(), []);
  const cap = useMemo(() => createCapMaterial(), []);
  const shirts = useMemo(
    () => CIVILIAN_COLORS.map((c) => createCivilianMaterial(c)),
    [],
  );
  const slotRefs = useRef<THREE.Group[]>([]);
  // Shared 0/1 gait target: 1 while the line is stepping forward, 0 while it waits.
  const gaitRef = useRef(0);

  useEffect(
    () => () => {
      disposeFigureGeometry(geometry);
      skin.dispose();
      cap.dispose();
      shirts.forEach((m) => m.dispose());
    },
    [geometry, skin, cap, shirts],
  );

  useFrame((state) => {
    const p = state.clock.elapsedTime / stepPeriod;
    const stepFrac = unitPhase(p);
    gaitRef.current = stepFrac < MOVE_FRACTION ? 1 : 0;
    // Whole line advances one `spacing` per period, easing during the move phase.
    const advance = (Math.floor(p) + easeInOutCubic(clamp(stepFrac / MOVE_FRACTION))) * spacing;
    for (let i = 0; i < count; i++) {
      const g = slotRefs.current[i];
      if (!g) continue;
      const u = ((i * spacing - advance) % span + span) % span; // 0 = door, span = back
      g.position.set(headX + dir.x * u, 0, headZ + dir.z * u);
      const s = Math.min(clamp(u / fadeBand), clamp((span - u) / fadeBand));
      g.scale.setScalar(s);
    }
  });

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        // Each figure faces the door; the wrapper is positioned/scaled per frame.
        <group key={i} ref={(g) => { if (g) slotRefs.current[i] = g; }} rotation={[0, facing, 0]}>
          <Figure
            geometry={geometry}
            materials={{ uniform: shirts[i % shirts.length], skin, cap }}
            gaitRef={gaitRef}
            cadence={5}
            phase={i * 1.3}
            swing={0.35}
          />
        </group>
      ))}
    </group>
  );
}
