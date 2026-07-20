/* ════════════════════════════════════════════════════════════════════
   CACCO — Incident Management
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { useNow } from '../utils/useNow';
import { Panel, MetricCard, Chip, PageHeader, KV, Meter, SectionLabel, ActionModal } from '../components/ui';
import { Icon } from '../components/Icon';
import { THREAT, STAGE } from '../utils/tone';
import { timeAgo } from '../utils/format';
import { useT } from '../contexts/LanguageContext';
const STAGES = ['reported', 'investigating', 'response', 'review', 'closed'];
const SEVERITY_ORDER = ['critical', 'high', 'moderate', 'low'];
export default function IncidentManagement() {
    const c = useCacco();
    const now = useNow();
    const { t } = useT();
    const [sel, setSel] = useState(null);
    const [toast, setToast] = useState(null);
    const [newReportModal, setNewReportModal] = useState(false);
    const byStage = useMemo(() => {
        const m = { reported: [], investigating: [], response: [], review: [], closed: [] };
        c.incidents.forEach((i) => m[i.stage].push(i));
        return m;
    }, [c.incidents]);
    const open = c.incidents.filter((i) => i.stage !== 'closed').length;
    const critical = c.incidents.filter((i) => i.severity === 'critical').length;
    const inResponse = byStage.response.length;
    const typeDist = useMemo(() => {
        const map = new Map();
        c.incidents.forEach((i) => map.set(i.type, (map.get(i.type) ?? 0) + 1));
        return [...map.entries()].sort((a, b) => b[1] - a[1]);
    }, [c.incidents]);
    const maxType = typeDist[0]?.[1] ?? 1;
    const totalCasualties = useMemo(() => c.incidents.reduce((s, i) => s + i.casualties, 0), [c.incidents]);
    const oldestOpenMs = useMemo(() => {
        const openCases = c.incidents.filter((i) => i.stage !== 'closed');
        return openCases.length ? Math.min(...openCases.map((i) => i.reportedAtMs)) : null;
    }, [c.incidents]);
    const severityDist = useMemo(() => {
        const map = new Map();
        c.incidents.forEach((i) => map.set(i.severity, (map.get(i.severity) ?? 0) + 1));
        return SEVERITY_ORDER.filter((s) => map.has(s)).map((s) => [s, map.get(s)]);
    }, [c.incidents]);
    const maxSeverity = Math.max(...severityDist.map(([, n]) => n), 1);
    return (<div className="space-y-4">

      {newReportModal && (
        <ActionModal
          title={`${t('inc.title')} — ${t('inc.newTitle')}`}
          subtitle={t('inc.newSubtitle')}
          fields={[
            { id: 'type', label: t('inc.typeLabel'), type: 'select', required: true, options: [
              { value: 'Altercation', label: t('inc.typeAltercation') },
              { value: 'Contraband', label: t('inc.typeContraband') },
              { value: 'Medical Emergency', label: t('inc.typeMedical') },
              { value: 'Security Breach', label: t('inc.typeBreach') },
              { value: 'Escape Attempt', label: t('inc.typeEscape') },
              { value: 'Disturbance', label: t('inc.typeDisturbance') },
              { value: 'Other', label: t('inc.typeOther') },
            ]},
            { id: 'zone', label: t('inc.thZone'), type: 'select', required: true, options: c.zones.map(z => ({ value: z.id, label: z.name })) },
            { id: 'severity', label: t('inc.thSev'), type: 'select', required: true, options: [
              { value: 'critical', label: t('inc.sevCritical') },
              { value: 'high', label: t('inc.sevHigh') },
              { value: 'medium', label: t('inc.sevMedium') },
              { value: 'low', label: t('inc.sevLow') },
            ]},
            { id: 'commander', label: t('inc.thCmd'), type: 'text', placeholder: t('inc.cmdPh'), required: true },
            { id: 'team', label: t('inc.teamLabel'), type: 'select', options: c.teams.map(tm => ({ value: tm.callsign, label: tm.callsign })) },
            { id: 'summary', label: t('inc.descLabel'), type: 'textarea', required: true, placeholder: t('inc.descPh') },
          ]}
          confirmLabel={t('inc.confirmLog')}
          confirmTone="primary"
          onConfirm={(vals) => { setToast(`${t('inc.typeLabel')}: ${vals.type} — ${t('common.zone')}: ${vals.zone}`); setTimeout(() => setToast(null), 3500); }}
          onClose={() => setNewReportModal(false)}
        />
      )}

      <PageHeader code="INC" title={t('inc.title')} subtitle={t('inc.subtitle')} actions={<button className="btn btn-primary" onClick={() => setNewReportModal(true)}><Icon name="incident" className="w-3.5 h-3.5"/> {t('common.logIncident')}</button>}/>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t('inc.metricOpen')} value={open} icon={<Icon name="incident" className="w-4 h-4"/>} tone="#f59e0b" sub={t('inc.subNotYetClosed')}/>
        <MetricCard label={t('common.highestSeverity')} value={critical} icon={<Icon name="fire" className="w-4 h-4"/>} tone="#ef4444" sub={t('common.highestSeverity')}/>
        <MetricCard label={t('inc.metricInResponse')} value={inResponse} icon={<Icon name="shield" className="w-4 h-4"/>} tone="#f97316" sub={t('inc.subTeamsEngaged')}/>
        <MetricCard label={t('inc.metricClosed')} value={byStage.closed.length + 28} icon={<Icon name="check" className="w-4 h-4"/>} tone="#10b981" sub={t('inc.subResolvedCases')}/>
      </div>

      {/* Lifecycle board */}
      <Panel title={t('inc.boardTitle')} icon={<Icon name="route" className="w-4 h-4"/>} subtitle={t('inc.boardSub')} bodyClass="p-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-5">
          {STAGES.map((st) => {
            const m = STAGE[st];
            return (<div key={st} className="rounded-lg border border-app-border" style={{ background: 'var(--app-bg-deep)' }}>
                <div className="flex items-center gap-2 px-2.5 py-2" style={{ borderBottom: '1px solid var(--app-border)' }}>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-app-text-muted">{t('tone.stage.' + st)}</span>
                  <span className="ml-auto font-mono text-[11px] font-bold text-app-text">{byStage[st].length}</span>
                </div>
                <div className="space-y-2 p-2" style={{ minHeight: 80 }}>
                  {byStage[st].map((i) => <IncidentCard key={i.id} inc={i} now={now} onClick={() => setSel(i)}/>)}
                  {byStage[st].length === 0 && <p className="py-3 text-center text-[10px] text-app-text-faint">{t('inc.emptyKanban')}</p>}
                </div>
              </div>);
        })}
          <div className="col-span-full rounded-lg border border-app-border" style={{ background: 'var(--app-bg-deep)' }}>
            <div className="flex items-center gap-2 px-2.5 py-2" style={{ borderBottom: '1px solid var(--app-border)' }}>
              <Icon name="gauge" className="w-3.5 h-3.5 text-app-accent"/>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-app-text-muted">{t('inc.summaryTitle')}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
              <SummaryStat label={t('inc.totalCases')} value={c.incidents.length}/>
              <SummaryStat label={t('inc.criticalCases')} value={critical} color={critical > 0 ? '#ef4444' : '#10b981'}/>
              <SummaryStat label={t('inc.casualtiesReported')} value={totalCasualties} color={totalCasualties > 0 ? '#ef4444' : '#10b981'}/>
              <SummaryStat label={t('inc.oldestOpen')} value={oldestOpenMs ? `${timeAgo(oldestOpenMs, now)} ago` : '—'}/>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title={t('inc.logTitle')} icon={<Icon name="reports" className="w-4 h-4"/>} bodyClass="overflow-x-auto">
          <table className="dtable">
            <thead><tr><th>{t('inc.thId')}</th><th>{t('inc.thType')}</th><th>{t('inc.thSev')}</th><th>{t('inc.thZone')}</th><th>{t('inc.thStage')}</th><th>{t('inc.thCmd')}</th><th>{t('inc.thRep')}</th></tr></thead>
            <tbody>
              {c.incidents.map((i) => {
            const thr = THREAT[i.severity];
            const s = STAGE[i.stage];
            return (<tr key={i.id} className="cursor-pointer" onClick={() => setSel(i)}>
                    <td className="font-mono text-[10px] text-app-text-faint">{i.id}</td>
                    <td className="font-semibold text-app-text">{i.type}</td>
                    <td><Chip tone={thr.chip}>{t('tone.threat.' + i.severity)}</Chip></td>
                    <td className="font-mono text-[10px]">{i.zoneId}</td>
                    <td><Chip tone={s.chip}>{t('tone.stage.' + i.stage)}</Chip></td>
                    <td className="text-[11px]">{i.commander}</td>
                    <td className="font-mono text-[10px] text-app-text-faint">{timeAgo(i.reportedAtMs, now)} {t('inc.modalAgo')}</td>
                  </tr>);
        })}
            </tbody>
          </table>
        </Panel>

        <Panel title={t('inc.distTitle')} icon={<Icon name="dotsGrid" className="w-4 h-4"/>} bodyClass="p-3 space-y-2.5">
          {typeDist.map(([type, n]) => (<div key={type}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] text-app-text-muted">{type}</span>
                <span className="font-mono text-[11px] font-bold text-app-text">{n}</span>
              </div>
              <Meter value={n} max={maxType} color="#38bdf8" height={5}/>
            </div>))}
          <div className="!mt-4 pt-3" style={{ borderTop: '1px solid var(--app-border-soft)' }}>
            <SectionLabel className="mb-2">{t('inc.bySeverity')}</SectionLabel>
            <div className="space-y-2.5">
              {severityDist.map(([sev, n]) => {
            const th = THREAT[sev];
            return (<div key={sev}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] text-app-text-muted">{th.label}</span>
                      <span className="font-mono text-[11px] font-bold text-app-text">{n}</span>
                    </div>
                    <Meter value={n} max={maxSeverity} color={th.hex} height={5}/>
                  </div>);
        })}
            </div>
          </div>
        </Panel>
      </div>

      {sel && <IncidentModal inc={sel} now={now} resolveName={(id) => c.inmates.find((m) => m.id === id)?.name ?? id} onClose={() => setSel(null)}/>}

      {toast && (<div className="fixed bottom-9 right-4 z-[400] animate-slide-up rounded-lg border px-4 py-3 text-xs font-semibold shadow-2xl" style={{ background: 'var(--app-panel-2)', borderColor: 'var(--app-accent-border)', color: 'var(--app-accent)' }}>
          <Icon name="check" className="mr-1.5 inline w-3.5 h-3.5"/>{toast}
        </div>)}
    </div>);
}
function SummaryStat({ label, value, color }) {
    return (<div className="rounded-md border border-app-border p-2.5" style={{ background: 'var(--app-panel)' }}>
      <p className="t-label">{label}</p>
      <p className="mt-1 font-mono text-[15px] font-bold" style={{ color: color ?? 'var(--app-text)' }}>{value}</p>
    </div>);
}
function IncidentCard({ inc, now, onClick }) {
    const { t } = useT();
    const thr = THREAT[inc.severity];
    return (<button onClick={onClick} className="w-full rounded-md border border-app-border p-2 text-left transition-colors hover:border-app-border-strong" style={{ background: 'var(--app-panel)' }}>
      <div className="flex items-center gap-1.5">
        <span className="dot" style={{ background: thr.hex }}/>
        <span className="text-[11px] font-bold text-app-text truncate flex-1">{inc.type}</span>
        <span className="font-mono text-[9px] text-app-text-faint">{timeAgo(inc.reportedAtMs, now)}</span>
      </div>
      <p className="mt-1 font-mono text-[9px] text-app-text-faint">{inc.id} · {inc.zoneId} · {inc.responseTeam}</p>
      {inc.casualties > 0 && <p className="mt-1 text-[9.5px] font-bold text-app-danger">⚠ {inc.casualties} {t('inc.modalCasualtyWarn')}</p>}
    </button>);
}
function IncidentModal({ inc, now, resolveName, onClose }) {
    const { t } = useT();
    const thr = THREAT[inc.severity];
    const s = STAGE[inc.stage];
    const [advanceModal, setAdvanceModal] = useState(false);
    const [assignModal, setAssignModal] = useState(false);
    const STAGE_ORDER = ['reported', 'investigating', 'response', 'review', 'closed'];
    const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(inc.stage) + 1] ?? 'closed';
    return (<div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(5,11,18,0.78)' }} onClick={onClose}>
      {advanceModal && (
        <ActionModal
          title={t('inc.advanceTitle')}
          subtitle={`${inc.id} — ${inc.type}`}
          fields={[
            { id: 'nextStage', label: t('inc.advanceNewStage'), type: 'select', required: true, defaultValue: nextStage, options: STAGE_ORDER.map(st => ({ value: st, label: t('tone.stage.' + st) })) },
            { id: 'notes', label: t('inc.advanceNotesLabel'), type: 'textarea', required: true, placeholder: t('inc.advanceNotesPh') },
            { id: 'officer', label: t('inc.advanceOfficerLabel'), type: 'text', placeholder: t('inc.advanceOfficerPh') },
          ]}
          confirmLabel={t('inc.advanceConfirm')}
          confirmTone="primary"
          onConfirm={() => { onClose(); }}
          onClose={() => setAdvanceModal(false)}
        />
      )}
      {assignModal && (
        <ActionModal
          title={t('inc.assignTitle')}
          subtitle={`${t('inc.title')} ${inc.id} — ${inc.type}`}
          fields={[
            { id: 'commander', label: t('inc.assignCmdLabel'), type: 'text', required: true, placeholder: t('inc.assignCmdPh') },
            { id: 'team', label: t('inc.assignTeamLabel'), type: 'text', placeholder: t('inc.assignTeamPh') },
            { id: 'priority', label: t('inc.assignPriorityLabel'), type: 'select', options: [
              { value: 'immediate', label: t('inc.assignImmediate') },
              { value: 'urgent', label: t('inc.assignUrgent') },
              { value: 'normal', label: t('inc.assignNormal') },
            ]},
            { id: 'notes', label: t('inc.assignInstructLabel'), type: 'textarea', placeholder: t('inc.assignInstructPh') },
          ]}
          confirmLabel={t('inc.assignConfirm')}
          confirmTone="primary"
          onConfirm={() => { onClose(); }}
          onClose={() => setAssignModal(false)}
        />
      )}
      <div className="panel w-full max-w-xl animate-slide-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--app-border)' }}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><h2 className="text-[15px] font-extrabold text-app-text">{inc.type}</h2><Chip tone={thr.chip}>{t('tone.threat.' + inc.severity)}</Chip><Chip tone={s.chip}>{t('tone.stage.' + inc.stage)}</Chip></div>
            <p className="font-mono text-[10px] text-app-text-faint mt-0.5">{inc.id} · {inc.zoneId} · {t('inc.modalRegistered')} {timeAgo(inc.reportedAtMs, now)}</p>
          </div>
          <button onClick={onClose} className="icon-btn"><Icon name="close"/></button>
        </div>
        <div className="p-4">
          <SectionLabel className="mb-1.5">{t('inc.modalSummary')}</SectionLabel>
          <p className="text-[12px] leading-relaxed text-app-text-muted">{inc.summary}</p>
          <div className="mt-3 grid grid-cols-2 gap-x-4">
            <KV k={t('inc.modalCmdr')} v={inc.commander}/>
            <KV k={t('inc.modalTeam')} v={inc.responseTeam}/>
            <KV k={t('inc.modalCasualties')} v={inc.casualties} color={inc.casualties > 0 ? '#ef4444' : '#10b981'}/>
            <KV k={t('inc.modalStage')} v={t('tone.stage.' + inc.stage)} color={s.hex}/>
          </div>
          <SectionLabel className="mb-1.5 mt-3">{t('inc.modalSubjects')} · {inc.involvedInmates.length}</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {inc.involvedInmates.map((id) => <Chip key={id} tone="ghost" className="font-mono">{id} · {resolveName(id).split(' ')[0]}</Chip>)}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary flex-1 justify-center" onClick={() => setAdvanceModal(true)}>{t('inc.btnAdvance')}</button>
            <button className="btn btn-ghost flex-1 justify-center" onClick={() => setAssignModal(true)}>{t('inc.btnAssign')}</button>
          </div>
        </div>
      </div>
    </div>);
}
