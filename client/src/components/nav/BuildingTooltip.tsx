import React, { useEffect, useRef } from 'react';

export interface EnvReading {
  tempC: number;
  humidity: number;
  noise: number;
  tempOk: boolean;
  noiseOk: boolean;
}

export interface BuildingTooltipProps {
  /** The canvas container the tooltip is positioned within. */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Hovered building label (null when nothing is hovered). */
  label?: string | null;
  /** Environmental telemetry for the hovered building. */
  env?: EnvReading | null;
}

/**
 * Cursor-following overlay showing a hovered building's environmental
 * micro-climate telemetry (the data that used to live in the Environmental
 * Sensors panel). Position is updated imperatively from a pointer-move listener
 * so the 3D scene never re-renders while the cursor moves; the content only
 * changes when the hovered building changes.
 */
export default function BuildingTooltip({ containerRef, label, env }: BuildingTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = !!(label && env);

  useEffect(() => {
    const container = containerRef.current;
    const el = ref.current;
    if (!container || !el) return;
    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const pad = 14;
      let x = e.clientX - rect.left + pad;
      let y = e.clientY - rect.top + pad;
      const tw = el.offsetWidth;
      const th = el.offsetHeight;
      if (x + tw > rect.width) x = e.clientX - rect.left - tw - pad;
      if (y + th > rect.height) y = e.clientY - rect.top - th - pad;
      el.style.left = `${Math.max(4, x)}px`;
      el.style.top = `${Math.max(4, y)}px`;
    };
    container.addEventListener('pointermove', onMove);
    return () => container.removeEventListener('pointermove', onMove);
  }, [containerRef]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-20 rounded-md px-2.5 py-2"
      style={{
        left: 0,
        top: 0,
        display: visible ? 'block' : 'none',
        background: 'rgba(6,14,22,0.92)',
        border: '1px solid var(--app-border)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
        minWidth: 156,
      }}
    >
      {visible && (
        <>
          <div className="mb-1.5 font-mono text-[10px] font-bold tracking-wide text-app-text">{label}</div>
          <div className="mb-1 font-mono text-[8px] tracking-[0.14em] text-app-text-faint">ENVIRONMENTAL SENSORS</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div title={`Ambient temperature · threshold ≤27°C · ${env!.tempOk ? 'WITHIN RANGE' : 'ELEVATED'}`}>
              <p className="font-mono text-[12px] font-bold" style={{ color: env!.tempOk ? '#10b981' : '#f59e0b' }}>{env!.tempC}°</p>
              <p className="text-[7px] tracking-wide text-app-text-faint">TEMP</p>
            </div>
            <div title={`Relative humidity · ${env!.humidity}% RH`}>
              <p className="font-mono text-[12px] font-bold text-app-accent">{env!.humidity}%</p>
              <p className="text-[7px] tracking-wide text-app-text-faint">HUM</p>
            </div>
            <div title={`Ambient noise · threshold ≤55dB · ${env!.noiseOk ? 'NORMAL' : 'HIGH'}`}>
              <p className="font-mono text-[12px] font-bold" style={{ color: env!.noiseOk ? '#38bdf8' : '#f59e0b' }}>{env!.noise}dB</p>
              <p className="text-[7px] tracking-wide text-app-text-faint">NOISE</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
