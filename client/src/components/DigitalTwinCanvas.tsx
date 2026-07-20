import React, { useCallback, useMemo, useRef, useState } from 'react';
import Scene from '../scene/Scene';
import CameraNavigator, { CameraReadout } from '../scene/CameraNavigator';
import DoubleClickDragZoom from '../scene/DoubleClickDragZoom';
import { PrisonCampus, PrisonBuildings, PrisonSecurity, PrisonActivity } from '../models';
import { getBuilding, focusForBuilding } from '../models/campus/campusBuildings';
import Minimap from './nav/Minimap';
import Compass from './nav/Compass';
import Breadcrumb from './nav/Breadcrumb';
import BuildingTooltip, { EnvReading } from './nav/BuildingTooltip';

export interface DigitalTwinCanvasProps {
  height?: number | string;
  /** Supplies environmental telemetry for a hovered building (by zone/building id). */
  envForZone?: (id: string) => EnvReading | null;
}

/**
 * Bridges the TS scene module into the JS dashboard pages and owns all
 * interactive navigation state: building selection, hover, and live camera
 * telemetry. Selection drives an animated click-to-focus (CameraNavigator);
 * hover/selection drive the in-scene highlights and the DOM overlays
 * (breadcrumb, compass, minimap). All of it is registry-driven.
 */
export default function DigitalTwinCanvas({ height = 600, envForZone }: DigitalTwinCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [readout, setReadout] = useState<CameraReadout | null>(null);
  const [night, setNight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const handleHover = useCallback((id: string | null) => setHoveredId(id), []);
  const clearSelection = useCallback(() => setSelectedId(null), []);
  const handleReadout = useCallback((r: CameraReadout) => setReadout(r), []);

  const selectedBuilding = getBuilding(selectedId) ?? null;
  const hoveredBuilding = getBuilding(hoveredId) ?? null;
  const hoveredEnv = hoveredId && envForZone ? envForZone(hoveredId) : null;

  // Memoised so the animated focus only re-fires when the selection changes,
  // not on every camera-telemetry tick.
  const focusPose = useMemo(
    () => (selectedBuilding ? focusForBuilding(selectedBuilding) : null),
    [selectedBuilding],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg"
      style={{ height, background: '#0b1622', border: '1px solid var(--app-border)' }}
    >
      <Scene onPointerMissed={clearSelection} night={night}>
        <PrisonCampus />
        <PrisonBuildings
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={handleSelect}
          onHover={handleHover}
        />
        <PrisonSecurity night={night} />
        <PrisonActivity night={night} />
        <CameraNavigator focusPose={focusPose} onReadout={handleReadout} />
        <DoubleClickDragZoom />
      </Scene>

      {/* Environmental telemetry tooltip — follows the cursor over a building */}
      <BuildingTooltip containerRef={containerRef} label={hoveredBuilding?.label} env={hoveredEnv} />

      {/* Breadcrumb — current location */}
      <div className="absolute left-2 top-2">
        <Breadcrumb selected={selectedBuilding} onReset={clearSelection} />
      </div>

      {/* Compass + day/night toggle — top right */}
      <div className="absolute right-2 top-2 flex items-start gap-2">
        <button
          onClick={() => setNight((n) => !n)}
          className="rounded-md px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-wide"
          style={{
            background: 'rgba(6,14,22,0.82)',
            border: '1px solid var(--app-border)',
            color: night ? '#ffd27a' : 'var(--app-text-faint)',
          }}
          title="Toggle day / night"
        >
          {night ? '☾ NIGHT' : '☀ DAY'}
        </button>
        <Compass heading={readout?.heading ?? 0} />
      </div>

      {/* Minimap — bottom right */}
      <div className="absolute bottom-2 right-2">
        <Minimap
          selectedId={selectedId}
          hoveredId={hoveredId}
          readout={readout}
          onSelect={handleSelect}
          onHover={handleHover}
        />
      </div>

      <div
        className="pointer-events-none absolute bottom-2 left-2 rounded-md px-2.5 py-1.5 font-mono text-[9px] tracking-wide text-app-text-faint"
        style={{ background: 'rgba(5,11,18,0.65)', border: '1px solid var(--app-border)' }}
      >
        CLICK / HOVER A BUILDING · LEFT-DRAG ROTATE · SCROLL / DOUBLE-CLICK-DRAG ZOOM · RIGHT-DRAG PAN
      </div>
    </div>
  );
}
