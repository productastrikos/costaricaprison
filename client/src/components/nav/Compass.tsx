import React from 'react';

export interface CompassProps {
  /** Camera heading in degrees (0 = facing north / −Z, 90 = east). */
  heading: number;
}

const SIZE = 54;

/**
 * Heading compass. The cardinal ring counter-rotates with the camera heading
 * so north always points to true scene-north; a fixed top ticker marks the
 * direction the camera is facing.
 */
export default function Compass({ heading }: CompassProps) {
  const marks = [
    { label: 'N', angle: 0, color: '#ff6b6b' },
    { label: 'E', angle: 90, color: '#cfe0ff' },
    { label: 'S', angle: 180, color: '#cfe0ff' },
    { label: 'W', angle: 270, color: '#cfe0ff' },
  ];
  const r = SIZE / 2 - 9;

  return (
    <div
      className="relative rounded-full"
      style={{
        width: SIZE,
        height: SIZE,
        background: 'rgba(6,14,22,0.82)',
        border: '1px solid var(--app-border)',
      }}
      title={`Heading ${Math.round(heading)}°`}
    >
      {/* fixed camera-facing ticker */}
      <div
        style={{
          position: 'absolute',
          top: 1,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderBottom: '6px solid #ffd27a',
        }}
      />
      {/* rotating cardinal ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `rotate(${-heading}deg)`,
          transition: 'transform 0.12s linear',
        }}
      >
        {marks.map((m) => {
          const rad = (m.angle * Math.PI) / 180;
          const x = SIZE / 2 + Math.sin(rad) * r;
          const y = SIZE / 2 - Math.cos(rad) * r;
          return (
            <span
              key={m.label}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                fontSize: 9,
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                color: m.color,
              }}
            >
              {m.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
