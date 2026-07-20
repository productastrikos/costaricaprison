import { Point2 } from './campusGeometry';

/**
 * Reusable waypoint-route sampling for anything that roams the campus
 * (patrolling officers, vehicles). A route is sampled by distance travelled,
 * so a mover just accumulates `speed * delta` and asks for its pose.
 */

export interface RoutePose {
  x: number;
  z: number;
  /** Heading such that a group's local +Z points along the direction of travel. */
  angle: number;
}

export interface RouteSampler {
  length: number;
  sample(distance: number): RoutePose;
}

/** Builds a distance-parameterised sampler over a polyline (closed loop by default). */
export function buildRouteSampler(waypoints: Point2[], closed = true): RouteSampler {
  const pts = closed && waypoints.length > 1 ? [...waypoints, waypoints[0]] : waypoints;
  const segments: Array<{ x: number; z: number; ux: number; uz: number; len: number; start: number; angle: number }> = [];
  let total = 0;

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len <= 1e-6) continue;
    segments.push({
      x: a.x, z: a.z,
      ux: dx / len, uz: dz / len,
      len, start: total,
      angle: Math.atan2(dx, dz),
    });
    total += len;
  }

  return {
    length: total,
    sample(distance: number): RoutePose {
      if (!segments.length) {
        const p = pts[0] ?? { x: 0, z: 0 };
        return { x: p.x, z: p.z, angle: 0 };
      }
      const d = ((distance % total) + total) % total;
      for (const s of segments) {
        if (d <= s.start + s.len) {
          const k = d - s.start;
          return { x: s.x + s.ux * k, z: s.z + s.uz * k, angle: s.angle };
        }
      }
      const last = segments[segments.length - 1];
      return { x: last.x + last.ux * last.len, z: last.z + last.uz * last.len, angle: last.angle };
    },
  };
}

/** Shortest signed angular delta from `from` to `to` (radians), for smooth turning. */
export function shortestAngleDelta(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}
