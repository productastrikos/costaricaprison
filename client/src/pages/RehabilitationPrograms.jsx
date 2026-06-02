/* ════════════════════════════════════════════════════════════════════
   CACCO — Rehabilitation Programs
   Education · vocational · psychological · reintegration tracks
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { Panel, MetricCard, Chip, PageHeader, KV, Meter, Segmented } from '../components/ui';
import { Icon } from '../components/Icon';
import { fmtNum } from '../utils/format';
import { useT } from '../contexts/LanguageContext';
const CAT_OPTS = [
    { value: 'all', label: 'All' },
    { value: 'Education', label: 'Education' },
    { value: 'Vocational', label: 'Vocational' },
    { value: 'Psychological', label: 'Psych' },
    { value: 'Substance', label: 'Substance' },
    { value: 'Reintegration', label: 'Reintegration' },
];
const CAT_COLOR = {
    Education: '#38bdf8',
    Vocational: '#10b981',
    Psychological: '#8b5cf6',
    Substance: '#f59e0b',
    Reintegration: '#22d3ee',
};
function ProgramCard({ prog, onClick }) {
    const color = CAT_COLOR[prog.category];
    const pct = prog.capacity > 0 ? Math.round((prog.enrolled / prog.capacity) * 100) : 0;
    return (<button onClick={onClick} className="panel p-3.5 text-left transition-all hover:border-app-border-strong">
      <div className="flex items-start justify-between gap-2">
        <span className="chip chip-ghost" style={{ fontSize: 9 }}>
          {prog.category.toUpperCase()}
        </span>
        <span className="font-mono text-[12px] font-extrabold" style={{ color: prog.completionRate >= 70 ? '#10b981' : prog.completionRate >= 50 ? '#f59e0b' : '#ef4444' }}>
          {prog.completionRate}%
        </span>
      </div>
      <h3 className="mt-2 text-[13px] font-bold leading-snug text-app-text">{prog.name}</h3>
      <p className="mt-1 text-[10px] text-app-text-faint">{prog.facilitator}</p>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="t-label">Enrollment</span>
          <span className="font-mono text-[10px] font-bold text-app-text">{prog.enrolled}/{prog.capacity}</span>
        </div>
        <Meter value={prog.enrolled} max={prog.capacity} color={pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : color} height={5}/>
      </div>
      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="t-label">Completion Rate</span>
          <span className="font-mono text-[10px] font-bold text-app-text">{prog.completionRate}%</span>
        </div>
        <Meter value={prog.completionRate} color={prog.completionRate >= 70 ? '#10b981' : prog.completionRate >= 50 ? '#f59e0b' : '#ef4444'} height={5}/>
      </div>
    </button>);
}
export default function RehabilitationPrograms() {
    const c = useCacco();
    const { t } = useT();
    const [cat, setCat] = useState('all');
    const [sel, setSel] = useState(null);
    const totalEnrolled = useMemo(() => c.programs.reduce((s, p) => s + p.enrolled, 0), [c.programs]);
    const totalCapacity = useMemo(() => c.programs.reduce((s, p) => s + p.capacity, 0), [c.programs]);
    const avgCompletion = useMemo(() => {
        if (!c.programs.length)
            return 0;
        return Math.round(c.programs.reduce((s, p) => s + p.completionRate, 0) / c.programs.length);
    }, [c.programs]);
    const participationRate = useMemo(() => {
        if (!c.inmates.length)
            return 0;
        return Math.round((totalEnrolled / c.inmates.length) * 100);
    }, [c.inmates.length, totalEnrolled]);
    /* Category breakdown */
    const catStats = useMemo(() => {
        const cats = ['Education', 'Vocational', 'Psychological', 'Substance', 'Reintegration'];
        return cats.map((cat) => {
            const progs = c.programs.filter((p) => p.category === cat);
            return {
                cat,
                count: progs.length,
                enrolled: progs.reduce((s, p) => s + p.enrolled, 0),
                avgComp: progs.length ? Math.round(progs.reduce((s, p) => s + p.completionRate, 0) / progs.length) : 0,
            };
        });
    }, [c.programs]);
    const filtered = useMemo(() => cat === 'all' ? c.programs : c.programs.filter((p) => p.category === cat), [c.programs, cat]);
    return (<div className="space-y-4">
      <PageHeader code="REHAB" title={t('rehab.title')} subtitle={t('rehab.subtitle')} actions={<>
            <Chip tone="info"><Icon name="users" className="w-3 h-3"/> {fmtNum(totalEnrolled)} {t('rehab.enrolled')}</Chip>
            <Chip tone="success">{avgCompletion}% {t('rehab.avgComp')}</Chip>
          </>}/>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t('rehab.programsActive')} value={c.programs.length} icon={<Icon name="rehab" className="w-4 h-4"/>} tone="#8b5cf6" sub="all categories"/>
        <MetricCard label={t('rehab.totalEnrolled')} value={fmtNum(totalEnrolled)} icon={<Icon name="users" className="w-4 h-4"/>} tone="#38bdf8" sub={`${participationRate}% of population`}/>
        <MetricCard label={t('rehab.avgCompletion')} value={`${avgCompletion}%`} icon={<Icon name="check" className="w-4 h-4"/>} tone="#10b981" sub="across all programs" mono={false}/>
        <MetricCard label={t('rehab.totalCapacity')} value={fmtNum(totalCapacity)} icon={<Icon name="gauge" className="w-4 h-4"/>} tone="#22d3ee" sub={`${Math.round((totalEnrolled / totalCapacity) * 100)}% utilization`}/>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {/* Program grid */}
        <Panel className="xl:col-span-3" title={t('rehab.activePrograms')} icon={<Icon name="rehab" className="w-4 h-4"/>} subtitle={`${filtered.length} programs`} actions={<Segmented options={CAT_OPTS} value={cat} onChange={setCat}/>} bodyClass="p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((prog) => <ProgramCard key={prog.id} prog={prog} onClick={() => setSel(prog)}/>)}
          </div>
          {filtered.length === 0 && (<p className="py-8 text-center text-xs text-app-text-faint">No programs in this category.</p>)}
        </Panel>

        {/* Right column */}
        <div className="space-y-4">
          {/* Category overview */}
          <Panel title={t('rehab.categoryOverview')} icon={<Icon name="dotsGrid" className="w-4 h-4"/>} bodyClass="p-3 space-y-3">
            {catStats.map(({ cat: c2, count, enrolled, avgComp }) => (<div key={c2} className="rounded-md border border-app-border p-2.5" style={{ background: 'var(--app-bg-deep)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-app-text">{c2.toUpperCase()}</span>
                  <span className="t-label">{count} prog{count !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-0">
                  <KV k="Enrolled" v={fmtNum(enrolled)}/>
                  <KV k="Avg Completion" v={`${avgComp}%`} color={avgComp >= 70 ? '#10b981' : '#f59e0b'}/>
                </div>
              </div>))}
          </Panel>

          {/* Ministry compliance */}
          <Panel title={t('rehab.compliance')} icon={<Icon name="reports" className="w-4 h-4"/>} bodyClass="p-3 space-y-0">
            <KV k="Mandatory Psych Hours" v="COMPLIANT" color="#10b981"/>
            <KV k="Education Quota" v="97%" color="#10b981"/>
            <KV k="Substance Counselling" v="COMPLIANT" color="#10b981"/>
            <KV k="Recidivism Tracking" v="ACTIVE" color="#38bdf8"/>
            <KV k="Annual Ministry Report" v="DUE IN 42d" color="#f59e0b"/>
          </Panel>
        </div>
      </div>

      {/* Program list table */}
      <Panel title={t('rehab.programRegister')} icon={<Icon name="reports" className="w-4 h-4"/>} bodyClass="overflow-x-auto">
        <table className="dtable">
          <thead>
            <tr><th>{t('rehab.thId')}</th><th>{t('rehab.thProgram')}</th><th>{t('rehab.thCategory')}</th><th>{t('rehab.thFacilitator')}</th><th>{t('rehab.thEnrolled')}</th><th>{t('rehab.thCapacity')}</th><th>{t('rehab.thUtil')}</th><th>{t('rehab.thCompletion')}</th></tr>
          </thead>
          <tbody>
            {c.programs.map((p) => {
            const util = Math.round((p.enrolled / p.capacity) * 100);
            return (<tr key={p.id} className="cursor-pointer" onClick={() => setSel(p)}>
                  <td className="font-mono text-[10px] text-app-text-faint">{p.id}</td>
                  <td className="font-semibold text-app-text">{p.name}</td>
                  <td><Chip tone="ghost" style={{ color: CAT_COLOR[p.category] }}>{p.category}</Chip></td>
                  <td className="text-[11px] text-app-text-muted">{p.facilitator}</td>
                  <td className="font-mono">{p.enrolled}</td>
                  <td className="font-mono">{p.capacity}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Meter value={util} color={util >= 90 ? '#f59e0b' : '#38bdf8'} height={4}/>
                      <span className="font-mono text-[10px]">{util}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] font-bold" style={{ color: p.completionRate >= 70 ? '#10b981' : p.completionRate >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {p.completionRate}%
                    </span>
                  </td>
                </tr>);
        })}
          </tbody>
        </table>
      </Panel>

      {sel && (<div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(5,11,18,0.78)' }} onClick={() => setSel(null)}>
          <div className="panel w-full max-w-md animate-slide-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--app-border)' }}>
              <div className="min-w-0 flex-1">
                <h2 className="text-[14px] font-extrabold text-app-text">{sel.name}</h2>
                <p className="font-mono text-[10px] text-app-text-faint mt-0.5">{sel.id} · {sel.category}</p>
              </div>
              <button onClick={() => setSel(null)} className="icon-btn"><Icon name="close"/></button>
            </div>
            <div className="p-4 space-y-0">
              <KV k="Category" v={sel.category} color={CAT_COLOR[sel.category]}/>
              <KV k="Facilitator" v={sel.facilitator}/>
              <KV k="Enrolled" v={`${sel.enrolled} / ${sel.capacity}`}/>
              <KV k="Utilization" v={`${Math.round((sel.enrolled / sel.capacity) * 100)}%`}/>
              <KV k="Completion Rate" v={`${sel.completionRate}%`} color={sel.completionRate >= 70 ? '#10b981' : '#f59e0b'}/>
            </div>
          </div>
        </div>)}
    </div>);
}
