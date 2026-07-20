/* ════════════════════════════════════════════════════════════════════
   CACCO — Digital Twin (live schematic facility model)
   ════════════════════════════════════════════════════════════════════ */
import React, { useCallback, useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { Panel, Chip, Meter, PageHeader, KV, Dot } from '../components/ui';
import { Icon } from '../components/Icon';
import { OPSTATUS, RISK } from '../utils/tone';
import { useT } from '../contexts/LanguageContext';
import DigitalTwinCanvas from '../components/DigitalTwinCanvas';
const heat = (load) => (load > 0.95 ? '#ef4444' : load > 0.85 ? '#f59e0b' : load > 0.6 ? '#38bdf8' : '#10b981');
/* Zone micro-climate telemetry (deterministic per zone index) — surfaced in the
   Zone Inspector and as hover tooltips, replacing the standalone sensors panel. */
const envFor = (idx) => {
    const tempC = 22 + ((idx * 3) % 7);
    const humidity = 54 + ((idx * 7) % 20);
    const noise = 35 + ((idx * 9) % 30);
    return { tempC, humidity, noise, tempOk: tempC <= 27, noiseOk: noise <= 55 };
};
export default function DigitalTwin() {
    const c = useCacco();
    const { t } = useT();
    const [selId, setSelId] = useState('BLK-B');
    const interior = useMemo(() => c.zones.filter((z) => z.kind !== 'perimeter'), [c.zones]);
    const sel = c.zones.find((z) => z.id === selId) ?? interior[0];
    const selEnv = envFor(Math.max(0, interior.findIndex((z) => z.id === sel.id)));
    /* Env telemetry lookup for any zone/building id — fed to the 3D twin so
       hovering a building shows the same micro-climate data as a tooltip. */
    const envForZone = useCallback((id) => {
        const idx = interior.findIndex((z) => z.id === id);
        return idx < 0 ? null : envFor(idx);
    }, [interior]);
    const alertZones = useMemo(() => new Set(c.alerts.filter((a) => a.status === 'active' || a.status === 'dispatched').map((a) => a.zoneId)), [c.alerts]);
    const camFor = (id) => { const list = c.cameras.filter((cm) => cm.zoneId === id); return { total: list.length, online: list.filter((x) => x.online).length, flags: list.reduce((s, x) => s + x.aiFlags, 0) }; };
    return (<div className="space-y-4">
      <PageHeader code="TWIN" title={t('twin.title')} subtitle={t('twin.subtitle')} actions={<Chip tone="danger"><Dot color="currentColor" pulse/>LIVE</Chip>}/>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {/* Map */}
        <Panel className="xl:col-span-3" title={t('twin.schematic')} icon={<Icon name="twin" className="w-4 h-4"/>} subtitle={t('twin.schematicSub')} bodyClass="relative p-3 flex flex-col">
          <div className="mb-2.5 flex shrink-0 flex-wrap items-center gap-2 px-1">
            <span className="t-label">Inspect zone:</span>
            <select value={selId} onChange={(e) => setSelId(e.target.value)} className="rounded-md border border-app-border bg-app-bg-deep px-2 py-1.5 text-[11px] text-app-text" style={{ background: 'var(--app-bg-deep)' }}>
              {interior.map((z) => <option key={z.id} value={z.id}>{z.code} · {z.name}</option>)}
            </select>
            <Chip tone="info">3D FOUNDATION · BUILDINGS COMING SOON</Chip>
          </div>

          {/* 3D twin fills the entire remaining panel area (width + height). */}
          <div className="flex-1" style={{ minHeight: 560 }}>
            <DigitalTwinCanvas height="100%" envForZone={envForZone}/>
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

            {/* Environmental sensors — micro-climate telemetry for the selected
                zone. Hover any reading for its threshold status. */}
            <div className="mt-3 border-t border-app-border pt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="t-label">Environmental Sensors</span>
                <Dot color={selEnv.tempOk && selEnv.noiseOk ? '#10b981' : '#f59e0b'} size={5}/>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div title={`Ambient temperature · ${selEnv.tempC}°C · threshold ≤27°C · ${selEnv.tempOk ? 'WITHIN RANGE' : 'ELEVATED'}`}>
                  <p className="font-mono text-[13px] font-bold" style={{ color: selEnv.tempOk ? '#10b981' : '#f59e0b' }}>{selEnv.tempC}°</p>
                  <p className="text-[8px] text-app-text-faint">TEMP</p>
                </div>
                <div title={`Relative humidity · ${selEnv.humidity}% RH`}>
                  <p className="font-mono text-[13px] font-bold text-app-accent">{selEnv.humidity}%</p>
                  <p className="text-[8px] text-app-text-faint">HUM</p>
                </div>
                <div title={`Ambient noise · ${selEnv.noise}dB · threshold ≤55dB · ${selEnv.noiseOk ? 'NORMAL' : 'HIGH'}`}>
                  <p className="font-mono text-[13px] font-bold" style={{ color: selEnv.noiseOk ? '#38bdf8' : '#f59e0b' }}>{selEnv.noise}dB</p>
                  <p className="text-[8px] text-app-text-faint">NOISE</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Facility Telemetry" icon={<Icon name="activity" className="w-4 h-4"/>} bodyClass="p-3 space-y-0">
            <KV k="Total Zones" v={c.zones.length}/>
            <KV k="Population" v={c.inmates.length}/>
            <KV k="Cameras Online" v={`${c.cameras.filter((x) => x.online).length}/${c.cameras.length}`} color="#10b981"/>
            <KV k="Active Alerts" v={alertZones.size} color="#ef4444"/>
            <KV k="Model Sync" v="REAL-TIME" color="#38bdf8"/>
          </Panel>

        </div>
      </div>
    </div>);
}
