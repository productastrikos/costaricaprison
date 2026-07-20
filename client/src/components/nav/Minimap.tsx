import React from 'react';
import { CAMPUS_BUILDINGS, BuildingKind } from '../../models/campus/campusBuildings';
import { CAMPUS_HALF_WIDTH, CAMPUS_HALF_DEPTH } from '../../utils/campusGeometry';
import { CameraReadout } from '../../scene/CameraNavigator';

export interface MinimapProps {
  selectedId: string | null;
  hoveredId: string | null;
  readout: CameraReadout | null;
  onSelect: (id: string, label: string) => void;
  onHover: (id: string | null) => void;
}

const SIZE = 150;
const EXTENT = 125; // world half-extent mapped to the minimap (covers wall + margin)

const KIND_COLOR: Record<BuildingKind, string> = {
  housing: '#5a6b7a',
  medical: '#3f6b57',
  admin: '#6b6047',
  yard: '#3f5535',
};

/** World XZ → minimap pixel (north = −Z = up). */
function toMap(x: number, z: number) {
  return {
    mx: ((x + EXTENT) / (2 * EXTENT)) * SIZE,
    my: ((z + EXTENT) / (2 * EXTENT)) * SIZE,
  };
}

/**
 * Top-down minimap. Building footprints, perimeter, and the live camera
 * position/look-direction are all rendered from the shared registry + camera
 * readout — clicking or hovering a footprint drives the same select/hover
 * handlers as the 3D scene.
 */
export default function Minimap({ selectedId, hoveredId, readout, onSelect, onHover }: MinimapProps) {
  const perimTL = toMap(-CAMPUS_HALF_WIDTH, -CAMPUS_HALF_DEPTH);
  const perimBR = toMap(CAMPUS_HALF_WIDTH, CAMPUS_HALF_DEPTH);

  const cam = readout ? toMap(readout.camX, readout.camZ) : null;
  const tgt = readout ? toMap(readout.targetX, readout.targetZ) : null;

  return (
    <div
      className="rounded-md p-1.5"
      style={{ background: 'rgba(6,14,22,0.82)', border: '1px solid var(--app-border)' }}
    >
      <div className="mb-1 px-0.5 font-mono text-[8px] tracking-widest text-app-text-faint">SITE MAP</div>
      <svg width={SIZE} height={SIZE} style={{ display: 'block', borderRadius: 4, background: '#0d1620' }}>
        {/* perimeter */}
        <rect
          x={perimTL.mx}
          y={perimTL.my}
          width={perimBR.mx - perimTL.mx}
          height={perimBR.my - perimTL.my}
          fill="rgba(60,90,52,0.12)"
          stroke="#2c4a6a"
          strokeWidth={1}
        />

        {/* buildings */}
        {CAMPUS_BUILDINGS.map((b) => {
          const c = toMap(b.position[0], b.position[2]);
          const w = (b.width / (2 * EXTENT)) * SIZE;
          const h = (b.depth / (2 * EXTENT)) * SIZE;
          const isSel = b.id === selectedId;
          const isHov = b.id === hoveredId;
          return (
            <rect
              key={b.id}
              x={c.mx - w / 2}
              y={c.my - h / 2}
              width={w}
              height={h}
              rx={1}
              fill={isSel ? '#4aa8ff' : isHov ? '#9fd0ff' : KIND_COLOR[b.kind]}
              stroke={isSel ? '#cfe6ff' : 'rgba(0,0,0,0.4)'}
              strokeWidth={isSel ? 1.2 : 0.5}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(b.id, b.label)}
              onMouseEnter={() => onHover(b.id)}
              onMouseLeave={() => onHover(null)}
            >
              <title>{`${b.id} · ${b.label}`}</title>
            </rect>
          );
        })}

        {/* camera position + view direction */}
        {cam && tgt && (
          <>
            <line x1={cam.mx} y1={cam.my} x2={tgt.mx} y2={tgt.my} stroke="#ffd27a" strokeWidth={1} opacity={0.8} />
            <circle cx={cam.mx} cy={cam.my} r={3} fill="#ffd27a" stroke="#0d1620" strokeWidth={1} />
          </>
        )}
      </svg>
    </div>
  );
}
