/* ═══════════════════════════════════════════════════════════════════════
   CACCO — Digital Twin v2  |  Tactical 2D Facility Operations Model
   Full-screen pan/zoom facility blueprint with live guards, inmates,
   cameras, sensors, doors, incidents, AI predictions, and intel panel.
   ═══════════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCacco } from '../services/CaccoData';
import { Dot, Meter, KV, Segmented, ActionModal } from '../components/ui';
import { useT } from '../contexts/LanguageContext';
import {
  VW, VH,
  TWIN_ZONES, GUARD_TOWERS, CELL_BLOCKS,
  DOORS, DOOR_CLR, MAP_INCIDENTS, INC_CLR,
  AI_PREDICTIONS, HEATMAP_DATA, TIMELINE_EVENTS,
  STATUS_HEX, STATUS_FILL, CELL_FILL, CELL_STROKE,
  RISK_CLR, SEN_CLR, SEN_ST_CLR,
  zoneLayerColor, zoneMetric,
  buildGuards, buildSensors, buildCameras, INMATE_POSITIONS,
} from './twinData';

/* ─── Static data built once ────────────────────────────────────────── */
const INIT_GUARDS  = buildGuards(54);
const SENSORS      = buildSensors();
const CAMERAS      = buildCameras();

/* ─── Tab map for IntelPanel auto-switch ────────────────────────────── */
const OBJ_TAB_MAP = { guard:'Guards', camera:'Cameras', sensor:'Sensors', door:'Doors', incident:'Incidents' };
const DEFAULT_OVERLAYS = new Set(['guards','incidents','doors','cameras']);

/* ═══════════════════════════════════════════════════════════════════════
   MAP CANVAS
   ═══════════════════════════════════════════════════════════════════════ */
function MapCanvas({ layer, overlays, heatmapKey, selId, onSelect, guardPos,
                     onSelectGuard, onSelectCamera, onSelectSensor,
                     onSelectDoor, onSelectInmate, onSelectIncident,
                     lockdownActive }) {
  const svgRef  = useRef(null);
  const animRef = useRef(null);
  const drag    = useRef({ active:false, startX:0, startY:0, vbSnap:null });

  // Animated viewBox state
  const [vb,    setVb]    = useState({ x:0, y:0, w:VW, h:VH });
  const [tgtVb, setTgtVb] = useState({ x:0, y:0, w:VW, h:VH });

  /* Smooth lerp animation toward target viewBox */
  useEffect(() => {
    function lerp(a,b,t){ return a+(b-a)*t; }
    function step() {
      setVb(prev => {
        const nx = { x:lerp(prev.x,tgtVb.x,.14), y:lerp(prev.y,tgtVb.y,.14),
                     w:lerp(prev.w,tgtVb.w,.14), h:lerp(prev.h,tgtVb.h,.14) };
        const done = Math.abs(nx.x-tgtVb.x)<0.4 && Math.abs(nx.w-tgtVb.w)<0.4;
        if (!done) animRef.current = requestAnimationFrame(step);
        return done ? tgtVb : nx;
      });
    }
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [tgtVb]);

  /* Convert screen coords → SVG coords */
  const toSVG = useCallback((ex, ey) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: (ex-r.left)/r.width*vb.w+vb.x, y: (ey-r.top)/r.height*vb.h+vb.y };
  }, [vb]);

  /* Attach wheel listener (passive:false required for preventDefault) */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const {x,y} = toSVG(e.clientX, e.clientY);
      const f = e.deltaY < 0 ? 1.18 : 1/1.18;
      setTgtVb(prev => {
        const nw = Math.max(200, Math.min(VW*1.05, prev.w/f));
        const nh = nw * (VH/VW);
        return { x: x-(x-prev.x)*nw/prev.w, y: y-(y-prev.y)*nh/prev.h, w:nw, h:nh };
      });
    };
    el.addEventListener('wheel', onWheel, { passive:false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [toSVG]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    drag.current = { active:true, startX:e.clientX, startY:e.clientY, vbSnap:{...vb} };
  }, [vb]);

  const handleMouseMove = useCallback((e) => {
    if (!drag.current.active) return;
    const r = svgRef.current.getBoundingClientRect();
    const dx = (drag.current.startX - e.clientX) / r.width  * drag.current.vbSnap.w;
    const dy = (drag.current.startY - e.clientY) / r.height * drag.current.vbSnap.h;
    setTgtVb({ ...drag.current.vbSnap, x:drag.current.vbSnap.x+dx, y:drag.current.vbSnap.y+dy });
  }, []);

  const handleMouseUp = useCallback(() => { drag.current.active = false; }, []);

  /* Zoom to a zone */
  const zoomTo = useCallback((z) => {
    const pad = Math.max(40, Math.min(z.w, z.h) * 0.15);
    const nw  = z.w + pad*2;
    setTgtVb({ x:z.x-pad, y:z.y-pad, w:nw, h:nw*(VH/VW) });
  }, []);

  const resetZoom = useCallback(() => setTgtVb({x:0,y:0,w:VW,h:VH}), []);

  const scale = VW / vb.w;  // zoom scale factor relative to full view
  const showZoneDetail = scale > 1.5;
  const showCells      = scale > 2.8;
  const showMicroLabel = scale > 4.5;
  const vbStr = `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`;

  return (
    <div className="relative flex-1 min-w-0 min-h-0 overflow-hidden" style={{background:'#04090f'}}>

      {/* Zoom buttons */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-1">
        {[
          ['+', ()=>setTgtVb(p=>{ const nw=Math.max(200,p.w/1.3); return {...p,x:p.x+(p.w-nw)/2,y:p.y+(p.h-nw*(VH/VW))/2,w:nw,h:nw*(VH/VW)}; })],
          ['−', ()=>setTgtVb(p=>{ const nw=Math.min(VW*1.05,p.w*1.3); return {...p,x:p.x-(nw-p.w)/2,y:p.y-(nw*(VH/VW)-p.h)/2,w:nw,h:nw*(VH/VW)}; })],
          ['⊡', resetZoom],
        ].map(([lbl, fn]) => (
          <button key={lbl} onClick={fn}
            className="w-8 h-8 rounded border flex items-center justify-center text-sm font-bold transition-opacity hover:opacity-80"
            style={{background:'var(--app-panel)',borderColor:'var(--app-border)',color:'var(--app-text)'}}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Scale readout */}
      <div className="absolute bottom-5 left-4 z-20 font-mono text-[9px] opacity-30 pointer-events-none select-none"
           style={{color:'var(--app-accent)'}}>
        {(scale*100).toFixed(0)}% · {vb.w.toFixed(0)}×{vb.h.toFixed(0)}
      </div>

      {/* Lockdown overlay */}
      {lockdownActive && (
        <div className="absolute inset-0 z-30 pointer-events-none"
          style={{border:'3px solid #ef4444',boxShadow:'inset 0 0 60px rgba(239,68,68,0.18)'}}>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded font-mono text-xs font-black tracking-widest"
            style={{background:'rgba(239,68,68,0.9)',color:'white'}}>
            ⚠ FACILITY LOCKDOWN ACTIVE
          </div>
        </div>
      )}

      <svg ref={svgRef} viewBox={vbStr} width="100%" height="100%"
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        style={{cursor: drag.current.active ? 'grabbing':'grab', userSelect:'none', display:'block'}}>

        <defs>
          <pattern id="tw-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M100 0L0 0 0 100" fill="none" stroke="#070f1a" strokeWidth="1"/>
          </pattern>
          <filter id="glow-r" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-b" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        <rect width={VW} height={VH} fill="url(#tw-grid)"/>

        {/* ── Perimeter fence ── */}
        {(() => {
          const p = TWIN_ZONES.find(z => z.id === 'PERIM');
          return (<>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={6}
              fill="none" stroke="#143060" strokeWidth={3} strokeDasharray="16 8"/>
            <text x={p.x+14} y={p.y-9} fontSize={13} fill="#1a3a60"
              fontFamily="JetBrains Mono" letterSpacing="3">
              CACCO SECURITY PERIMETER · DRONE OVERWATCH ACTIVE
            </text>
          </>);
        })()}

        {/* ── Guard towers ── */}
        {GUARD_TOWERS.map(t => (
          <g key={t.id}>
            <rect x={t.x} y={t.y} width={42} height={42} rx={4}
              fill="#071420" stroke="#1a4a7a" strokeWidth={2}/>
            <text x={t.x+21} y={t.y+27} textAnchor="middle"
              fontSize={10} fill="#38bdf8" fontFamily="JetBrains Mono" fontWeight="bold">GT</text>
            <circle cx={t.x+21} cy={t.y+10} r={3} fill="#10b981"/>
          </g>
        ))}

        {/* ── Interior zones ── */}
        {TWIN_ZONES.filter(z => z.kind !== 'perimeter').map(z => {
          const col  = zoneLayerColor(z, layer);
          const sel  = z.id === selId;
          const fill = STATUS_FILL[z.status] || 'rgba(56,189,248,0.05)';

          // Heatmap overlay value
          let hmVal = 0;
          if (overlays.has('heatmap') && heatmapKey) {
            const ds = HEATMAP_DATA[heatmapKey] || {};
            hmVal = ds[z.id] || ds[z.id.replace('BLK_','')] || 0;
          }
          const hmFill = hmVal > 0
            ? `rgba(${hmVal>.8?'239,68,68':hmVal>.5?'245,158,11':'56,189,248'},${(hmVal*.42).toFixed(2)})`
            : null;

          return (
            <g key={z.id} style={{cursor:'pointer'}}
               onClick={() => { onSelect(z.id); zoomTo(z); }}>
              {/* Body */}
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={7}
                fill={fill} stroke={col} strokeWidth={sel ? 2.5 : 1.5}
                style={sel ? {filter:`drop-shadow(0 0 14px ${col}99)`} : undefined}/>
              {/* Heatmap */}
              {hmFill && <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={7}
                fill={hmFill} style={{pointerEvents:'none'}}/>}
              {/* Selection ring */}
              {sel && <rect x={z.x-4} y={z.y-4} width={z.w+8} height={z.h+8} rx={11}
                fill="none" stroke={col} strokeWidth={1} strokeDasharray="7 4" opacity={.55}/>}
              {/* Header band */}
              <rect x={z.x} y={z.y} width={z.w} height={24} rx={7}
                fill={`${col}1c`} style={{pointerEvents:'none'}}/>
              {/* Zone short code + name */}
              {showZoneDetail && <>
                <text x={z.x+8} y={z.y+15} fontSize={11} fontWeight="bold"
                  fill={col} fontFamily="JetBrains Mono">{z.short}</text>
                {z.w > 130 && <text x={z.x+8} y={z.y+34} fontSize={9} fill="#667a8a">{z.label}</text>}
              </>}
              {/* Metric value */}
              {showZoneDetail && <text x={z.x+z.w-7} y={z.y+z.h-9} textAnchor="end"
                fontSize={13} fontWeight="bold" fill={col} fontFamily="JetBrains Mono">
                {zoneMetric(z, layer)}
              </text>}
              {/* Status dot */}
              <circle cx={z.x+z.w-11} cy={z.y+12} r={5} fill={STATUS_HEX[z.status]}/>
              {z.status === 'critical' && <circle cx={z.x+z.w-11} cy={z.y+12} r={9}
                fill="none" stroke="#ef4444" strokeWidth={1} opacity={.4}/>}
              {/* Incident badge */}
              {z.inc > 0 && <>
                <rect x={z.x+7} y={z.y+z.h-21} width={z.inc>=10?32:26} height={15} rx={3}
                  fill="#ef444415" stroke="#ef444440"/>
                <text x={z.x+11} y={z.y+z.h-10} fontSize={9} fill="#ef4444" fontFamily="JetBrains Mono">
                  ⚠{z.inc}
                </text>
              </>}
            </g>
          );
        })}

        {/* ── Cells (high zoom) ── */}
        {showCells && Object.values(CELL_BLOCKS).flat().map(cell => (
          <rect key={cell.id} x={cell.x} y={cell.y} width={cell.w} height={cell.h} rx={1.5}
            fill={CELL_FILL[cell.status]||CELL_FILL.occ}
            stroke={CELL_STROKE[cell.status]||CELL_STROKE.occ}
            strokeWidth={.8} style={{cursor:'pointer'}}
            onClick={e => { e.stopPropagation(); onSelect(cell.id); }}/>
        ))}
        {showMicroLabel && Object.values(CELL_BLOCKS).flat().map(cell => (
          <text key={`lbl-${cell.id}`} x={cell.x+cell.w/2} y={cell.y+cell.h/2+3}
            textAnchor="middle" fontSize={5} fill="#4a6a8a" fontFamily="JetBrains Mono"
            style={{pointerEvents:'none'}}>{cell.num}</text>
        ))}

        {/* ── Cameras ── */}
        {overlays.has('cameras') && CAMERAS.map(cam => {
          if (!cam.online) return null;
          const ang = cam.angle * Math.PI / 180;
          const fov = cam.fov  * Math.PI / 180;
          const r   = cam.range;
          const x1  = cam.x + r*Math.cos(ang-fov/2), y1 = cam.y + r*Math.sin(ang-fov/2);
          const x2  = cam.x + r*Math.cos(ang+fov/2), y2 = cam.y + r*Math.sin(ang+fov/2);
          const isAlert = cam.flags > 0;
          return (
            <g key={cam.id} style={{cursor:'pointer'}}
               onClick={e => { e.stopPropagation(); onSelectCamera(cam); }}>
              {scale > 1.2 && <path
                d={`M${cam.x},${cam.y} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
                fill={isAlert?'rgba(245,158,11,0.06)':'rgba(56,189,248,0.05)'}
                stroke={isAlert?'#f59e0b28':'#38bdf822'} strokeWidth={.6}/>}
              <rect x={cam.x-5} y={cam.y-3.5} width={10} height={7} rx={1.5}
                fill={isAlert?'#f59e0b':'#38bdf8'} opacity={.9}/>
              <circle cx={cam.x} cy={cam.y} r={2.5} fill="white" opacity={.75}/>
            </g>
          );
        })}

        {/* ── Sensors ── */}
        {overlays.has('sensors') && SENSORS.map(sen => (
          <g key={sen.id} style={{cursor:'pointer'}}
             onClick={e => { e.stopPropagation(); onSelectSensor(sen); }}>
            <rect x={sen.x-4} y={sen.y-4} width={8} height={8} rx={1.5}
              fill={SEN_ST_CLR[sen.status]} opacity={.85}
              transform={`rotate(45,${sen.x},${sen.y})`}/>
          </g>
        ))}

        {/* ── Doors ── */}
        {overlays.has('doors') && DOORS.map(d => {
          const clr = DOOR_CLR[d.status];
          const w = d.horiz ? 16 : 7, h = d.horiz ? 7 : 16;
          return (
            <g key={d.id} style={{cursor:'pointer'}}
               onClick={e => { e.stopPropagation(); onSelectDoor(d); }}>
              <rect x={d.x-w/2} y={d.y-h/2} width={w} height={h} rx={2}
                fill={clr} opacity={.92}/>
              {d.status === 'forced' && <rect x={d.x-w/2-3} y={d.y-h/2-3} width={w+6} height={h+6} rx={4}
                fill="none" stroke="#ef4444" strokeWidth={1.2} opacity={.7}/>}
              {d.status === 'unlocked' && <circle cx={d.x} cy={d.y} r={3} fill="white" opacity={.6}/>}
            </g>
          );
        })}

        {/* ── AI Predictions ── */}
        {overlays.has('ai') && AI_PREDICTIONS.map(p => (
          <g key={p.id} style={{pointerEvents:'none'}}>
            <circle cx={p.x} cy={p.y} r={60} fill="rgba(139,92,246,0.07)"
              stroke="rgba(139,92,246,0.30)" strokeWidth={1} strokeDasharray="7 5">
              <animate attributeName="r" values="55;68;55" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx={p.x} cy={p.y} r={7} fill="#8b5cf6" opacity={.85}/>
            {showZoneDetail && <>
              <text x={p.x} y={p.y-16} textAnchor="middle" fontSize={10}
                fill="#a78bfa" fontFamily="JetBrains Mono" fontWeight="bold">{p.prob}%</text>
              <text x={p.x} y={p.y+22} textAnchor="middle" fontSize={8}
                fill="#8b5cf6" fontFamily="JetBrains Mono">{p.type}</text>
            </>}
          </g>
        ))}

        {/* ── Map incidents ── */}
        {overlays.has('incidents') && MAP_INCIDENTS.map(inc => {
          const clr = INC_CLR[inc.sev];
          const isActive = inc.status === 'active';
          return (
            <g key={inc.id} style={{cursor:'pointer'}}
               onClick={e => { e.stopPropagation(); onSelectIncident(inc); }}>
              <circle cx={inc.x} cy={inc.y} r={14} fill={`${clr}16`} stroke={clr}
                strokeWidth={1.8} filter={isActive ? 'url(#glow-r)' : undefined}>
                {isActive && <animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite"/>}
                {isActive && <animate attributeName="opacity" values="1;0.45;1" dur="2s" repeatCount="indefinite"/>}
              </circle>
              <text x={inc.x} y={inc.y+1} textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fontWeight="bold" fill={clr} fontFamily="JetBrains Mono">
                {isActive ? '!' : inc.status==='dispatched' ? '▶' : '●'}
              </text>
              {showZoneDetail && <text x={inc.x} y={inc.y+22} textAnchor="middle"
                fontSize={8} fill={clr} fontFamily="JetBrains Mono">{inc.type}</text>}
            </g>
          );
        })}

        {/* ── Guards ── */}
        {overlays.has('guards') && guardPos.map(g => (
          <g key={g.id} style={{cursor:'pointer'}}
             onClick={e => { e.stopPropagation(); onSelectGuard(g); }}>
            <circle cx={g.x} cy={g.y} r={8} fill="#0e3a6a" stroke="#38bdf8" strokeWidth={1.8}
              filter="url(#glow-b)"/>
            <circle cx={g.x} cy={g.y} r={4} fill="#38bdf8"/>
            {g.status === 'respond' && <circle cx={g.x} cy={g.y} r={12} fill="none"
              stroke="#38bdf8" strokeWidth={1} opacity={.45}>
              <animate attributeName="r" values="8;18;8" dur="1.5s" repeatCount="indefinite"/>
            </circle>}
          </g>
        ))}

        {/* ── Inmate positions ── */}
        {overlays.has('inmates') && INMATE_POSITIONS.map(m => (
          <circle key={m.id} cx={m.x} cy={m.y} r={5.5}
            fill={RISK_CLR[m.risk]||'#f59e0b'} stroke="rgba(0,0,0,0.55)" strokeWidth={1}
            style={{cursor:'pointer'}}
            onClick={e => { e.stopPropagation(); onSelectInmate(m); }}/>
        ))}

        {/* ── Compass ── */}
        <g opacity={.3} transform={`translate(2325,1745)`}>
          <text x={0} y={-14} textAnchor="middle" fontSize={11} fill="#38bdf8" fontFamily="JetBrains Mono">N</text>
          <polygon points="0,-12 -4,-2 4,-2" fill="#38bdf8"/>
          <line x1={0} y1={-2} x2={0} y2={10} stroke="#38bdf8" strokeWidth={1}/>
          <text x={0} y={20} textAnchor="middle" fontSize={9} fill="#38bdf8" fontFamily="JetBrains Mono">S</text>
        </g>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   INTEL PANEL (right side)
   ═══════════════════════════════════════════════════════════════════════ */
function IntelPanel({ selId, selObject, selObjectType, c, guardPos, onSelectZone, doorStates, onToggleDoor }) {
  const { t } = useT();
  const INTEL_TABS = useMemo(() => [
    { key:'Overview',  label:t('twin.tabOverview') },
    { key:'Incidents', label:t('common.incidents') },
    { key:'Guards',    label:t('twin.tabGuards') },
    { key:'Cameras',   label:t('twin.tabCameras') },
    { key:'Sensors',   label:t('twin.tabSensors') },
    { key:'AI',        label:t('twin.tabAi') },
    { key:'Doors',     label:t('twin.tabDoors') },
  ], [t]);
  const [tab, setTab] = useState('Overview');

  const selZone = TWIN_ZONES.find(z => z.id === selId);
  const zoneCams = CAMERAS.filter(cm => cm.zId === selId);
  const zoneSens = SENSORS.filter(s => s.zId === selId);
  const zoneGuards = guardPos.filter(g => g.zId === selId);

  /* When a specific object is selected, auto-switch to relevant tab */
  useEffect(() => {
    if (!selObjectType) return;
    if (OBJ_TAB_MAP[selObjectType]) setTab(OBJ_TAB_MAP[selObjectType]);
  }, [selObjectType]);

  const panelStyle = { background:'var(--app-panel-2)', borderColor:'var(--app-border)' };

  return (
    <div className="flex flex-col shrink-0 border-l overflow-hidden" style={{width:320,...panelStyle}}>
      {/* Tab bar */}
      <div className="flex overflow-x-auto scrollbar-hide border-b shrink-0"
           style={{borderColor:'var(--app-border)'}}>
        {INTEL_TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-3 py-2.5 text-[10px] font-semibold whitespace-nowrap transition-colors shrink-0"
            style={{
              color: tab===key ? 'var(--app-accent)' : 'var(--app-text-faint)',
              borderBottom: tab===key ? '2px solid var(--app-accent)' : '2px solid transparent',
              background: 'transparent',
            }}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{fontSize:12}}>

        {/* ── Overview ── */}
        {tab === 'Overview' && (<>
          {selZone ? (<>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="font-bold text-[13px]" style={{color:'var(--app-text)'}}>{selZone.label}</p>
                <p className="font-mono text-[9px] mt-0.5" style={{color:'var(--app-text-faint)'}}>
                  {t('twin.zonePrefix')} {selZone.short} · {selZone.kind.toUpperCase()}
                </p>
              </div>
              <span className="chip" style={{
                background: `${STATUS_HEX[selZone.status]}20`,
                color: STATUS_HEX[selZone.status],
                border:`1px solid ${STATUS_HEX[selZone.status]}44`,
                fontSize:10, padding:'2px 8px', borderRadius:4,
              }}>{t('tone.op.' + selZone.status)}</span>
            </div>
            {selZone.cap > 0 && (<>
              <div>
                <div className="flex justify-between mb-1" style={{color:'var(--app-text-faint)',fontSize:10}}>
                  <span>{t('common.occupancy')}</span>
                  <span className="font-mono font-bold" style={{color:'var(--app-text)'}}>
                    {selZone.occ}/{selZone.cap} ({Math.round(selZone.occ/selZone.cap*100)}%)
                  </span>
                </div>
                <Meter value={selZone.occ} max={selZone.cap}
                  color={selZone.occ/selZone.cap>.95?'#ef4444':selZone.occ/selZone.cap>.85?'#f59e0b':'#38bdf8'}/>
              </div>
            </>)}
            <div className="space-y-0">
              <KV k={t('twin.riskLevel')}    v={t('tone.risk.' + selZone.risk)} color={STATUS_HEX[selZone.status]}/>
              <KV k={t('twin.incidents24h')} v={selZone.inc} color={selZone.inc>2?'#ef4444':selZone.inc>0?'#f59e0b':undefined}/>
              <KV k={t('common.personnel')}  v={selZone.psnl}/>
              <KV k={t('twin.tabCameras')}   v={zoneCams.length} color="#38bdf8"/>
              <KV k={t('twin.tabSensors')}   v={zoneSens.length}/>
              <KV k={t('twin.guardsOnSite')} v={zoneGuards.length} color="#38bdf8"/>
            </div>
          </>) : (
            <p className="text-center py-8 text-[11px]" style={{color:'var(--app-text-faint)'}}>
              {t('twin.clickZone')}
            </p>
          )}

          {/* Facility summary */}
          <div className="rounded border p-2.5 space-y-0" style={{borderColor:'var(--app-border)',background:'var(--app-bg-deep)'}}>
            <p className="font-mono text-[9px] font-bold mb-2" style={{color:'var(--app-text-faint)',letterSpacing:2}}>{t('twin.facilitySummary')}</p>
            <KV k={t('twin.totalZones')}    v={TWIN_ZONES.length}/>
            <KV k={t('twin.camerasOnline')} v={`${CAMERAS.filter(x=>x.online).length}/${CAMERAS.length}`} color="#10b981"/>
            <KV k={t('twin.sensorsActive')} v={`${SENSORS.filter(s=>s.status==='active').length}/${SENSORS.length}`}/>
            <KV k={t('twin.sensorFaults')}  v={SENSORS.filter(s=>s.status==='fault').length} color={SENSORS.filter(s=>s.status==='fault').length>0?'#f59e0b':undefined}/>
            <KV k={t('twin.guardsDeployed')} v={guardPos.length} color="#38bdf8"/>
            <KV k={t('twin.activeInc')}     v={MAP_INCIDENTS.filter(m=>m.status==='active').length} color="#ef4444"/>
          </div>
        </>)}

        {/* ── Incidents ── */}
        {tab === 'Incidents' && (<>
          <p className="font-mono text-[9px] font-bold mb-1" style={{color:'var(--app-text-faint)',letterSpacing:2}}>{t('twin.activeIncTitle')}</p>
          {MAP_INCIDENTS.map(inc => (
            <div key={inc.id} className="rounded border p-2 cursor-pointer hover:opacity-80 transition-opacity"
              style={{borderColor:`${INC_CLR[inc.sev]}44`, background:`${INC_CLR[inc.sev]}0a`}}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[11px]" style={{color:'var(--app-text)'}}>{inc.type}</span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                  style={{background:`${INC_CLR[inc.sev]}25`,color:INC_CLR[inc.sev]}}>
                  {t('tone.threat.' + inc.sev)}
                </span>
              </div>
              <div className="flex gap-2 mt-1" style={{color:'var(--app-text-faint)',fontSize:10}}>
                <span>Zone: {TWIN_ZONES.find(z=>z.id===inc.zId)?.short||inc.zId}</span>
                <span className="font-mono" style={{color:STATUS_HEX[inc.status==='active'?'critical':inc.status==='dispatched'?'elevated':'normal']}}>
                  {inc.status.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {[t('twin.dispatchGuard'),t('twin.medicalTeam'),t('twin.tactical')].map(action => (
                  <button key={action} className="px-2 py-0.5 rounded text-[9px] font-semibold"
                    style={{background:'var(--app-accent-bg)',color:'var(--app-accent)',border:'1px solid var(--app-accent-border)'}}>
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="font-mono text-[9px] font-bold mt-2 mb-1" style={{color:'var(--app-text-faint)',letterSpacing:2}}>{t('twin.aiPredTitle')}</p>
          {AI_PREDICTIONS.map(p => (
            <div key={p.id} className="rounded border p-2"
              style={{borderColor:'rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.06)'}}>
              <p className="font-semibold text-[11px]" style={{color:'#a78bfa'}}>{p.type}</p>
              <div className="flex justify-between mt-1" style={{fontSize:10,color:'var(--app-text-faint)'}}>
                <span>{t('twin.prob')}: <b style={{color:'#a78bfa'}}>{p.prob}%</b></span>
                <span>{t('twin.window')}: {p.win}</span>
                <span>{t('twin.conf')}: {p.conf}%</span>
              </div>
            </div>
          ))}
        </>)}

        {/* ── Guards ── */}
        {tab === 'Guards' && (<>
          <p className="font-mono text-[9px] font-bold mb-1" style={{color:'var(--app-text-faint)',letterSpacing:2}}>
            {t('twin.deployedGuardsTitle')} · {guardPos.length}
          </p>
          {(selObject && selObjectType==='guard') ? (
            <div className="rounded border p-2.5 space-y-0" style={{borderColor:'#38bdf844',background:'rgba(56,189,248,0.06)'}}>
              <p className="font-bold text-[12px] mb-1" style={{color:'#38bdf8'}}>{selObject.name}</p>
              <KV k={t('twin.badge')}         v={selObject.badge}/>
              <KV k={t('common.zone')}        v={selObject.assignment}/>
              <KV k={t('common.status')}      v={selObject.status.toUpperCase()} color={selObject.status==='respond'?'#ef4444':'#10b981'}/>
              <KV k={t('twin.radio')}         v={selObject.radioStatus} color={selObject.radioStatus==='active'?'#10b981':'#f59e0b'}/>
              <KV k={t('staff.kvShift')}      v={selObject.shift}/>
              <KV k={t('staff.kvClearance')}  v={`${t('twin.clearanceLevel')} ${selObject.clearance}`}/>
            </div>
          ) : null}
          <div className="space-y-1">
            {guardPos.slice(0,20).map(g => (
              <div key={g.id} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:opacity-75"
                style={{background:'var(--app-bg-deep)',border:'1px solid var(--app-border)'}}>
                <div className="w-2 h-2 rounded-full shrink-0"
                  style={{background: g.status==='respond'?'#ef4444':g.status==='duty'?'#38bdf8':'#f59e0b'}}/>
                <span className="flex-1 font-medium text-[11px]" style={{color:'var(--app-text)'}}>{g.name}</span>
                <span className="font-mono text-[9px]" style={{color:'var(--app-text-faint)'}}>{g.badge}</span>
              </div>
            ))}
            {guardPos.length > 20 && (
              <p className="text-center text-[10px]" style={{color:'var(--app-text-faint)'}}>
                +{guardPos.length-20} {t('twin.more')}
              </p>
            )}
          </div>
        </>)}

        {/* ── Cameras ── */}
        {tab === 'Cameras' && (<>
          <p className="font-mono text-[9px] font-bold mb-1" style={{color:'var(--app-text-faint)',letterSpacing:2}}>
            {selZone ? `${selZone.short} ${t('twin.tabCameras').toUpperCase()} · ${zoneCams.length}` : `${t('twin.allCamerasTitle')} · ${CAMERAS.length}`}
          </p>
          {(selObject && selObjectType==='camera') && (
            <div className="rounded border p-2.5 mb-2 space-y-0" style={{borderColor:'#38bdf844',background:'rgba(56,189,248,0.06)'}}>
              <p className="font-bold text-[12px] mb-1" style={{color:'#38bdf8'}}>{selObject.label}</p>
              <KV k={t('common.status')}  v={selObject.online?t('surv.online'):t('surv.offline')} color={selObject.online?'#10b981':'#ef4444'}/>
              <KV k={t('twin.aiFlags')}   v={selObject.flags} color={selObject.flags>0?'#f59e0b':undefined}/>
              <KV k={t('twin.recording')} v={selObject.recording?t('twin.yes'):t('twin.no')}/>
              <KV k={t('twin.angle')}     v={`${selObject.angle}°`}/>
              <KV k={t('twin.fov')}       v={`${selObject.fov}°`}/>
            </div>
          )}
          {(selZone ? zoneCams : CAMERAS).slice(0,25).map(cam => (
            <div key={cam.id} className="flex items-center gap-2 px-2 py-1.5 rounded"
              style={{background:'var(--app-bg-deep)',border:'1px solid var(--app-border)'}}>
              <div className="w-2 h-2 rounded-full shrink-0"
                style={{background:cam.online?cam.flags>0?'#f59e0b':'#10b981':'#ef4444'}}/>
              <span className="flex-1 font-mono text-[10px]" style={{color:'var(--app-text)'}}>{cam.label}</span>
              {cam.flags>0&&<span className="text-[9px] font-bold" style={{color:'#f59e0b'}}>AI:{cam.flags}</span>}
            </div>
          ))}
        </>)}

        {/* ── Sensors ── */}
        {tab === 'Sensors' && (<>
          <p className="font-mono text-[9px] font-bold mb-1" style={{color:'var(--app-text-faint)',letterSpacing:2}}>
            {selZone ? `${selZone.short} ${t('twin.tabSensors').toUpperCase()} · ${zoneSens.length}` : `${t('twin.allSensorsTitle')} · ${SENSORS.length}`}
          </p>
          {(selObject && selObjectType==='sensor') && (
            <div className="rounded border p-2.5 mb-2 space-y-0" style={{borderColor:`${SEN_ST_CLR[selObject.status]}44`,background:`${SEN_ST_CLR[selObject.status]}0a`}}>
              <p className="font-bold text-[12px] mb-1" style={{color:SEN_CLR[selObject.type]}}>{selObject.type.toUpperCase()} {t('twin.sensorLabel')}</p>
              <KV k={t('twin.kvId')}      v={selObject.id}/>
              <KV k={t('common.status')}  v={selObject.status.toUpperCase()} color={SEN_ST_CLR[selObject.status]}/>
              <KV k={t('twin.battery')}   v={`${selObject.battery}%`} color={selObject.battery<30?'#ef4444':undefined}/>
              <KV k={t('twin.lastEvent')} v={selObject.last}/>
            </div>
          )}
          {(selZone ? zoneSens : SENSORS).slice(0,30).map(s => (
            <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded"
              style={{background:'var(--app-bg-deep)',border:'1px solid var(--app-border)'}}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{background:SEN_ST_CLR[s.status]}}/>
              <span className="font-mono text-[9px]" style={{color:SEN_CLR[s.type]}}>{s.type.toUpperCase()}</span>
              <span className="flex-1 font-mono text-[9px]" style={{color:'var(--app-text-faint)'}}>{s.id}</span>
              <span className="font-mono text-[9px]" style={{color:'var(--app-text-faint)'}}>{s.battery}%</span>
            </div>
          ))}
        </>)}

        {/* ── AI Insights ── */}
        {tab === 'AI' && (<>
          <p className="font-mono text-[9px] font-bold mb-1" style={{color:'var(--app-text-faint)',letterSpacing:2}}>{t('twin.aiThreatTitle')}</p>
          {AI_PREDICTIONS.map(p => (
            <div key={p.id} className="rounded border p-3 space-y-2"
              style={{borderColor:'rgba(139,92,246,0.35)',background:'rgba(139,92,246,0.08)'}}>
              <div className="flex items-start justify-between">
                <p className="font-bold text-[11px]" style={{color:'#c4b5fd'}}>{p.type}</p>
                <span className="font-mono text-[10px] font-black" style={{color:'#8b5cf6'}}>{p.prob}%</span>
              </div>
              <div>
                <div className="flex justify-between mb-1" style={{fontSize:9,color:'var(--app-text-faint)'}}>
                  <span>{t('twin.confidence')}</span><span>{p.conf}%</span>
                </div>
                <div className="h-1.5 rounded" style={{background:'var(--app-border)'}}>
                  <div className="h-full rounded" style={{width:`${p.conf}%`,background:'#8b5cf6'}}/>
                </div>
              </div>
              <div className="flex justify-between" style={{fontSize:9,color:'var(--app-text-faint)'}}>
                <span>Zone: {p.zId}</span>
                <span>Window: {p.win}</span>
              </div>
            </div>
          ))}
          <p className="font-mono text-[9px] font-bold mt-2 mb-1" style={{color:'var(--app-text-faint)',letterSpacing:2}}>BEHAVIORAL INTEL</p>
          {(c.intel||[]).slice(0,3).map(i => (
            <div key={i.id} className="rounded border p-2.5"
              style={{borderColor:'var(--app-border)',background:'var(--app-bg-deep)'}}>
              <p className="font-semibold text-[11px]" style={{color:'var(--app-text)'}}>{i.title}</p>
              <p className="text-[9px] mt-1" style={{color:'var(--app-text-faint)'}}>{i.detail}</p>
              <div className="flex justify-between mt-1" style={{fontSize:9,color:'var(--app-text-faint)'}}>
                <span>{i.source}</span><span style={{color:'#8b5cf6'}}>Conf: {i.confidence}%</span>
              </div>
            </div>
          ))}
        </>)}

        {/* ── Doors ── */}
        {tab === 'Doors' && (<>
          <p className="font-mono text-[9px] font-bold mb-1" style={{color:'var(--app-text-faint)',letterSpacing:2}}>ACCESS CONTROL · {DOORS.length} DOORS</p>
          {DOORS.map(d => {
            const st = doorStates[d.id] || d.status;
            const clr = DOOR_CLR[st];
            return (
              <div key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded border"
                style={{borderColor:`${clr}33`,background:`${clr}07`}}>
                <div className="w-2 h-2 rounded-sm shrink-0" style={{background:clr}}/>
                <span className="flex-1 text-[10px]" style={{color:'var(--app-text)'}}>{d.label}</span>
                <span className="font-mono text-[9px]" style={{color:clr}}>{st.toUpperCase()}</span>
                <button
                  onClick={() => onToggleDoor(d.id, st==='locked'?'unlocked':'locked')}
                  className="px-1.5 py-0.5 rounded text-[8px] font-semibold"
                  style={{background:'var(--app-accent-bg)',color:'var(--app-accent)',border:'1px solid var(--app-accent-border)'}}>
                  {st==='locked'?'UNLOCK':'LOCK'}
                </button>
              </div>
            );
          })}
        </>)}

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TIMELINE
   ═══════════════════════════════════════════════════════════════════════ */
function Timeline({ visible, onToggle }) {
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => filter === 'all' ? TIMELINE_EVENTS
    : TIMELINE_EVENTS.filter(e => e.sev === filter), [filter]);

  const sevClr = { critical:'#ef4444', high:'#f97316', moderate:'#f59e0b', low:'#10b981' };

  return (
    <div className="shrink-0 border-t" style={{
      height: visible ? 160 : 32,
      borderColor:'var(--app-border)', background:'var(--app-panel-2)',
      transition:'height .25s ease', overflow:'hidden',
    }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-3 h-8 shrink-0 border-b"
           style={{borderColor:'var(--app-border)'}}>
        <button onClick={onToggle} className="font-mono text-[9px] font-bold opacity-60 hover:opacity-100"
          style={{color:'var(--app-accent)'}}>
          {visible ? '▼' : '▲'} TIMELINE
        </button>
        <Dot color="#10b981" pulse size={6}/>
        <span className="font-mono text-[9px]" style={{color:'var(--app-text-faint)'}}>
          {TIMELINE_EVENTS.length} events
        </span>
        {visible && (<>
          <div className="flex gap-1 ml-2">
            {['all','critical','high','moderate','low'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold"
                style={{
                  background: filter===f ? 'var(--app-accent-bg)' : 'transparent',
                  color: filter===f ? 'var(--app-accent)' : 'var(--app-text-faint)',
                  border:`1px solid ${filter===f?'var(--app-accent-border)':'transparent'}`,
                }}>{f}</button>
            ))}
          </div>
        </>)}
      </div>

      {/* Event scroll */}
      {visible && (
        <div className="flex gap-2 overflow-x-auto px-3 py-2 h-[calc(100%-32px)] items-start" style={{scrollbarWidth:'thin'}}>
          {filtered.map(evt => {
            const clr = sevClr[evt.sev] || '#38bdf8';
            return (
              <div key={evt.id} className="shrink-0 rounded border px-2 py-1.5 cursor-pointer hover:opacity-80"
                style={{minWidth:160, borderColor:`${clr}33`, background:`${clr}08`}}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{background:clr}}/>
                  <span className="font-mono text-[9px] font-bold" style={{color:'var(--app-text-faint)'}}>
                    {evt.t.toTimeString().slice(0,8)}
                  </span>
                </div>
                <p className="font-semibold text-[10px] leading-tight" style={{color:'var(--app-text)'}}>{evt.type}</p>
                <p className="text-[9px] mt-0.5" style={{color:'var(--app-text-faint)'}}>{evt.zone}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CONTROL BAR
   ═══════════════════════════════════════════════════════════════════════ */
function ControlBar({ layer, onLayer, overlays, onToggleOverlay, heatmapKey, onHeatmap,
                      lockdown, onLockdown, guardPos }) {
  const activeInc = MAP_INCIDENTS.filter(i => i.status === 'active').length;
  const OVERLAY_BTNS = [
    ['guards','Guards',    '👮'],
    ['inmates','Inmates',  '🔴'],
    ['cameras','Cameras',  '📷'],
    ['sensors','Sensors',  '⬥'],
    ['doors','Doors',      '🚪'],
    ['incidents','Incidents','⚠'],
    ['ai','AI Layer',      '🧠'],
    ['heatmap','Heatmap',  '🌡'],
  ];
  const LAYER_OPTS = [
    { value: 'status',    label: 'Estado' },
    { value: 'occupancy', label: 'Ocupación' },
    { value: 'incidents', label: 'Incidentes' },
    { value: 'personnel', label: 'Personal' },
  ];
  const HEATMAP_OPTS = [
    { value: '',              label: 'Ninguno' },
    { value: 'occupancy',     label: 'Ocupación' },
    { value: 'violence_risk', label: 'Riesgo de Violencia' },
    { value: 'contraband',    label: 'Contrabando' },
    { value: 'gang_activity', label: 'Actividad de Pandillas' },
  ];

  return (
    <div className="shrink-0 flex items-center gap-3 px-4 border-b flex-wrap"
         style={{height:48, minHeight:48, background:'var(--app-panel-2)', borderColor:'var(--app-border)'}}>
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0"
          style={{background:'var(--app-accent-bg)',border:'1px solid var(--app-accent-border)'}}>
          <span className="font-mono text-[7px] font-black" style={{color:'var(--app-accent)'}}>TWIN</span>
        </div>
        <span className="font-bold text-[13px]" style={{color:'var(--app-text)'}}>Digital Twin</span>
        <div className="flex items-center gap-1">
          <Dot color="#10b981" pulse size={6}/>
          <span className="font-mono text-[9px]" style={{color:'#10b981'}}>LIVE</span>
        </div>
      </div>

      <div className="h-4 w-px" style={{background:'var(--app-border)'}}/>

      {/* Layer selector */}
      <Segmented options={LAYER_OPTS} value={layer} onChange={onLayer}/>

      <div className="h-4 w-px" style={{background:'var(--app-border)'}}/>

      {/* Overlay toggles */}
      <div className="flex items-center gap-1 flex-wrap">
        {OVERLAY_BTNS.map(([key, lbl, ico]) => (
          <button key={key} onClick={() => onToggleOverlay(key)}
            title={lbl}
            className="px-2 py-1 rounded text-[10px] font-semibold transition-all"
            style={{
              background: overlays.has(key) ? 'var(--app-accent-bg)' : 'transparent',
              color: overlays.has(key) ? 'var(--app-accent)' : 'var(--app-text-faint)',
              border:`1px solid ${overlays.has(key)?'var(--app-accent-border)':'var(--app-border)'}`,
            }}>
            {ico} {lbl}
          </button>
        ))}
      </div>

      <div className="h-4 w-px" style={{background:'var(--app-border)'}}/>

      {/* Heatmap selector */}
      <select value={heatmapKey} onChange={e => onHeatmap(e.target.value)}
        className="rounded px-2 py-1 text-[10px] font-mono"
        style={{background:'var(--app-bg-deep)',borderColor:'var(--app-border)',color:'var(--app-text)',border:'1px solid',outline:'none'}}>
        {HEATMAP_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Stats */}
      <div className="flex items-center gap-3 ml-auto">
        {activeInc > 0 && (
          <span className="flex items-center gap-1 font-mono text-[10px] font-bold" style={{color:'#ef4444'}}>
            <Dot color="#ef4444" pulse size={6}/>{activeInc} ACTIVE
          </span>
        )}
        <span className="font-mono text-[10px]" style={{color:'var(--app-text-faint)'}}>
          {guardPos.length} guards
        </span>

        {/* Lockdown button */}
        <button onClick={onLockdown}
          className="px-3 py-1 rounded font-mono text-[10px] font-black tracking-widest transition-all"
          style={{
            background: lockdown ? '#ef4444' : 'rgba(239,68,68,0.12)',
            color: lockdown ? 'white' : '#ef4444',
            border:`1px solid ${lockdown?'#ef4444':'rgba(239,68,68,0.4)'}`,
            boxShadow: lockdown ? '0 0 20px rgba(239,68,68,0.5)' : undefined,
          }}>
          {lockdown ? '⚠ LOCKDOWN ACTIVE' : 'LOCKDOWN'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN DIGITAL TWIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function DigitalTwin() {
  const c = useCacco();

  const [layer,         setLayer]       = useState('status');
  const [overlays,      setOverlays]    = useState(DEFAULT_OVERLAYS);
  const [heatmapKey,    setHeatmapKey]  = useState('');
  const [selId,         setSelId]       = useState('BLK_B');
  const [selObject,     setSelObject]   = useState(null);
  const [selObjectType, setSelObjType]  = useState(null);
  const [lockdown,      setLockdown]    = useState(false);
  const [showTimeline,  setTimeline]    = useState(true);
  const [guardPos,      setGuardPos]    = useState(INIT_GUARDS);
  const [doorStates,    setDoorStates]  = useState({});
  const [toast,         setToast]       = useState(null);
  const [actionModal,   setActionModal] = useState(null);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  /* Guard animation — random walk within zone bounds */
  useEffect(() => {
    const t = setInterval(() => {
      setGuardPos(prev => prev.map(g => {
        const z = TWIN_ZONES.find(z => z.id === g.zId);
        if (!z) return g;
        const dx = (Math.random() - .5) * 28, dy = (Math.random() - .5) * 28;
        return { ...g,
          x: Math.max(z.x+10, Math.min(z.x+z.w-10, g.x+dx)),
          y: Math.max(z.y+10, Math.min(z.y+z.h-10, g.y+dy)),
        };
      }));
    }, 1900);
    return () => clearInterval(t);
  }, []);

  const toggleOverlay = useCallback((key) => {
    setOverlays(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const handleToggleDoor = useCallback((id, newStatus) => {
    setDoorStates(prev => ({ ...prev, [id]: newStatus }));
    flash(`Door ${id} — ${newStatus.toUpperCase()}`);
  }, []);

  const handleLockdown = useCallback(() => {
    setLockdown(prev => {
      flash(prev ? 'LOCKDOWN LIFTED — facility returning to normal operations' : '⚠ FACILITY-WIDE LOCKDOWN INITIATED');
      return !prev;
    });
  }, []);

  const handleSelectGuard   = useCallback((g)   => { setSelObject(g);   setSelObjType('guard');    }, []);
  const handleSelectCamera  = useCallback((cam) => { setSelObject(cam); setSelObjType('camera');   }, []);
  const handleSelectSensor  = useCallback((s)   => { setSelObject(s);   setSelObjType('sensor');   }, []);
  const handleSelectDoor    = useCallback((d)   => { setSelObject(d);   setSelObjType('door');     }, []);
  const handleSelectInmate  = useCallback((m)   => { setSelObject(m);   setSelObjType('inmate');   }, []);
  const handleSelectIncident= useCallback((i)   => { setSelObject(i);   setSelObjType('incident'); }, []);

  return (
    <div className="-m-4 flex flex-col"
         style={{height:'calc(100vh - var(--app-header-h) - var(--app-footer-h))'}}>

      <ControlBar
        layer={layer} onLayer={setLayer}
        overlays={overlays} onToggleOverlay={toggleOverlay}
        heatmapKey={heatmapKey} onHeatmap={setHeatmapKey}
        lockdown={lockdown} onLockdown={handleLockdown}
        guardPos={guardPos}/>

      {/* Map + Intel panel */}
      <div className="flex flex-1 min-h-0">
        <MapCanvas
          layer={layer} overlays={overlays} heatmapKey={heatmapKey}
          selId={selId} onSelect={setSelId}
          guardPos={guardPos}
          onSelectGuard={handleSelectGuard}
          onSelectCamera={handleSelectCamera}
          onSelectSensor={handleSelectSensor}
          onSelectDoor={handleSelectDoor}
          onSelectInmate={handleSelectInmate}
          onSelectIncident={handleSelectIncident}
          lockdownActive={lockdown}
        />
        <IntelPanel
          selId={selId} selObject={selObject} selObjectType={selObjectType}
          c={c} guardPos={guardPos}
          doorStates={doorStates} onToggleDoor={handleToggleDoor}
          onSelectZone={setSelId}
        />
      </div>

      <Timeline visible={showTimeline} onToggle={() => setTimeline(v => !v)}/>

      {/* Zone action modal */}
      {actionModal && (
        <ActionModal
          title={`Zone Actions — ${actionModal.label}`}
          subtitle={`${actionModal.short} · ${actionModal.status.toUpperCase()} · ${actionModal.occ}/${actionModal.cap}`}
          fields={[
            { id:'action', label:'Operational Action', type:'select', required:true, options:[
              {value:'lockdown',   label:'Order Zone Lockdown'},
              {value:'headcount',  label:'Request Headcount'},
              {value:'patrol',     label:'Deploy Additional Patrol'},
              {value:'search',     label:'Order Cell Search'},
              {value:'maintenance',label:'Report Infrastructure Issue'},
              {value:'alert',      label:'Create Zone Alert'},
            ]},
            { id:'team', label:'Assign Team', type:'select', options:(c.teams||[]).map(t=>({value:t.callsign,label:t.callsign})) },
            { id:'notes', label:'Notes', type:'textarea', required:true, placeholder:'Describe the situation...' },
          ]}
          confirmLabel="Execute Action"
          confirmTone={actionModal.status==='critical'?'danger':'primary'}
          onConfirm={(vals) => flash(`Action "${vals.action}" executed in ${actionModal.label}`)}
          onClose={() => setActionModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[600] px-5 py-2.5 rounded-lg border font-semibold text-xs shadow-2xl animate-slide-up"
          style={{background:'var(--app-panel-2)',borderColor:'var(--app-accent-border)',color:'var(--app-accent)',maxWidth:500,textAlign:'center'}}>
          {toast}
        </div>
      )}
    </div>
  );
}
