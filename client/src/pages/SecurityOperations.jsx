/* ════════════════════════════════════════════════════════════════════
   CACCO — Security Operations
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { useNow } from '../utils/useNow';
import { Panel, MetricCard, Chip, Meter, PageHeader, KV, Dot, ActionModal } from '../components/ui';
import { AlertCard } from '../components/cards';
import { Icon } from '../components/Icon';
import { SEC_LEVEL, OPSTATUS, RISK } from '../utils/tone';
import { useT } from '../contexts/LanguageContext';
import { orderLockdown, dispatchTeam } from '../services/api';

const SECTORS_DATA = [
    { id: 'N-7', nameKey: 'sec.sectorN7', status: 'alert' },
    { id: 'N-8', nameKey: 'sec.sectorN8', status: 'secure' },
    { id: 'E-1', nameKey: 'sec.sectorE1', status: 'secure' },
    { id: 'E-2', nameKey: 'sec.sectorE2', status: 'secure' },
    { id: 'S-4', nameKey: 'sec.sectorS4', status: 'watch' },
    { id: 'S-5', nameKey: 'sec.sectorS5', status: 'secure' },
    { id: 'W-3', nameKey: 'sec.sectorW3', status: 'secure' },
    { id: 'W-6', nameKey: 'sec.sectorW6', status: 'secure' },
];
const SECTOR_TONE = {
    secure: { hex: '#10b981', chip: 'success' },
    watch: { hex: '#f59e0b', chip: 'warning' },
    alert: { hex: '#ef4444', chip: 'danger' },
};
export default function SecurityOperations() {
    const c = useCacco();
    const now = useNow();
    const { t } = useT();
    const [teams, setTeams] = useState(c.teams);
    const [toast, setToast] = useState(null);
    const [lockdownModal, setLockdownModal] = useState(null);
    const [deployModal, setDeployModal] = useState(null);
    const [sectorModal, setSectorModal] = useState(null);
    const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };
    const activeAlerts = useMemo(() => c.alerts.filter((a) => a.status === 'active' || a.status === 'dispatched'), [c.alerts]);
    const matrixZones = useMemo(() => c.zones.filter((z) => z.kind !== 'recreation' && z.kind !== 'intake'), [c.zones]);
    const deployed = teams.filter((tm) => tm.status === 'deployed' || tm.status === 'responding').length;
    const sec = SEC_LEVEL[c.facility.securityLevel];

    const SECTORS = useMemo(() => SECTORS_DATA.map(s => ({ ...s, name: t(s.nameKey) })), [t]);

    const toggleTeam = (id) => {
        setTeams((p) => p.map((tm) => {
            if (tm.id !== id) return tm;
            const next = tm.status === 'standby' ? 'deployed' : 'standby';
            dispatchTeam(tm.callsign, next === 'deployed' ? t('sec.teamToast') : t('sec.teamStandbyToast')).then((r) => flash(r.message));
            return { ...tm, status: next };
        }));
    };

    const postureDescs = {
        1: t('sec.postureDesc1'),
        2: t('sec.postureDesc2'),
        3: t('sec.postureDesc3'),
        4: t('sec.postureDesc4'),
    };

    return (<div className="space-y-4">

      {/* Lockdown Modal */}
      {lockdownModal !== null && (
        <ActionModal
          title={t('sec.initLockdown')}
          subtitle={lockdownModal || t('sec.lockdownSelectZone')}
          fields={[
            { id: 'zone', label: t('sec.lockdownZoneLabel'), type: 'select', required: true, options: c.zones.map(z => ({ value: z.name, label: z.name })) },
            { id: 'type', label: t('sec.lockdownTypeLabel'), type: 'select', required: true, options: [
              { value: 'full', label: t('sec.lockdownFull') },
              { value: 'partial', label: t('sec.lockdownPartial') },
              { value: 'preventive', label: t('sec.lockdownPreventive') },
            ]},
            { id: 'duration', label: t('sec.lockdownDuration'), type: 'select', options: [
              { value: '30m', label: t('sec.lockdownOpt30m') },
              { value: '1h', label: t('sec.lockdownOpt1h') },
              { value: '4h', label: t('sec.lockdownOpt4h') },
              { value: 'indefinite', label: t('sec.lockdownOptIndefinite') },
            ]},
            { id: 'reason', label: t('sec.lockdownReasonLabel'), type: 'textarea', required: true, placeholder: t('sec.lockdownReasonPh') },
          ]}
          confirmLabel={t('sec.initLockdown')}
          confirmTone="danger"
          onConfirm={(vals) => { orderLockdown(vals.zone || lockdownModal).then((r) => flash(r.message)); }}
          onClose={() => setLockdownModal(null)}
        />
      )}

      {/* Deploy/Recall Modal */}
      {deployModal && (
        <ActionModal
          title={deployModal.status === 'standby' ? t('sec.deploy') : t('sec.recall')}
          subtitle={`${t('sec.responseTitle')} ${deployModal.callsign} · ${deployModal.members} ${t('sec.teamOperators')}`}
          fields={deployModal.status === 'standby' ? [
            { id: 'zone', label: t('sec.deployZoneLabel'), type: 'select', required: true, options: c.zones.map(z => ({ value: z.name, label: z.name })) },
            { id: 'mission', label: t('sec.deployMissionLabel'), type: 'select', required: true, options: [
              { value: 'patrol', label: t('sec.missionPatrol') },
              { value: 'response', label: t('sec.missionResponse') },
              { value: 'lockdown', label: t('sec.missionLockdown') },
              { value: 'escort', label: t('sec.missionEscort') },
            ]},
            { id: 'notes', label: t('sec.deployNotesLabel'), type: 'textarea', placeholder: t('sec.deployNotesPh') },
          ] : [
            { id: 'reason', label: t('sec.recallReasonLabel'), type: 'select', options: [
              { value: 'mission_complete', label: t('sec.recallMissionComplete') },
              { value: 'relief', label: t('sec.recallRelief') },
              { value: 'reassigned', label: t('sec.recallReassigned') },
            ]},
            { id: 'notes', label: t('sec.recallNotesLabel'), type: 'textarea', placeholder: t('sec.recallNotesPh') },
          ]}
          confirmLabel={deployModal.status === 'standby' ? t('sec.deploy') : t('sec.recall')}
          confirmTone={deployModal.status === 'standby' ? 'primary' : 'ghost'}
          onConfirm={() => { toggleTeam(deployModal.id); }}
          onClose={() => setDeployModal(null)}
        />
      )}

      {/* Sector detail modal */}
      {sectorModal && (
        <ActionModal
          title={`${t('sec.sectorModalTitle')} — ${sectorModal.name}`}
          subtitle={`ID: ${sectorModal.id} · ${t('common.status')}: ${t(`sec.sectorStatus${sectorModal.status.charAt(0).toUpperCase() + sectorModal.status.slice(1)}`)}`}
          fields={[
            { id: 'action', label: t('sec.sectorActionLabel'), type: 'select', required: true, options: [
              { value: 'patrol', label: t('sec.sectorActionPatrol') },
              { value: 'inspect', label: t('sec.sectorActionInspect') },
              { value: 'lockdown', label: t('sec.sectorActionLockdown') },
              { value: 'report', label: t('sec.sectorActionReport') },
            ]},
            { id: 'notes', label: t('sec.sectorNotesLabel'), type: 'textarea', placeholder: t('sec.sectorNotesPh') },
          ]}
          confirmLabel={t('sec.sectorExecute')}
          confirmTone={sectorModal.status === 'alert' ? 'danger' : 'primary'}
          onConfirm={(vals) => { flash(`${t('sec.sectorExecute')}: "${vals.action}" — ${sectorModal.id}`); }}
          onClose={() => setSectorModal(null)}
        />
      )}

      <PageHeader code="SEC-OPS" title={t('sec.title')} subtitle={t('sec.subtitle')} actions={<>
            <span className="seclevel"><Dot color="var(--app-text-faint)" size={5}/> {t('tone.secCode.l' + c.facility.securityLevel)} · {t('tone.secLabel.l' + c.facility.securityLevel)}</span>
            <button className="btn btn-danger" onClick={() => setLockdownModal('Cell Block B')}><Icon name="lock" className="w-3.5 h-3.5"/> {t('sec.initLockdown')}</button>
          </>}/>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t('sec.activeAlerts')} value={activeAlerts.length} icon={<Icon name="bell" className="w-4 h-4"/>} tone="#ef4444" sub={t('sec.subLiveEvents')}/>
        <MetricCard label={t('sec.deployed')} value={`${deployed}/${teams.length}`} icon={<Icon name="shield" className="w-4 h-4"/>} tone="#f59e0b" sub={t('sec.subResponseReadiness')}/>
        <MetricCard label={t('sec.lockdownZones')} value={c.facility.lockdownZones} icon={<Icon name="lock" className="w-4 h-4"/>} tone="#ef4444" sub={t('sec.subMovementHalted')}/>
        <MetricCard label={t('sec.perimeter')} value={`${SECTORS.filter((s) => s.status === 'secure').length}/${SECTORS.length}`} icon={<Icon name="radio" className="w-4 h-4"/>} tone="#10b981" sub={t('sec.subSecureTotal')}/>
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
                      <span className="font-mono text-[10px] font-bold text-app-text">{t('tone.secCode.l' + lvl)}</span>
                      {active && <span className="font-mono text-[8px] font-bold tracking-widest text-app-accent">{t('sec.activeLabel')}</span>}
                    </div>
                    <p className="mt-1.5 text-[12px] font-bold text-app-text">{t('tone.secLabel.l' + lvl)}</p>
                    <p className="mt-1 text-[9.5px] leading-snug text-app-text-faint line-clamp-3">{postureDescs[lvl]}</p>
                  </button>);
        })}
            </div>
          </Panel>

          <Panel title={t('sec.zoneMatrix')} icon={<Icon name="dotsGrid" className="w-4 h-4"/>} bodyClass="overflow-x-auto">
            <table className="dtable">
              <thead><tr><th>{t('common.zone')}</th><th>{t('common.status')}</th><th>{t('common.occupancy')}</th><th>{t('common.personnel')}</th><th>{t('common.incidents')} 24h</th><th>{t('common.risk')}</th><th></th></tr></thead>
              <tbody>
                {matrixZones.map((z) => {
            const os = OPSTATUS[z.status];
            const r = RISK[z.risk];
            return (<tr key={z.id}>
                      <td className="font-semibold text-app-text">{z.name}</td>
                      <td><Chip tone={os.chip} dot>{t('tone.op.' + z.status)}</Chip></td>
                      <td className="font-mono">{z.capacity > 0 ? `${z.occupancy}/${z.capacity}` : '—'}</td>
                      <td className="font-mono">{z.assignedPersonnel}</td>
                      <td className="font-mono" style={{ color: z.incidents24h >= 4 ? '#ef4444' : z.incidents24h >= 2 ? '#f59e0b' : undefined }}>{z.incidents24h}</td>
                      <td><span className="font-mono text-[10px] font-bold" style={{ color: r.hex }}>{t('tone.risk.' + z.risk)}</span></td>
                      <td className="text-right"><button onClick={() => setLockdownModal(z.name)} className="text-app-text-faint hover:text-app-danger" title={t('common.lockZone')}><Icon name="lock" className="w-3.5 h-3.5"/></button></td>
                    </tr>);
        })}
              </tbody>
            </table>
          </Panel>
        </div>

        {/* Teams + perimeter */}
        <div className="space-y-4">
          <Panel title={t('sec.responseTitle')} icon={<Icon name="shield" className="w-4 h-4"/>} subtitle={t('sec.responseSub')} bodyClass="p-3 space-y-2.5">
            {teams.map((tm) => {
            const tone = tm.status === 'standby' ? '#10b981' : tm.status === 'responding' ? '#ef4444' : '#f59e0b';
            return (<div key={tm.id} className="rounded-lg border border-app-border p-2.5" style={{ background: 'var(--app-bg-deep)' }}>
                  <div className="flex items-center gap-2">
                    <Dot color={tone} pulse={tm.status !== 'standby'}/>
                    <span className="font-mono text-[12px] font-bold text-app-text">{tm.callsign}</span>
                    <span className="t-label ml-1">{tm.members} {t('common.opr')}</span>
                    <span className="ml-auto font-mono text-[9px] font-bold uppercase" style={{ color: tone }}>{t(`sec.teamStatus.${tm.status}`) || tm.status.toUpperCase()}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="t-label">{t('common.rdy')}</span>
                    <Meter value={tm.readiness} color={tone} height={5}/>
                    <span className="font-mono text-[10px] font-bold" style={{ color: tone }}>{tm.readiness}%</span>
                  </div>
                  <button onClick={() => setDeployModal(tm)} className={`btn mt-2 w-full justify-center ${tm.status === 'standby' ? 'btn-primary' : 'btn-ghost'}`}>
                    {tm.status === 'standby' ? t('sec.deploy') : t('sec.recall')}
                  </button>
                </div>);
        })}
          </Panel>

          <Panel title={t('sec.perimeterPanel')} icon={<Icon name="radio" className="w-4 h-4"/>} bodyClass="p-3">
            <div className="grid grid-cols-2 gap-2">
              {SECTORS.map((s) => {
            const tone = SECTOR_TONE[s.status];
            return (<button key={s.id} onClick={() => setSectorModal(s)} className="rounded-md border p-2 text-left w-full transition-all hover:opacity-90" style={{ borderColor: `${tone.hex}44`, background: `${tone.hex}0d` }}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-app-text">{s.id}</span>
                      <Dot color={tone.hex} pulse={s.status === 'alert'} size={6}/>
                    </div>
                    <p className="mt-1 text-[9.5px] text-app-text-faint truncate">{s.name}</p>
                    <p className="mt-0.5 font-mono text-[9px] font-bold uppercase" style={{ color: tone.hex }}>{t(`sec.sectorStatus${s.status.charAt(0).toUpperCase() + s.status.slice(1)}`)}</p>
                  </button>);
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
