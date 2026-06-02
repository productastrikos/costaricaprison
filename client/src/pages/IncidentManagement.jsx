/* ════════════════════════════════════════════════════════════════════
   CACCO — Incident Management
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { useNow } from '../utils/useNow';
import { Panel, MetricCard, Chip, PageHeader, KV, Meter, SectionLabel } from '../components/ui';
import { Icon } from '../components/Icon';
import { THREAT, STAGE } from '../utils/tone';
import { timeAgo } from '../utils/format';
import { useT } from '../contexts/LanguageContext';
const STAGES = ['reported', 'investigating', 'response', 'review', 'closed'];
export default function IncidentManagement() {
    const c = useCacco();
    const now = useNow();
    const { t } = useT();
    const [sel, setSel] = useState(null);
    const [toast, setToast] = useState(null);
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
    return (<div className="space-y-4">
      <PageHeader code="INC" title="Incident Management" subtitle="Case lifecycle · response coordination · after-action review" actions={<button className="btn btn-primary" onClick={() => { setToast('Incident report INC-5216 opened'); setTimeout(() => setToast(null), 3000); }}><Icon name="incident" className="w-3.5 h-3.5"/> NEW REPORT</button>}/>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Open Incidents" value={open} icon={<Icon name="incident" className="w-4 h-4"/>} tone="#f59e0b" sub="not yet closed"/>
        <MetricCard label={t('common.highestSeverity')} value={critical} icon={<Icon name="fire" className="w-4 h-4"/>} tone="#ef4444" sub={t('common.highestSeverity')}/>
        <MetricCard label="In Active Response" value={inResponse} icon={<Icon name="shield" className="w-4 h-4"/>} tone="#f97316" sub="teams engaged"/>
        <MetricCard label="Closed (30d)" value={byStage.closed.length + 28} icon={<Icon name="check" className="w-4 h-4"/>} tone="#10b981" sub="resolved cases"/>
      </div>

      {/* Lifecycle board */}
      <Panel title={t('inc.boardTitle')} icon={<Icon name="route" className="w-4 h-4"/>} subtitle={t('inc.boardSub')} bodyClass="p-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-5">
          {STAGES.map((st) => {
            const m = STAGE[st];
            return (<div key={st} className="rounded-lg border border-app-border" style={{ background: 'var(--app-bg-deep)' }}>
                <div className="flex items-center gap-2 px-2.5 py-2" style={{ borderBottom: '1px solid var(--app-border)' }}>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-app-text-muted">{m.label}</span>
                  <span className="ml-auto font-mono text-[11px] font-bold text-app-text">{byStage[st].length}</span>
                </div>
                <div className="space-y-2 p-2" style={{ minHeight: 80 }}>
                  {byStage[st].map((i) => <IncidentCard key={i.id} inc={i} now={now} onClick={() => setSel(i)}/>)}
                  {byStage[st].length === 0 && <p className="py-3 text-center text-[10px] text-app-text-faint">— empty —</p>}
                </div>
              </div>);
        })}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title={t('inc.logTitle')} icon={<Icon name="reports" className="w-4 h-4"/>} bodyClass="overflow-x-auto">
          <table className="dtable">
            <thead><tr><th>{t('inc.thId')}</th><th>{t('inc.thType')}</th><th>{t('inc.thSev')}</th><th>{t('inc.thZone')}</th><th>{t('inc.thStage')}</th><th>{t('inc.thCmd')}</th><th>{t('inc.thRep')}</th></tr></thead>
            <tbody>
              {c.incidents.map((i) => {
            const t = THREAT[i.severity];
            const s = STAGE[i.stage];
            return (<tr key={i.id} className="cursor-pointer" onClick={() => setSel(i)}>
                    <td className="font-mono text-[10px] text-app-text-faint">{i.id}</td>
                    <td className="font-semibold text-app-text">{i.type}</td>
                    <td><Chip tone={t.chip}>{t.label}</Chip></td>
                    <td className="font-mono text-[10px]">{i.zoneId}</td>
                    <td><Chip tone={s.chip}>{s.label}</Chip></td>
                    <td className="text-[11px]">{i.commander}</td>
                    <td className="font-mono text-[10px] text-app-text-faint">{timeAgo(i.reportedAtMs, now)} ago</td>
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
        </Panel>
      </div>

      {sel && <IncidentModal inc={sel} now={now} resolveName={(id) => c.inmates.find((m) => m.id === id)?.name ?? id} onClose={() => setSel(null)}/>}

      {toast && (<div className="fixed bottom-9 right-4 z-[400] animate-slide-up rounded-lg border px-4 py-3 text-xs font-semibold shadow-2xl" style={{ background: 'var(--app-panel-2)', borderColor: 'var(--app-accent-border)', color: 'var(--app-accent)' }}>
          <Icon name="check" className="mr-1.5 inline w-3.5 h-3.5"/>{toast}
        </div>)}
    </div>);
}
function IncidentCard({ inc, now, onClick }) {
    const t = THREAT[inc.severity];
    return (<button onClick={onClick} className="w-full rounded-md border border-app-border p-2 text-left transition-colors hover:border-app-border-strong" style={{ background: 'var(--app-panel)' }}>
      <div className="flex items-center gap-1.5">
        <span className="dot" style={{ background: t.hex }}/>
        <span className="text-[11px] font-bold text-app-text truncate flex-1">{inc.type}</span>
        <span className="font-mono text-[9px] text-app-text-faint">{timeAgo(inc.reportedAtMs, now)}</span>
      </div>
      <p className="mt-1 font-mono text-[9px] text-app-text-faint">{inc.id} · {inc.zoneId} · {inc.responseTeam}</p>
      {inc.casualties > 0 && <p className="mt-1 text-[9.5px] font-bold text-app-danger">⚠ {inc.casualties} casualties</p>}
    </button>);
}
function IncidentModal({ inc, now, resolveName, onClose }) {
    const t = THREAT[inc.severity];
    const s = STAGE[inc.stage];
    return (<div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(5,11,18,0.78)' }} onClick={onClose}>
      <div className="panel w-full max-w-xl animate-slide-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--app-border)' }}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><h2 className="text-[15px] font-extrabold text-app-text">{inc.type}</h2><Chip tone={t.chip}>{t.label}</Chip><Chip tone={s.chip}>{s.label}</Chip></div>
            <p className="font-mono text-[10px] text-app-text-faint mt-0.5">{inc.id} · {inc.zoneId} · reported {timeAgo(inc.reportedAtMs, now)} ago</p>
          </div>
          <button onClick={onClose} className="icon-btn"><Icon name="close"/></button>
        </div>
        <div className="p-4">
          <SectionLabel className="mb-1.5">Summary</SectionLabel>
          <p className="text-[12px] leading-relaxed text-app-text-muted">{inc.summary}</p>
          <div className="mt-3 grid grid-cols-2 gap-x-4">
            <KV k="Incident Commander" v={inc.commander}/>
            <KV k="Response Team" v={inc.responseTeam}/>
            <KV k="Casualties" v={inc.casualties} color={inc.casualties > 0 ? '#ef4444' : '#10b981'}/>
            <KV k="Stage" v={s.label} color={s.hex}/>
          </div>
          <SectionLabel className="mb-1.5 mt-3">Involved Subjects · {inc.involvedInmates.length}</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {inc.involvedInmates.map((id) => <Chip key={id} tone="ghost" className="font-mono">{id} · {resolveName(id).split(' ')[0]}</Chip>)}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary flex-1 justify-center" onClick={onClose}>ADVANCE STAGE</button>
            <button className="btn btn-ghost flex-1 justify-center" onClick={onClose}>ASSIGN COMMANDER</button>
          </div>
        </div>
      </div>
    </div>);
}
