/* ════════════════════════════════════════════════════════════════════
   CACCO — System Administration
   Access control · service health · integrations · audit
   ════════════════════════════════════════════════════════════════════ */
import React, { useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { Panel, MetricCard, Chip, PageHeader, KV, Meter, Dot, Ring } from '../components/ui';
import { Icon } from '../components/Icon';
import { useT } from '../contexts/LanguageContext';
const SERVICES = [
    { id: 'svc-db', name: 'Operational Database', status: 'online', latencyMs: 4, uptime: 99.97, category: 'Core' },
    { id: 'svc-auth', name: 'Authentication Service', status: 'online', latencyMs: 6, uptime: 99.99, category: 'Core' },
    { id: 'svc-cctv', name: 'Video Management System', status: 'online', latencyMs: 12, uptime: 99.81, category: 'Surveillance' },
    { id: 'svc-ai', name: 'AI Inference Engine', status: 'online', latencyMs: 18, uptime: 99.94, category: 'Intelligence' },
    { id: 'svc-comms', name: 'Radio / Comms Gateway', status: 'online', latencyMs: 9, uptime: 99.88, category: 'Comms' },
    { id: 'svc-access', name: 'Door Access Control', status: 'online', latencyMs: 3, uptime: 100, category: 'Security' },
    { id: 'svc-perimeter', name: 'Perimeter Sensor Array', status: 'online', latencyMs: 7, uptime: 99.92, category: 'Security' },
    { id: 'svc-backup', name: 'Encrypted Backup', status: 'online', latencyMs: 42, uptime: 99.76, category: 'Core' },
    { id: 'svc-mjsp', name: 'MJSP Data Link', status: 'degraded', latencyMs: 187, uptime: 97.4, category: 'Integration' },
    { id: 'svc-oij', name: 'OIJ Intelligence Feed', status: 'online', latencyMs: 88, uptime: 98.6, category: 'Integration' },
    { id: 'svc-medical', name: 'Medical Records System', status: 'online', latencyMs: 14, uptime: 99.5, category: 'Medical' },
    { id: 'svc-alert', name: 'Alert Stream Broker', status: 'online', latencyMs: 2, uptime: 100, category: 'Core' },
];
const USERS = [
    { id: 'usr-001', name: 'Dir. Eduardo Vargas', role: 'Director', clearance: 5, lastLogin: '10:14 today', mfaEnabled: true, status: 'active' },
    { id: 'usr-002', name: 'Cmdr. Isabel González', role: 'Commander', clearance: 4, lastLogin: '09:58 today', mfaEnabled: true, status: 'active' },
    { id: 'usr-003', name: 'Analyst Luis Mora', role: 'Intelligence Analyst', clearance: 4, lastLogin: '11:02 today', mfaEnabled: true, status: 'active' },
    { id: 'usr-004', name: 'Sgt. Carmen Solís', role: 'Security Officer', clearance: 3, lastLogin: '13:44 today', mfaEnabled: true, status: 'active' },
    { id: 'usr-005', name: 'Nurse Ana Castro', role: 'Medical', clearance: 2, lastLogin: '08:30 today', mfaEnabled: false, status: 'active' },
    { id: 'usr-006', name: 'Tech. Marco Alvarado', role: 'Maintenance', clearance: 2, lastLogin: '3 days ago', mfaEnabled: false, status: 'inactive' },
    { id: 'usr-007', name: 'Sgt. Pablo Rojas', role: 'Security Officer', clearance: 3, lastLogin: '14:01 today', mfaEnabled: true, status: 'active' },
    { id: 'usr-008', name: 'SYSTEM', role: 'Automated Agent', clearance: 5, lastLogin: 'Continuous', mfaEnabled: true, status: 'active' },
];
const SVC_COLOR = { online: '#10b981', degraded: '#f59e0b', offline: '#ef4444' };
const USR_CHIP = { active: 'success', inactive: 'ghost', locked: 'danger' };
const CLEARANCE_COLOR = ['', '#526278', '#38bdf8', '#f59e0b', '#f97316', '#ef4444'];
export default function SystemAdmin() {
    const c = useCacco();
    const [toast, setToast] = useState(null);
    const online = SERVICES.filter((s) => s.status === 'online').length;
    const degraded = SERVICES.filter((s) => s.status === 'degraded').length;
    const avgLatency = Math.round(SERVICES.reduce((s, x) => s + x.latencyMs, 0) / SERVICES.length);
    const avgUptime = (SERVICES.reduce((s, x) => s + x.uptime, 0) / SERVICES.length).toFixed(2);
    const activeSessions = USERS.filter((u) => u.status === 'active').length;
    const noMfa = USERS.filter((u) => !u.mfaEnabled && u.status === 'active').length;
    const act = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };
    const { t } = useT();
    return (<div className="space-y-4">
      <PageHeader code="ADMIN" title={t('admin.title')} subtitle={t('admin.subtitle')} actions={<>
            {degraded > 0 && <Chip tone="warning" dot>{degraded} DEGRADED</Chip>}
            <Chip tone="success"><Dot color="#10b981" pulse/>{online}/{SERVICES.length} ONLINE</Chip>
          </>}/>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t('admin.servicesOnline')} value={`${online}/${SERVICES.length}`} icon={<Icon name="activity" className="w-4 h-4"/>} tone="#10b981" sub={`${avgUptime}% avg uptime`} mono={false}/>
        <MetricCard label={t('admin.avgLatency')} value={`${avgLatency}ms`} icon={<Icon name="gauge" className="w-4 h-4"/>} tone="#38bdf8" sub="response time" mono={false}/>
        <MetricCard label={t('admin.sessions')} value={activeSessions} icon={<Icon name="users" className="w-4 h-4"/>} tone="#8b5cf6" sub="authenticated users"/>
        <MetricCard label={t('admin.mfaAlert')} value={noMfa} icon={<Icon name="alert" className="w-4 h-4"/>} tone={noMfa > 0 ? '#f59e0b' : '#10b981'} sub="users without 2FA"/>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Service health */}
        <Panel className="xl:col-span-2" title="Service Health Monitor" icon={<Icon name="activity" className="w-4 h-4"/>} subtitle="Real-time service availability and latency" live bodyClass="overflow-x-auto">
          <table className="dtable">
            <thead><tr><th>{t('admin.thService')}</th><th>{t('admin.thCategory')}</th><th>{t('admin.thStatus')}</th><th>{t('admin.thLatency')}</th><th>{t('admin.thUptime')}</th><th>Health</th></tr></thead>
            <tbody>
              {SERVICES.map((s) => (<tr key={s.id}>
                  <td className="font-semibold text-app-text">{s.name}</td>
                  <td className="text-[11px] text-app-text-muted">{s.category}</td>
                  <td>
                    <Chip tone={s.status === 'online' ? 'success' : s.status === 'degraded' ? 'warning' : 'danger'} dot>
                      {s.status.toUpperCase()}
                    </Chip>
                  </td>
                  <td className="font-mono" style={{ color: s.latencyMs > 100 ? '#f59e0b' : '#10b981' }}>{s.latencyMs}ms</td>
                  <td className="font-mono" style={{ color: s.uptime >= 99.9 ? '#10b981' : s.uptime >= 99 ? '#f59e0b' : '#ef4444' }}>{s.uptime}%</td>
                  <td style={{ width: 80 }}>
                    <Meter value={s.uptime} max={100} color={SVC_COLOR[s.status]} height={4}/>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </Panel>

        {/* System health ring */}
        <div className="space-y-4">
          <Panel title="System Health" icon={<Icon name="gauge" className="w-4 h-4"/>} bodyClass="p-4 flex flex-col items-center gap-4">
            <Ring value={c.systemHealth.uptimePct} size={120} stroke={10} color="#10b981" label={`${c.systemHealth.uptimePct}%`} sub="UPTIME"/>
            <div className="w-full space-y-0">
              <KV k="Services Online" v={`${c.systemHealth.servicesOnline}/${c.systemHealth.servicesTotal}`} color="#10b981"/>
              <KV k="API Latency" v={`${c.systemHealth.latencyMs}ms`} color={c.systemHealth.latencyMs < 50 ? '#10b981' : '#f59e0b'}/>
              <KV k="System Status" v={c.systemHealth.status.toUpperCase()} color={c.systemHealth.status === 'normal' ? '#10b981' : '#f59e0b'}/>
              <KV k="Last Backup" v="06:00 today" color="#10b981"/>
              <KV k="Disk Usage" v="64%" color="#38bdf8"/>
              <KV k="Encryption" v="AES-256 / TLS 1.3" color="#38bdf8"/>
            </div>
          </Panel>

          <Panel title="Security Config" icon={<Icon name="shield" className="w-4 h-4"/>} bodyClass="p-3 space-y-0">
            <KV k="MFA Policy" v={noMfa === 0 ? 'ENFORCED' : 'PARTIAL'} color={noMfa === 0 ? '#10b981' : '#f59e0b'}/>
            <KV k="Session Timeout" v="30 min"/>
            <KV k="Failed Login Lockout" v="3 attempts"/>
            <KV k="Audit Logging" v="ENABLED" color="#10b981"/>
            <KV k="Data Classification" v="RESTRICTED" color="#ef4444"/>
            <KV k="Last Pentest" v="42 days ago" color="#38bdf8"/>
          </Panel>
        </div>
      </div>

      {/* User access control */}
      <Panel title={t('admin.accessTitle')} icon={<Icon name="users" className="w-4 h-4"/>} subtitle="Authenticated accounts and clearance levels" actions={<button className="btn btn-primary" onClick={() => act('User creation wizard opened')}><Icon name="users" className="w-3.5 h-3.5"/> ADD USER</button>} bodyClass="overflow-x-auto">
        <table className="dtable">
          <thead><tr><th>{t('admin.thId')}</th><th>{t('admin.thUser')}</th><th>{t('admin.thRole')}</th><th>{t('admin.thClearance')}</th><th>{t('admin.thLastLogin')}</th><th>{t('admin.thMFA')}</th><th>{t('admin.thStatus')}</th><th></th></tr></thead>
          <tbody>
            {USERS.map((u) => (<tr key={u.id}>
                <td className="font-mono text-[10px] text-app-text-faint">{u.id}</td>
                <td className="font-semibold text-app-text">{u.name}</td>
                <td className="text-[11px] text-app-text-muted">{u.role}</td>
                <td><span className="font-mono text-[11px] font-bold" style={{ color: CLEARANCE_COLOR[u.clearance] }}>L{u.clearance}</span></td>
                <td className="font-mono text-[10px] text-app-text-faint">{u.lastLogin}</td>
                <td>
                  {u.mfaEnabled
                ? <Chip tone="success">ENABLED</Chip>
                : <Chip tone="warning">DISABLED</Chip>}
                </td>
                <td><Chip tone={USR_CHIP[u.status]} dot>{u.status.toUpperCase()}</Chip></td>
                <td>
                  <div className="flex items-center gap-1">
                    <button className="icon-btn" title="Edit" onClick={() => act(`Editing user ${u.name}`)}><Icon name="admin" className="w-3.5 h-3.5"/></button>
                    {u.status === 'active' && u.id !== 'usr-001' && (<button className="icon-btn" title="Lock account" onClick={() => act(`Account ${u.id} locked`)}><Icon name="lock" className="w-3.5 h-3.5"/></button>)}
                  </div>
                </td>
              </tr>))}
          </tbody>
        </table>
      </Panel>

      {/* Maintenance actions */}
      <Panel title="Maintenance & Actions" icon={<Icon name="admin" className="w-4 h-4"/>} bodyClass="p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { label: 'Rotate Access Codes', tone: 'btn-primary' },
            { label: 'Flush AI Cache', tone: 'btn-ghost' },
            { label: 'Export Audit Log', tone: 'btn-ghost' },
            { label: 'Sync MJSP Link', tone: 'btn-ghost' },
            { label: 'System Diagnostic', tone: 'btn-ghost' },
            { label: 'Emergency Shutdown', tone: 'btn-danger' },
        ].map(({ label, tone }) => (<button key={label} className={`btn ${tone} justify-center`} onClick={() => act(`${label} initiated`)}>
              {label}
            </button>))}
        </div>
      </Panel>

      {toast && (<div className="fixed bottom-9 right-4 z-[400] animate-slide-up rounded-lg border px-4 py-3 text-xs font-semibold shadow-2xl" style={{ background: 'var(--app-panel-2)', borderColor: 'var(--app-accent-border)', color: 'var(--app-accent)' }}>
          <Icon name="check" className="mr-1.5 inline w-3.5 h-3.5"/>{toast}
        </div>)}
    </div>);
}
