/* ════════════════════════════════════════════════════════════════════
   CACCO — Digital Twin (live schematic facility model)
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { Panel, Chip, Meter, PageHeader, KV, Segmented, Dot } from '../components/ui';
import { Icon } from '../components/Icon';
import { OPSTATUS, RISK } from '../utils/tone';
import { useT } from '../contexts/LanguageContext';
const LAYERS = [
    { value: 'status', label: 'Status' }, { value: 'occupancy', label: 'Occupancy' },
    { value: 'incidents', label: 'Incidents' }, { value: 'personnel', label: 'Personnel' },
];
const S = 10; // geo(%)→viewBox scale
const heat = (load) => (load > 0.95 ? '#ef4444' : load > 0.85 ? '#f59e0b' : load > 0.6 ? '#38bdf8' : '#10b981');
export default function DigitalTwin() {
    const c = useCacco();
    const { t } = useT();
    const [layer, setLayer] = useState('status');
    const [selId, setSelId] = useState('BLK-B');
    const perimeter = c.zones.find((z) => z.kind === 'perimeter');
    const interior = useMemo(() => c.zones.filter((z) => z.kind !== 'perimeter'), [c.zones]);
    const sel = c.zones.find((z) => z.id === selId) ?? interior[0];
    const alertZones = useMemo(() => new Set(c.alerts.filter((a) => a.status === 'active' || a.status === 'dispatched').map((a) => a.zoneId)), [c.alerts]);
    const camFor = (id) => { const list = c.cameras.filter((cm) => cm.zoneId === id); return { total: list.length, online: list.filter((x) => x.online).length, flags: list.reduce((s, x) => s + x.aiFlags, 0) }; };
    const zoneFill = (z) => {
        const load = z.capacity > 0 ? z.occupancy / z.capacity : 0;
        if (layer === 'occupancy')
            return z.capacity > 0 ? heat(load) : '#526278';
        if (layer === 'incidents')
            return z.incidents24h >= 4 ? '#ef4444' : z.incidents24h >= 2 ? '#f59e0b' : z.incidents24h >= 1 ? '#38bdf8' : '#10b981';
        if (layer === 'personnel')
            return '#38bdf8';
        return OPSTATUS[z.status].hex;
    };
    const zoneMetric = (z) => {
        if (layer === 'occupancy')
            return z.capacity > 0 ? `${Math.round((z.occupancy / z.capacity) * 100)}%` : '—';
        if (layer === 'incidents')
            return `${z.incidents24h} inc`;
        if (layer === 'personnel')
            return `${z.assignedPersonnel} ofr`;
        return z.capacity > 0 ? `${z.occupancy}/${z.capacity}` : '—';
    };
    return (<div className="space-y-4">
      <PageHeader code="TWIN" title={t('twin.title')} subtitle={t('twin.subtitle')} actions={<><Segmented options={LAYERS} value={layer} onChange={setLayer}/><Chip tone="danger"><Dot color="currentColor" pulse/>LIVE</Chip></>}/>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {/* Map */}
        <Panel className="xl:col-span-3" title={t('twin.schematic')} icon={<Icon name="twin" className="w-4 h-4"/>} subtitle={t('twin.schematicSub')} bodyClass="relative p-3">
          <div className="relative overflow-hidden rounded-lg cacco-grid" style={{ background: 'var(--app-bg-deep)', border: '1px solid var(--app-border)' }}>
            {/* radar overlay */}
            <div className="pointer-events-none absolute right-3 top-3 z-10 h-16 w-16 rounded-full" style={{ border: '1px solid var(--app-accent-border)', background: 'rgba(74,168,255,0.04)' }}>
              <div className="radar-sweep"/>
              <div className="absolute inset-0 flex items-center justify-center"><Dot color="#38bdf8" pulse/></div>
            </div>

            <svg viewBox="0 0 1000 960" className="w-full" style={{ height: 600 }}>
              {/* perimeter */}
              <rect x={perimeter.geo.x * S} y={perimeter.geo.y * S} width={perimeter.geo.w * S} height={perimeter.geo.h * S} rx={14} fill="none" stroke="#295182" strokeWidth={2} strokeDasharray="10 7"/>
              <text x={perimeter.geo.x * S + 12} y={perimeter.geo.y * S - 6} fontSize={15} fill="#526278" fontFamily="JetBrains Mono" letterSpacing="2">PERIMETER SECURITY · DRONE OVERWATCH ACTIVE</text>
              {/* corner sensor nodes */}
              {[[perimeter.geo.x, perimeter.geo.y], [perimeter.geo.x + perimeter.geo.w, perimeter.geo.y], [perimeter.geo.x, perimeter.geo.y + perimeter.geo.h], [perimeter.geo.x + perimeter.geo.w, perimeter.geo.y + perimeter.geo.h]].map(([x, y], i) => (<circle key={i} cx={x * S} cy={y * S} r={5} fill="#10b981"/>))}

              {/* interior zones */}
              {interior.map((z) => {
            const x = z.geo.x * S, y = z.geo.y * S, w = z.geo.w * S, h = z.geo.h * S;
            const fill = zoneFill(z);
            const selected = z.id === selId;
            const alerting = alertZones.has(z.id);
            return (<g key={z.id} style={{ cursor: 'pointer' }} onClick={() => setSelId(z.id)}>
                    <rect x={x} y={y} width={w} height={h} rx={8} fill={`${fill}1f`} stroke={fill} strokeWidth={selected ? 3 : 1.5} style={{ filter: selected ? `drop-shadow(0 0 10px ${fill}aa)` : undefined, transition: 'all 0.3s' }}/>
                    <text x={x + 10} y={y + 22} fontSize={15} fontWeight="bold" fill="#E6EDF7" fontFamily="JetBrains Mono">{z.code}</text>
                    <text x={x + 10} y={y + 40} fontSize={12} fill="#A9BBD0">{z.name}</text>
                    <text x={x + w - 10} y={y + h - 12} fontSize={16} fontWeight="bold" fill={fill} fontFamily="JetBrains Mono" textAnchor="end">{zoneMetric(z)}</text>
                    <circle cx={x + w - 12} cy={y + 14} r={5} fill={OPSTATUS[z.status].hex}/>
                    {alerting && <circle cx={x + w - 12} cy={y + 14} r={9} fill="none" stroke="#ef4444" strokeWidth={1.5} className="animate-blink"/>}
                    {z.incidents24h > 0 && (<g><rect x={x + 8} y={y + h - 26} width={z.incidents24h >= 10 ? 34 : 26} height={16} rx={4} fill="#ef444422" stroke="#ef444455"/>
                        <text x={x + 13} y={y + h - 14} fontSize={11} fill="#ef4444" fontFamily="JetBrains Mono">⚠{z.incidents24h}</text></g>)}
                  </g>);
        })}
            </svg>
          </div>

          {/* legend */}
          <div className="mt-2.5 flex flex-wrap items-center gap-3 px-1">
            <span className="t-label">Legend:</span>
            {['normal', 'elevated', 'critical'].map((k) => (<span key={k} className="flex items-center gap-1.5 text-[10px] text-app-text-faint"><Dot color={OPSTATUS[k].hex} size={7}/>{OPSTATUS[k].label}</span>))}
            <span className="flex items-center gap-1.5 text-[10px] text-app-text-faint"><span className="h-2 w-2 rounded-full border border-app-danger animate-blink"/>Active alert</span>
          </div>
        </Panel>

        {/* Inspector */}
        <div className="space-y-4">
          <Panel title="Zone Inspector" icon={<Icon name="crosshair" className="w-4 h-4"/>} bodyClass="p-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-extrabold text-app-text flex-1">{sel.name}</h3>
              <Chip tone={OPSTATUS[sel.status].chip} dot>{OPSTATUS[sel.status].label}</Chip>
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-app-text-faint">ZONE {sel.code} · {sel.kind.toUpperCase()}</p>

            {sel.capacity > 0 && (<div className="mt-3">
                <div className="mb-1 flex items-center justify-between"><span className="t-label">Occupancy</span><span className="font-mono text-[11px] font-bold text-app-text">{sel.occupancy}/{sel.capacity}</span></div>
                <Meter value={sel.occupancy} max={sel.capacity} color={heat(sel.occupancy / sel.capacity)}/>
              </div>)}
            <div className="mt-3 space-y-0">
              <KV k="Operational Risk" v={RISK[sel.risk].label} color={RISK[sel.risk].hex}/>
              <KV k="Incidents (24h)" v={sel.incidents24h} color={sel.incidents24h >= 2 ? '#f59e0b' : undefined}/>
              <KV k="Assigned Personnel" v={sel.assignedPersonnel}/>
              <KV k="Cameras Online" v={`${camFor(sel.id).online}/${camFor(sel.id).total}`} color="#10b981"/>
              <KV k="AI Flags" v={camFor(sel.id).flags} color={camFor(sel.id).flags > 0 ? '#f59e0b' : '#10b981'}/>
            </div>
          </Panel>

          <Panel title="Facility Telemetry" icon={<Icon name="activity" className="w-4 h-4"/>} bodyClass="p-3 space-y-0">
            <KV k="Total Zones" v={c.zones.length}/>
            <KV k="Population" v={c.inmates.length}/>
            <KV k="Cameras Online" v={`${c.cameras.filter((x) => x.online).length}/${c.cameras.length}`} color="#10b981"/>
            <KV k="Active Alerts" v={alertZones.size} color="#ef4444"/>
            <KV k="Model Sync" v="REAL-TIME" color="#38bdf8"/>
          </Panel>

          <Panel title="Environmental Sensors" icon={<Icon name="drop" className="w-4 h-4"/>} subtitle="Zone micro-climate telemetry" bodyClass="p-3 space-y-2">
            {interior.slice(0, 6).map((z, i) => {
            const tempC = 22 + (i * 3 % 7);
            const humidity = 54 + (i * 7 % 20);
            const noise = 35 + (i * 9 % 30);
            const tempOk = tempC <= 27;
            const noiseOk = noise <= 55;
            return (<div key={z.id} className="rounded border border-app-border p-2" style={{ background: 'var(--app-bg-deep)' }}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-app-text">{z.code}</span>
                    <Dot color={tempOk && noiseOk ? '#10b981' : '#f59e0b'} size={5}/>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div>
                      <p className="font-mono text-[12px] font-bold" style={{ color: tempOk ? '#10b981' : '#f59e0b' }}>{tempC}°</p>
                      <p className="text-[8px] text-app-text-faint">TEMP</p>
                    </div>
                    <div>
                      <p className="font-mono text-[12px] font-bold text-app-accent">{humidity}%</p>
                      <p className="text-[8px] text-app-text-faint">HUM</p>
                    </div>
                    <div>
                      <p className="font-mono text-[12px] font-bold" style={{ color: noiseOk ? '#38bdf8' : '#f59e0b' }}>{noise}dB</p>
                      <p className="text-[8px] text-app-text-faint">NOISE</p>
                    </div>
                  </div>
                </div>);
        })}
          </Panel>
        </div>
      </div>
    </div>);
}
