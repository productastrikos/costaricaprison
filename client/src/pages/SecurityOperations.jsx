/* ════════════════════════════════════════════════════════════════════
   CACCO — Security Operations
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { useNow } from '../utils/useNow';
import { Panel, MetricCard, Chip, Meter, PageHeader, KV, Dot } from '../components/ui';
import { AlertCard } from '../components/cards';
import { Icon } from '../components/Icon';
import { SEC_LEVEL, OPSTATUS, RISK } from '../utils/tone';
import { useT } from '../contexts/LanguageContext';
import { orderLockdown, dispatchTeam } from '../services/api';
const POSTURE_DESC = {
    1: 'Routine operations. Standard patrols and movement schedules in effect.',
    2: 'Increased vigilance. Enhanced patrols; non-essential movement restricted.',
    3: 'High alert. Movement controlled; response teams staged; intel surge active.',
    4: 'Critical incident. Full lockdown protocol; all teams deployed; external liaison engaged.',
};
const SECTORS = [
    { id: 'N-7', name: 'North Line 7', status: 'alert' }, { id: 'N-8', name: 'North Line 8', status: 'secure' },
    { id: 'E-1', name: 'East Gate', status: 'secure' }, { id: 'E-2', name: 'East Fence', status: 'secure' },
    { id: 'S-4', name: 'South Yard', status: 'watch' }, { id: 'S-5', name: 'South Line', status: 'secure' },
    { id: 'W-3', name: 'West Tower', status: 'secure' }, { id: 'W-6', name: 'West Fence', status: 'secure' },
];
const SECTOR_TONE = {
    secure: { hex: '#10b981', chip: 'success' }, watch: { hex: '#f59e0b', chip: 'warning' }, alert: { hex: '#ef4444', chip: 'danger' },
};
export default function SecurityOperations() {
    const c = useCacco();
    const now = useNow();    const { t } = useT();    const [teams, setTeams] = useState(c.teams);
    const [toast, setToast] = useState(null);
    const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };
    const activeAlerts = useMemo(() => c.alerts.filter((a) => a.status === 'active' || a.status === 'dispatched'), [c.alerts]);
    const matrixZones = useMemo(() => c.zones.filter((z) => z.kind !== 'recreation' && z.kind !== 'intake'), [c.zones]);
    const deployed = teams.filter((t) => t.status === 'deployed' || t.status === 'responding').length;
    const sec = SEC_LEVEL[c.facility.securityLevel];
    const toggleTeam = (id) => {
        setTeams((p) => p.map((t) => {
            if (t.id !== id)
                return t;
            const next = t.status === 'standby' ? 'deployed' : 'standby';
            dispatchTeam(t.callsign, next === 'deployed' ? 'forward position' : 'standby').then((r) => flash(r.message));
            return { ...t, status: next };
        }));
    };
    return (<div className="space-y-4">
      <PageHeader code="SEC-OPS" title={t('sec.title')} subtitle={t('sec.subtitle')} actions={<>
            <span className="seclevel"><Dot color="var(--app-text-faint)" size={5}/> {sec.code} · {sec.label}</span>
            <button className="btn btn-danger" onClick={() => orderLockdown('Cell Block B').then((r) => flash(r.message))}><Icon name="lock" className="w-3.5 h-3.5"/> {t('sec.initLockdown')}</button>
          </>}/>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t('sec.activeAlerts')} value={activeAlerts.length} icon={<Icon name="bell" className="w-4 h-4"/>} tone="#ef4444" sub="live security events"/>
        <MetricCard label={t('sec.deployed')} value={`${deployed}/${teams.length}`} icon={<Icon name="shield" className="w-4 h-4"/>} tone="#f59e0b" sub="response readiness"/>
        <MetricCard label={t('sec.lockdownZones')} value={c.facility.lockdownZones} icon={<Icon name="lock" className="w-4 h-4"/>} tone="#ef4444" sub="movement halted"/>
        <MetricCard label={t('sec.perimeter')} value={`${SECTORS.filter((s) => s.status === 'secure').length}/${SECTORS.length}`} icon={<Icon name="radio" className="w-4 h-4"/>} tone="#10b981" sub="secure / total"/>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Posture + matrix */}
        <div className="space-y-4 xl:col-span-2">
          <Panel title={t('sec.postureTitle')} icon={<Icon name="gauge" className="w-4 h-4"/>} subtitle={t('sec.postureSub')} bodyClass="p-3">
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {[1, 2, 3, 4].map((lvl) => {
            const m = SEC_LEVEL[lvl];
            const active = c.facility.securityLevel === lvl;
            return (<button key={lvl} onClick={() => c.setSecurityLevel(lvl)} className="rounded-lg border p-3 text-left transition-all" style={{ borderColor: active ? 'var(--app-border-strong)' : 'var(--app-border)', background: active ? 'var(--app-surface-raised)' : 'var(--app-bg-deep)' }}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-app-text">{m.code}</span>
                      {active && <span className="font-mono text-[8px] font-bold tracking-widest text-app-accent">ACTIVE</span>}
                    </div>
                    <p className="mt-1.5 text-[12px] font-bold text-app-text">{m.label}</p>
                    <p className="mt-1 text-[9.5px] leading-snug text-app-text-faint line-clamp-3">{POSTURE_DESC[lvl]}</p>
                  </button>);
        })}
            </div>
          </Panel>

          <Panel title={t('sec.zoneMatrix')} icon={<Icon name="dotsGrid" className="w-4 h-4"/>} bodyClass="overflow-x-auto">
            <table className="dtable">
              <thead><tr><th>{t('common.zone')}</th><th>{t('common.status')}</th><th>{t('common.occupancy')}</th><th>{t('common.personnel')}</th><th>{t('common.incidents')} 24h</th><th>{t('common.risk')}</th><th></th></tr></thead>
              <tbody>
                {matrixZones.map((z) => {
            const t = OPSTATUS[z.status];
            const r = RISK[z.risk];
            return (<tr key={z.id}>
                      <td className="font-semibold text-app-text">{z.name}</td>
                      <td><Chip tone={t.chip} dot>{t.label}</Chip></td>
                      <td className="font-mono">{z.capacity > 0 ? `${z.occupancy}/${z.capacity}` : '—'}</td>
                      <td className="font-mono">{z.assignedPersonnel}</td>
                      <td className="font-mono" style={{ color: z.incidents24h >= 4 ? '#ef4444' : z.incidents24h >= 2 ? '#f59e0b' : undefined }}>{z.incidents24h}</td>
                      <td><span className="font-mono text-[10px] font-bold" style={{ color: r.hex }}>{r.label}</span></td>
                      <td className="text-right"><button onClick={() => orderLockdown(z.name).then((x) => flash(x.message))} className="text-app-text-faint hover:text-app-danger" title="Lock zone"><Icon name="lock" className="w-3.5 h-3.5"/></button></td>
                    </tr>);
        })}
              </tbody>
            </table>
          </Panel>
        </div>

        {/* Teams + perimeter */}
        <div className="space-y-4">
          <Panel title={t('sec.responseTitle')} icon={<Icon name="shield" className="w-4 h-4"/>} subtitle={t('sec.responseSub')} bodyClass="p-3 space-y-2.5">
            {teams.map((t_) => {
            const tone = t_.status === 'standby' ? '#10b981' : t_.status === 'responding' ? '#ef4444' : '#f59e0b';
            return (<div key={t_.id} className="rounded-lg border border-app-border p-2.5" style={{ background: 'var(--app-bg-deep)' }}>
                  <div className="flex items-center gap-2">
                    <Dot color={tone} pulse={t_.status !== 'standby'}/>
                    <span className="font-mono text-[12px] font-bold text-app-text">{t_.callsign}</span>
                    <span className="t-label ml-1">{t_.members} {t('common.opr')}</span>
                    <span className="ml-auto font-mono text-[9px] font-bold uppercase" style={{ color: tone }}>{t_.status}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="t-label">{t('common.rdy')}</span>
                    <Meter value={t_.readiness} color={tone} height={5}/>
                    <span className="font-mono text-[10px] font-bold" style={{ color: tone }}>{t_.readiness}%</span>
                  </div>
                  <button onClick={() => toggleTeam(t_.id)} className={`btn mt-2 w-full justify-center ${t_.status === 'standby' ? 'btn-primary' : 'btn-ghost'}`}>
                    {t_.status === 'standby' ? t('sec.deploy') : t('sec.recall')}
                  </button>
                </div>);
        })}
          </Panel>

          <Panel title={t('sec.perimeterPanel')} icon={<Icon name="radio" className="w-4 h-4"/>} bodyClass="p-3">
            <div className="grid grid-cols-2 gap-2">
              {SECTORS.map((s) => {
            const tone = SECTOR_TONE[s.status];
            return (<div key={s.id} className="rounded-md border p-2" style={{ borderColor: `${tone.hex}44`, background: `${tone.hex}0d` }}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-app-text">{s.id}</span>
                      <Dot color={tone.hex} pulse={s.status === 'alert'} size={6}/>
                    </div>
                    <p className="mt-1 text-[9.5px] text-app-text-faint truncate">{s.name}</p>
                    <p className="mt-0.5 font-mono text-[9px] font-bold uppercase" style={{ color: tone.hex }}>{s.status}</p>
                  </div>);
        })}
            </div>
            <div className="mt-3 space-y-0.5">
              <KV k={t('common.sallyPort1')} v={t('common.secured')} color="#10b981"/>
              <KV k={t('common.sallyPort2')} v={`${t('common.staged')} · ${t('common.cobra')}`} color="#f59e0b"/>
              <KV k={t('common.vehicleGate')} v={t('common.secured')} color="#10b981"/>
              <KV k={t('common.droneOverwatch')} v={t('common.activeStatus')} color="#38bdf8"/>
            </div>
          </Panel>
        </div>
      </div>

      <Panel title={t('sec.alertsPanel')} icon={<Icon name="bell" className="w-4 h-4"/>} live bodyClass="p-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 2xl:grid-cols-3">
          {activeAlerts.map((a) => <AlertCard key={a.id} alert={a} now={now} onAck={c.acknowledgeAlert}/>)}
          {activeAlerts.length === 0 && <p className="py-6 text-center text-xs text-app-text-faint">{t('sec.liveEvents')}</p>}
        </div>
      </Panel>

      {toast && (<div className="fixed bottom-9 right-4 z-[400] animate-slide-up rounded-lg border px-4 py-3 text-xs font-semibold shadow-2xl" style={{ background: 'var(--app-panel-2)', borderColor: 'var(--app-accent-border)', color: 'var(--app-accent)' }}>
          <Icon name="check" className="mr-1.5 inline w-3.5 h-3.5"/>{toast}
        </div>)}
    </div>);
}
