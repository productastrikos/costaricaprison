/* ════════════════════════════════════════════════════════════════════
   CACCO — Staff Operations
   Personnel roster · shift management · zone deployment
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { Panel, MetricCard, Chip, PageHeader, KV, Meter, Dot, Segmented, ActionModal } from '../components/ui';
import { Icon } from '../components/Icon';
import { fmtNum } from '../utils/format';
import { useT } from '../contexts/LanguageContext';
const STATUS_COLOR = {
    'on-duty': '#10b981',
    'responding': '#ef4444',
    'break': '#38bdf8',
    'off-duty': '#526278',
    'leave': '#8b5cf6',
};
const STATUS_CHIP = {
    'on-duty': 'success',
    'responding': 'danger',
    'break': 'info',
    'off-duty': 'ghost',
    'leave': 'violet',
};
const CLEARANCE_COLOR = ['', '#526278', '#38bdf8', '#f59e0b', '#f97316', '#ef4444'];
export default function StaffOperations() {
    const c = useCacco();
    const { t } = useT();
    const SHIFT_OPTS = [
        { value: 'all', label: t('staff.shiftAll') },
        { value: 'Alpha', label: 'Alpha' },
        { value: 'Bravo', label: 'Bravo' },
        { value: 'Charlie', label: 'Charlie' },
    ];
    const [shift, setShift] = useState('all');
    const [q, setQ] = useState('');
    const [selected, setSelected] = useState(null);
    const [deployStaffModal, setDeployStaffModal] = useState(null);
    const [addPersonnelModal, setAddPersonnelModal] = useState(false);
    const [toast, setToast] = useState(null);
    const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };
    const onDuty = useMemo(() => c.staff.filter((s) => s.status === 'on-duty' || s.status === 'responding').length, [c.staff]);
    const responding = useMemo(() => c.staff.filter((s) => s.status === 'responding').length, [c.staff]);
    const offDuty = useMemo(() => c.staff.filter((s) => s.status === 'off-duty' || s.status === 'leave').length, [c.staff]);
    const shiftCounts = useMemo(() => {
        const shifts = ['Alpha', 'Bravo', 'Charlie'];
        return shifts.map((sh) => {
            const group = c.staff.filter((s) => s.shift === sh);
            return { sh, total: group.length, onDuty: group.filter((s) => s.status === 'on-duty' || s.status === 'responding').length };
        });
    }, [c.staff]);
    const roleDist = useMemo(() => {
        const map = new Map();
        c.staff.forEach((s) => map.set(s.role, (map.get(s.role) ?? 0) + 1));
        return [...map.entries()].sort((a, b) => b[1] - a[1]);
    }, [c.staff]);
    const maxRole = roleDist[0]?.[1] ?? 1;
    const zoneDeploy = useMemo(() => {
        const map = new Map();
        c.staff.filter((s) => s.zoneId).forEach((s) => map.set(s.zoneId, (map.get(s.zoneId) ?? 0) + 1));
        return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    }, [c.staff]);
    const filtered = useMemo(() => c.staff.filter((s) => {
        if (shift !== 'all' && s.shift !== shift) return false;
        if (q) {
            const str = q.toLowerCase();
            if (!s.name.toLowerCase().includes(str) && !s.badge.toLowerCase().includes(str) && !s.role.toLowerCase().includes(str)) return false;
        }
        return true;
    }), [c.staff, shift, q]);
    return (<div className="space-y-4">

      {addPersonnelModal && (
        <ActionModal
          title={t('staff.addModalTitle')}
          subtitle={t('staff.addModalSubtitle')}
          fields={[
            { id: 'name', label: t('staff.nameLabel'), type: 'text', required: true, placeholder: t('staff.namePh') },
            { id: 'badge', label: t('staff.badgeLabel'), type: 'text', required: true, placeholder: t('staff.badgePh') },
            { id: 'role', label: t('staff.roleLabel'), type: 'select', required: true, options: [
              { value: 'Corrections Officer', label: t('staff.roleCorrections') },
              { value: 'Tactical Officer', label: t('staff.roleTactical') },
              { value: 'Medical Staff', label: t('staff.roleMedical') },
              { value: 'Intelligence Analyst', label: t('staff.roleAnalyst') },
              { value: 'Supervisor', label: t('staff.roleSupervisor') },
            ]},
            { id: 'shift', label: t('staff.shiftLabel'), type: 'select', required: true, options: [
              { value: 'Alpha', label: 'Alpha' },
              { value: 'Bravo', label: 'Bravo' },
              { value: 'Charlie', label: 'Charlie' },
            ]},
            { id: 'zone', label: t('staff.zoneLabel'), type: 'select', options: c.zones.map(z => ({ value: z.id, label: z.name })) },
            { id: 'clearance', label: t('staff.clearanceLabel'), type: 'select', required: true, options: [
              { value: '1', label: t('staff.clearance1') },
              { value: '2', label: t('staff.clearance2') },
              { value: '3', label: t('staff.clearance3') },
              { value: '4', label: t('staff.clearance4') },
              { value: '5', label: t('staff.clearance5') },
            ]},
          ]}
          confirmLabel={t('staff.confirmAddStaff')}
          confirmTone="primary"
          onConfirm={(vals) => { flash(`${vals.name} — ${t('staff.shiftLabel')}: ${vals.shift}`); }}
          onClose={() => setAddPersonnelModal(false)}
        />
      )}

      {deployStaffModal && (
        <ActionModal
          title={`${t('staff.reassignTitle')} — ${deployStaffModal.name}`}
          subtitle={`${t('staff.badgeLabel')}: ${deployStaffModal.badge} · ${t('staff.roleLabel')}: ${deployStaffModal.role}`}
          fields={[
            { id: 'zone', label: t('staff.newZoneLabel'), type: 'select', required: true, options: c.zones.map(z => ({ value: z.id, label: z.name })) },
            { id: 'mission', label: t('staff.missionLabel'), type: 'select', required: true, options: [
              { value: 'patrol', label: t('staff.missionPatrol') },
              { value: 'response', label: t('staff.missionResponse') },
              { value: 'escort', label: t('staff.missionEscort') },
              { value: 'guard', label: t('staff.missionGuard') },
            ]},
            { id: 'duration', label: t('staff.durationLabel'), type: 'select', options: [
              { value: '1h', label: t('staff.dur1h') },
              { value: '4h', label: t('staff.dur4h') },
              { value: 'shift', label: t('staff.durShift') },
            ]},
            { id: 'notes', label: t('staff.instrLabel'), type: 'textarea', placeholder: t('staff.instrPh') },
          ]}
          confirmLabel={t('staff.confirmReassign')}
          confirmTone="primary"
          onConfirm={(vals) => { flash(`${deployStaffModal.name} → ${t('common.zone')}: ${vals.zone}`); setSelected(null); }}
          onClose={() => setDeployStaffModal(null)}
        />
      )}

      {toast && (<div className="fixed bottom-9 right-4 z-[400] animate-slide-up rounded-lg border px-4 py-3 text-xs font-semibold shadow-2xl" style={{ background: 'var(--app-panel-2)', borderColor: 'var(--app-accent-border)', color: 'var(--app-accent)' }}>
          <Icon name="check" className="mr-1.5 inline w-3.5 h-3.5"/>{toast}
        </div>)}

      <PageHeader code="STAFF" title={t('staff.title')} subtitle={t('staff.subtitle')} actions={<>
        <Chip tone="success"><Dot color="#10b981" pulse/>{onDuty} {t('staff.onDuty')}</Chip>
        <button className="btn btn-primary" onClick={() => setAddPersonnelModal(true)}><Icon name="users" className="w-3.5 h-3.5"/> {t('common.addPersonnel')}</button>
      </>}/>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t('staff.totalPersonnel')} value={fmtNum(c.staff.length)} icon={<Icon name="staff" className="w-4 h-4"/>} tone="#38bdf8" sub={t('staff.subAll')}/>
        <MetricCard label={t('staff.onDuty')} value={onDuty} icon={<Icon name="shield" className="w-4 h-4"/>} tone="#10b981" sub={`${Math.round((onDuty / c.staff.length) * 100)}% ${t('staff.subForce')}`}/>
        <MetricCard label={t('staff.inResponse')} value={responding} icon={<Icon name="alert" className="w-4 h-4"/>} tone="#ef4444" sub={t('staff.subIncident')}/>
        <MetricCard label={t('staff.offDuty')} value={offDuty} icon={<Icon name="users" className="w-4 h-4"/>} tone="#526278" sub={t('staff.subUnavail')}/>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Roster panel */}
        <Panel className="xl:col-span-2" title={t('staff.roster')} icon={<Icon name="users" className="w-4 h-4"/>} subtitle={`${fmtNum(filtered.length)} ${t('intel.rosterOf')} ${fmtNum(c.staff.length)} ${t('common.personnel').toLowerCase()}`} actions={<div className="header-search" style={{ padding: '5px 9px' }}>
              <Icon name="search" className="w-3.5 h-3.5 text-app-text-faint"/>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('staff.searchStaff')} style={{ width: 170 }}/>
            </div>} bodyClass="flex flex-col min-h-0">
          <div className="flex shrink-0 items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--app-border)' }}>
            <Segmented options={SHIFT_OPTS} value={shift} onChange={setShift}/>
          </div>
          {/* Grid fills the remaining panel height; the inner scroll area is
              absolutely positioned so the 150-row table fills the gap and
              scrolls internally without ever inflating the panel itself. */}
          <div className="relative flex-1" style={{ minHeight: 400 }}>
            <div className="absolute inset-0 overflow-auto">
              <table className="dtable">
              <thead>
                <tr><th>{t('staff.thBadge')}</th><th>{t('staff.thName')}</th><th>{t('staff.thRole')}</th><th>{t('staff.thShift')}</th><th>{t('staff.thStatus')}</th><th>{t('staff.thZone')}</th><th>{t('staff.thClearance')}</th></tr>
              </thead>
              <tbody>
                {filtered.map((s) => (<tr key={s.id} className="cursor-pointer" onClick={() => setSelected(s)}>
                    <td className="font-mono text-[10px] text-app-text-faint">{s.badge}</td>
                    <td className="font-semibold text-app-text">{s.name}</td>
                    <td className="text-[11px] text-app-text-muted">{s.role}</td>
                    <td><Chip tone={s.shift === 'Alpha' ? 'info' : s.shift === 'Bravo' ? 'success' : 'warning'}>{s.shift}</Chip></td>
                    <td><Chip tone={STATUS_CHIP[s.status]} dot>{s.status.replace('-', ' ').toUpperCase()}</Chip></td>
                    <td className="font-mono text-[10px]">{s.zoneId ?? '—'}</td>
                    <td><span className="font-mono text-[11px] font-bold" style={{ color: CLEARANCE_COLOR[s.clearance] }}>L{s.clearance}</span></td>
                  </tr>))}
              </tbody>
            </table>
            </div>
          </div>
        </Panel>

        {/* Right column */}
        <div className="space-y-4">
          {/* Shift readiness */}
          <Panel title={t('staff.shiftReadiness')} icon={<Icon name="gauge" className="w-4 h-4"/>} bodyClass="p-3 space-y-3">
            {shiftCounts.map(({ sh, total, onDuty: od }) => (<div key={sh}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-[12px] font-bold text-app-text">{t('staff.shiftPrefix')} {sh.toUpperCase()}</span>
                  <span className="font-mono text-[11px] text-app-text-faint">{od}/{total}</span>
                </div>
                <Meter value={od} max={total} color={od / total >= 0.7 ? '#10b981' : od / total >= 0.4 ? '#f59e0b' : '#ef4444'} height={6}/>
                <p className="mt-1 text-[9px] text-app-text-faint">{Math.round((od / total) * 100)}{t('staff.activeDeployPct')}</p>
              </div>))}
          </Panel>

          {/* Role distribution */}
          <Panel title={t('staff.roleDist')} icon={<Icon name="dotsGrid" className="w-4 h-4"/>} bodyClass="p-3 space-y-2">
            {roleDist.map(([role, n]) => (<div key={role}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="min-w-0 truncate text-[10px] text-app-text-muted">{role}</span>
                  <span className="shrink-0 font-mono text-[11px] font-bold text-app-text">{n}</span>
                </div>
                <Meter value={n} max={maxRole} color="#38bdf8" height={4}/>
              </div>))}
          </Panel>

          {/* Zone deployment */}
          <Panel title={t('staff.zoneDeploy')} icon={<Icon name="twin" className="w-4 h-4"/>} bodyClass="p-3 space-y-0">
            {zoneDeploy.map(([zoneId, count]) => (<KV key={zoneId} k={c.zones.find((z) => z.id === zoneId)?.name ?? zoneId} v={`${count} ${t('staff.officersLabel')}`} color="#38bdf8"/>))}
          </Panel>
        </div>
      </div>

      {/* Staff detail modal */}
      {selected && (<div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(5,11,18,0.78)' }} onClick={() => setSelected(null)}>
          <div className="panel w-full max-w-md animate-slide-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--app-border)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg font-mono text-sm font-bold" style={{ background: 'var(--app-accent-bg)', color: 'var(--app-accent)', border: '1px solid var(--app-accent-border)' }}>
                {selected.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-extrabold text-app-text">{selected.name}</h2>
                <p className="font-mono text-[10px] text-app-text-faint">{selected.badge} · {selected.role}</p>
              </div>
              <button onClick={() => setSelected(null)} className="icon-btn"><Icon name="close"/></button>
            </div>
            <div className="p-4 space-y-0">
              <KV k={t('staff.kvStatus')} v={selected.status.replace('-', ' ').toUpperCase()} color={STATUS_COLOR[selected.status]}/>
              <KV k={t('staff.kvShift')} v={selected.shift}/>
              <KV k={t('staff.kvZone')} v={selected.zoneId ? (c.zones.find((z) => z.id === selected.zoneId)?.name ?? selected.zoneId) : t('staff.notAssigned')}/>
              <KV k={t('staff.kvClearance')} v={`${t('staff.clearancePrefix')} ${selected.clearance}`} color={CLEARANCE_COLOR[selected.clearance]}/>
              <KV k={t('staff.kvYearsService')} v={selected.yearsService}/>
              <div className="mt-4 flex gap-2">
                <button className="btn btn-primary flex-1 justify-center" onClick={() => { setDeployStaffModal(selected); }}>
                  {t('staff.btnReassign')}
                </button>
                <button className="btn btn-ghost flex-1 justify-center" onClick={() => setSelected(null)}>
                  {t('staff.btnClose')}
                </button>
              </div>
            </div>
          </div>
        </div>)}
    </div>);
}
