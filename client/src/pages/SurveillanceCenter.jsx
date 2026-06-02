/* ════════════════════════════════════════════════════════════════════
   CACCO — Surveillance Center
   CCTV grid · AI video analytics · camera health monitoring
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { Panel, MetricCard, Chip, PageHeader, KV, Dot, Meter, SectionLabel, Segmented } from '../components/ui';
import { Icon } from '../components/Icon';
import { useT } from '../contexts/LanguageContext';
const CAM_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'flagged', label: 'Flagged' },
];
/* Simulated camera feed placeholder colours per zone */
const ZONE_GRAD = {
    'MAX': 'linear-gradient(135deg,#1a0a0a 0%,#2d1111 100%)',
    'BLK-A': 'linear-gradient(135deg,#080f18 0%,#0d1e2f 100%)',
    'BLK-B': 'linear-gradient(135deg,#091218 0%,#0d2230 100%)',
    'BLK-C': 'linear-gradient(135deg,#081018 0%,#0f1d2b 100%)',
    'MED': 'linear-gradient(135deg,#0a1a0f 0%,#122b18 100%)',
    'VIS': 'linear-gradient(135deg,#0d1018 0%,#142030 100%)',
    'REC': 'linear-gradient(135deg,#121008 0%,#231e10 100%)',
    'INT': 'linear-gradient(135deg,#0f1018 0%,#1c1f30 100%)',
    'PER': 'linear-gradient(135deg,#0a1218 0%,#142030 100%)',
};
function CameraCell({ cam, selected, onSelect }) {
    const grad = ZONE_GRAD[cam.zoneId] ?? ZONE_GRAD['BLK-A'];
    return (<button onClick={onSelect} className="group relative overflow-hidden rounded-lg border transition-all text-left" style={{
            borderColor: selected ? '#38bdf8' : cam.aiFlags > 0 ? '#f59e0b66' : cam.online ? '#1D3652' : '#ef444444',
            boxShadow: selected ? '0 0 0 1px #38bdf866, 0 0 12px #38bdf822' : cam.aiFlags > 0 ? '0 0 8px #f59e0b22' : 'none',
            background: grad,
        }}>
      {/* Simulated feed */}
      <div className="relative" style={{ paddingTop: '56.25%' }}>
        {/* Scanline overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.3) 2px,rgba(0,0,0,0.3) 4px)' }}/>
        {/* Camera ID watermark */}
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <span className="font-mono text-[9px] font-bold text-white/60 tracking-widest">{cam.id}</span>
        </div>
        {/* Status indicator */}
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {cam.aiFlags > 0 && (<span className="rounded px-1 py-0.5 font-mono text-[8px] font-bold" style={{ background: '#f59e0b33', color: '#f59e0b', border: '1px solid #f59e0b66' }}>
              AI⚠{cam.aiFlags}
            </span>)}
          <Dot color={cam.online ? '#10b981' : '#ef4444'} pulse={cam.online} size={6}/>
        </div>
        {/* Zone label */}
        <div className="absolute bottom-2 left-2">
          <span className="font-mono text-[8px] text-white/40 uppercase tracking-widest">{cam.label}</span>
        </div>
        {/* FPS counter */}
        <div className="absolute bottom-2 right-2">
          <span className="font-mono text-[8px]" style={{ color: cam.online ? '#10b98188' : '#ef444488' }}>
            {cam.online ? `${cam.fps}fps` : 'OFFLINE'}
          </span>
        </div>
        {/* Offline overlay */}
        {!cam.online && (<div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="text-center">
              <Icon name="surveillance" className="mx-auto h-6 w-6 opacity-30"/>
              <p className="mt-1 font-mono text-[9px] text-app-danger opacity-70">SIGNAL LOST</p>
            </div>
          </div>)}
      </div>
    </button>);
}
export default function SurveillanceCenter() {
    const c = useCacco();
    const { t } = useT();
    const [filter, setFilter] = useState('all');
    const [sel, setSel] = useState(null);
    const [zone, setZone] = useState('all');
    const online = useMemo(() => c.cameras.filter((x) => x.online).length, [c.cameras]);
    const offline = useMemo(() => c.cameras.filter((x) => !x.online).length, [c.cameras]);
    const flagged = useMemo(() => c.cameras.filter((x) => x.aiFlags > 0).length, [c.cameras]);
    const totalFlags = useMemo(() => c.cameras.reduce((s, x) => s + x.aiFlags, 0), [c.cameras]);
    const zones = useMemo(() => {
        const ids = [...new Set(c.cameras.map((x) => x.zoneId))];
        return ids.map((id) => ({ id, name: c.zones.find((z) => z.id === id)?.name ?? id }));
    }, [c.cameras, c.zones]);
    const filtered = useMemo(() => c.cameras.filter((cam) => {
        if (filter === 'online' && !cam.online)
            return false;
        if (filter === 'offline' && cam.online)
            return false;
        if (filter === 'flagged' && !cam.aiFlags)
            return false;
        if (zone !== 'all' && cam.zoneId !== zone)
            return false;
        return true;
    }), [c.cameras, filter, zone]);
    const selectedCam = sel ?? filtered[0] ?? null;
    /* Per-zone camera breakdown */
    const zoneStats = useMemo(() => zones.map(({ id, name }) => {
        const cams = c.cameras.filter((x) => x.zoneId === id);
        return { id, name, total: cams.length, online: cams.filter((x) => x.online).length, flags: cams.reduce((s, x) => s + x.aiFlags, 0) };
    }), [zones, c.cameras]);
    return (<div className="space-y-4">
      <PageHeader code="SURV" title={t('surv.title')} subtitle={t('surv.subtitle')} actions={<>
            <Chip tone="danger" dot>{offline} OFFLINE</Chip>
            {flagged > 0 && <Chip tone="warning"><Icon name="alert" className="w-3 h-3"/> {flagged} AI FLAGS</Chip>}
            <Chip tone="success"><Dot color="#10b981" pulse/>RECORDING</Chip>
          </>}/>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t('surv.totalCameras')} value={c.cameras.length} icon={<Icon name="surveillance" className="w-4 h-4"/>} tone="#38bdf8" sub="facility-wide coverage"/>
        <MetricCard label={t('surv.onlineCameras')} value={online} icon={<Icon name="check" className="w-4 h-4"/>} tone="#10b981" sub={`${Math.round((online / c.cameras.length) * 100)}% operational`}/>
        <MetricCard label={t('surv.offlineCameras')} value={offline} icon={<Icon name="alert" className="w-4 h-4"/>} tone="#ef4444" sub="maintenance required"/>
        <MetricCard label={t('surv.flaggedCameras')} value={totalFlags} icon={<Icon name="ai" className="w-4 h-4"/>} tone="#f59e0b" sub="anomalies detected"/>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {/* Camera grid */}
        <Panel className="xl:col-span-3" title="Camera Matrix" icon={<Icon name="surveillance" className="w-4 h-4"/>} subtitle={`${filtered.length} cameras displayed`} live actions={<div className="flex items-center gap-2">
              <select value={zone} onChange={(e) => setZone(e.target.value)} className="rounded-md border border-app-border bg-app-bg-deep px-2 py-1.5 text-[11px] text-app-text">
                <option value="all">All Zones</option>
                {zones.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
              </select>
              <Segmented options={CAM_FILTERS} value={filter} onChange={setFilter}/>
            </div>} bodyClass="p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filtered.map((cam) => (<CameraCell key={cam.id} cam={cam} selected={selectedCam?.id === cam.id} onSelect={() => setSel(cam)}/>))}
          </div>
          {filtered.length === 0 && (<div className="flex h-32 items-center justify-center text-xs text-app-text-faint">
              No cameras match current filters.
            </div>)}
        </Panel>

        {/* Right column: inspector + zone breakdown */}
        <div className="space-y-4">
          {selectedCam && (<Panel title="Camera Inspector" icon={<Icon name="crosshair" className="w-4 h-4"/>} bodyClass="p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-app-text">{selectedCam.label}</h3>
                <Dot color={selectedCam.online ? '#10b981' : '#ef4444'} pulse={selectedCam.online}/>
              </div>
              <p className="font-mono text-[10px] text-app-text-faint mb-3">{selectedCam.id} · {selectedCam.zoneId}</p>
              <div className="space-y-0">
                <KV k="Status" v={selectedCam.online ? 'ONLINE' : 'OFFLINE'} color={selectedCam.online ? '#10b981' : '#ef4444'}/>
                <KV k="Frame Rate" v={`${selectedCam.fps} fps`} color={selectedCam.fps >= 25 ? '#10b981' : '#f59e0b'}/>
                <KV k="AI Flags" v={selectedCam.aiFlags} color={selectedCam.aiFlags > 0 ? '#f59e0b' : '#10b981'}/>
                <KV k="Zone" v={c.zones.find((z) => z.id === selectedCam.zoneId)?.name ?? selectedCam.zoneId}/>
                <KV k="Resolution" v="1920×1080"/>
                <KV k="Retention" v="30 days"/>
                <KV k="Encryption" v="AES-256" color="#10b981"/>
              </div>
              {selectedCam.aiFlags > 0 && (<>
                  <SectionLabel className="mt-3 mb-2">AI Detection Events</SectionLabel>
                  {Array.from({ length: selectedCam.aiFlags }).map((_, i) => (<div key={i} className="mb-1.5 rounded-md border border-app-border px-2 py-1.5" style={{ background: 'var(--app-bg-deep)' }}>
                      <p className="text-[10px] font-bold text-app-warning">⚠ {['Unauthorized movement', 'Unidentified gathering', 'Restricted zone breach', 'Contraband indicator'][i % 4]}</p>
                      <p className="font-mono text-[9px] text-app-text-faint mt-0.5">Confidence: {75 + i * 7}% · {selectedCam.id}</p>
                    </div>))}
                </>)}
            </Panel>)}

          <Panel title="Zone Coverage" icon={<Icon name="dotsGrid" className="w-4 h-4"/>} bodyClass="p-3 space-y-2">
            {zoneStats.map(({ id, name, total, online: on, flags }) => (<div key={id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-[10px] text-app-text-muted">{name}</span>
                  <span className="shrink-0 font-mono text-[10px] font-bold text-app-text">{on}/{total}</span>
                </div>
                <Meter value={on} max={total} color={on === total ? '#10b981' : on / total >= 0.8 ? '#38bdf8' : '#f59e0b'} height={4}/>
                {flags > 0 && <p className="mt-0.5 text-[9px] font-bold text-app-warning">{flags} AI flag{flags > 1 ? 's' : ''}</p>}
              </div>))}
          </Panel>
        </div>
      </div>

      {/* Camera health table */}
      <Panel title="Camera Health Log" icon={<Icon name="activity" className="w-4 h-4"/>} bodyClass="overflow-x-auto">
        <table className="dtable">
          <thead>
            <tr><th>ID</th><th>Label</th><th>Zone</th><th>Status</th><th>FPS</th><th>AI Flags</th><th>Health</th></tr>
          </thead>
          <tbody>
            {c.cameras.map((cam) => (<tr key={cam.id} className="cursor-pointer" onClick={() => setSel(cam)}>
                <td className="font-mono text-[10px] text-app-text-faint">{cam.id}</td>
                <td className="font-semibold text-app-text">{cam.label}</td>
                <td className="font-mono text-[10px]">{cam.zoneId}</td>
                <td>
                  <Chip tone={cam.online ? 'success' : 'danger'} dot>
                    {cam.online ? 'ONLINE' : 'OFFLINE'}
                  </Chip>
                </td>
                <td className="font-mono" style={{ color: cam.fps >= 25 ? '#10b981' : cam.fps > 0 ? '#f59e0b' : '#ef4444' }}>{cam.fps}</td>
                <td className="font-mono" style={{ color: cam.aiFlags > 0 ? '#f59e0b' : undefined }}>{cam.aiFlags}</td>
                <td style={{ width: 100 }}>
                  <Meter value={cam.online ? cam.fps : 0} max={30} color={cam.online ? '#10b981' : '#ef4444'} height={4}/>
                </td>
              </tr>))}
          </tbody>
        </table>
      </Panel>
    </div>);
}
