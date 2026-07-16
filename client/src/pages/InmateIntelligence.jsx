/* ════════════════════════════════════════════════════════════════════
   CACCO — Inmate Intelligence
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { Panel, MetricCard, Chip, Meter, PageHeader, KV, Segmented, SectionLabel, ActionModal } from '../components/ui';
import { Icon } from '../components/Icon';
import { RISK } from '../utils/tone';
import { fmtNum } from '../utils/format';
import { useT } from '../contexts/LanguageContext';
const threatColor = (s) => (s >= 80 ? '#ef4444' : s >= 60 ? '#f59e0b' : s >= 40 ? '#38bdf8' : '#10b981');
export default function InmateIntelligence() {
    const c = useCacco();
    const { t } = useT();
    const RISK_OPTS = [
        { value: 'all', label: t('intel.filterAll') },
        { value: 'extreme', label: t('intel.filterExtreme') },
        { value: 'high', label: t('intel.filterHigh') },
        { value: 'medium', label: t('intel.filterMed') },
        { value: 'low', label: t('intel.filterLow') },
    ];
    const [q, setQ] = useState('');
    const [risk, setRisk] = useState('all');
    const [crime, setCrime] = useState('all');
    const [subject, setSubject] = useState(null);
    const crimeCounts = useMemo(() => {
        const map = new Map();
        c.inmates.forEach((m) => map.set(m.crimeCategory, (map.get(m.crimeCategory) ?? 0) + 1));
        return [...map.entries()].sort((a, b) => b[1] - a[1]);
    }, [c.inmates]);
    const riskCounts = useMemo(() => {
        const order = ['extreme', 'high', 'medium', 'low'];
        return order.map((r) => ({ r, n: c.inmates.filter((m) => m.risk === r).length }));
    }, [c.inmates]);
    const violentOffenders = useMemo(() => c.inmates.filter((m) => ['Homicide', 'Assault', 'Armed Robbery', 'Sexual Violence', 'Kidnapping', 'Organized Crime'].includes(m.crimeCategory)).length, [c.inmates]);
    const avgThreat = useMemo(() => Math.round(c.inmates.reduce((s, m) => s + m.threatScore, 0) / c.inmates.length), [c.inmates]);
    const watchlist = useMemo(() => [...c.inmates].sort((a, b) => b.threatScore - a.threatScore).slice(0, 8), [c.inmates]);
    const filtered = useMemo(() => c.inmates.filter((m) => {
        if (risk !== 'all' && m.risk !== risk) return false;
        if (crime !== 'all' && m.crimeCategory !== crime) return false;
        if (q) {
            const s = q.toLowerCase();
            if (!m.name.toLowerCase().includes(s) && !m.id.toLowerCase().includes(s)) return false;
        }
        return true;
    }), [c.inmates, risk, crime, q]);
    const maxCrime = crimeCounts[0]?.[1] ?? 1;
    return (<div className="space-y-4">
      <PageHeader code="INTEL" title={t('intel.title')} subtitle={t('intel.subtitle')} actions={<Chip tone="violet"><Icon name="cpu" className="w-3 h-3"/> {t('common.active')} AI</Chip>}/>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t('intel.metricTotalPop')} value={fmtNum(c.inmates.length)} icon={<Icon name="users" className="w-4 h-4"/>} tone="#38bdf8" sub={t('intel.subActiveCustody')}/>
        <MetricCard label={t('common.highRiskInmates')} value={fmtNum(riskCounts[0].n + riskCounts[1].n)} icon={<Icon name="alert" className="w-4 h-4"/>} tone="#ef4444" sub={t('common.riskGreaterThanHigh')}/>
        <MetricCard label={t('intel.metricViolent')} value={fmtNum(violentOffenders)} icon={<Icon name="fire" className="w-4 h-4"/>} tone="#f59e0b" sub={`${Math.round((violentOffenders / c.inmates.length) * 100)}% ${t('intel.riskPctPop')}`}/>
        <MetricCard label={t('intel.metricAvgThreat')} value={avgThreat} icon={<Icon name="gauge" className="w-4 h-4"/>} tone="#8b5cf6" sub={t('intel.sub0To100')}/>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Roster */}
        <Panel className="xl:col-span-2" title={t('intel.rosterTitle')} icon={<Icon name="dotsGrid" className="w-4 h-4"/>} subtitle={`${fmtNum(filtered.length)} ${t('intel.rosterOf')} ${fmtNum(c.inmates.length)} ${t('intel.rosterSubjects')}`} actions={<div className="header-search" style={{ padding: '5px 9px' }}>
              <Icon name="search" className="w-3.5 h-3.5 text-app-text-faint"/>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('intel.searchIdName')} style={{ width: 130 }}/>
            </div>} bodyClass="flex flex-col min-h-0">
          <div className="flex flex-wrap items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--app-border)' }}>
            <Segmented options={RISK_OPTS} value={risk} onChange={setRisk}/>
            <select value={crime} onChange={(e) => setCrime(e.target.value)} className="rounded-md border border-app-border bg-app-bg-deep px-2 py-1.5 text-[11px] text-app-text" style={{ background: 'var(--app-bg-deep)' }}>
              <option value="all">{t('intel.filterAllCrimes')}</option>
              {crimeCounts.map(([a]) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="overflow-auto" style={{ maxHeight: 560 }}>
            <table className="dtable">
              <thead><tr><th>{t('intel.thId')}</th><th>{t('intel.thName')}</th><th>{t('intel.thCrime')}</th><th>{t('intel.thCustody')}</th><th>{t('intel.thZone')}</th><th>{t('intel.thRisk')}</th><th>{t('intel.thThreat')}</th></tr></thead>
              <tbody>
                {filtered.slice(0, 60).map((m) => {
            const r = RISK[m.risk];
            return (<tr key={m.id} className="cursor-pointer" onClick={() => setSubject(m)}>
                      <td className="font-mono text-[10px] text-app-text-faint">{m.id}</td>
                      <td className="font-semibold text-app-text">{m.name}<span className="ml-1.5 text-app-text-faint font-normal">· {m.age}</span></td>
                      <td className="text-[11px]">{m.crimeCategory}</td>
                      <td className="text-[11px] text-app-text-faint">{m.custodyLevel}</td>
                      <td className="font-mono text-[10px]">{m.zoneId}</td>
                      <td><span className="font-mono text-[10px] font-bold" style={{ color: r.hex }}>{t('tone.risk.' + m.risk)}</span></td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold" style={{ color: threatColor(m.threatScore) }}>{m.threatScore}</span>
                          <div className="w-10"><Meter value={m.threatScore} color={threatColor(m.threatScore)} height={4}/></div>
                        </div>
                      </td>
                    </tr>);
        })}
              </tbody>
            </table>
            {filtered.length > 60 && <p className="py-2 text-center text-[10px] text-app-text-faint">+ {fmtNum(filtered.length - 60)} {t('intel.moreResults')}</p>}
          </div>
        </Panel>

        {/* Analytics */}
        <div className="space-y-4">
          <Panel title={t('intel.watchlist')} icon={<Icon name="crosshair" className="w-4 h-4"/>} bodyClass="p-3 space-y-1.5">
            {watchlist.map((m, i) => (<button key={m.id} onClick={() => setSubject(m)} className="flex w-full items-center gap-2.5 rounded-md border border-app-border p-2 text-left transition-colors hover:border-app-border-strong" style={{ background: 'var(--app-bg-deep)' }}>
                <span className="font-mono text-[10px] font-bold text-app-text-faint w-4">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-app-text">{m.name}</p>
                  <p className="truncate text-[9.5px] text-app-text-faint">{m.id} · {m.crimeCategory} · {m.zoneId}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[14px] font-extrabold" style={{ color: threatColor(m.threatScore) }}>{m.threatScore}</p>
                  <p className="t-label">{t('intel.threatLabel')}</p>
                </div>
              </button>))}
          </Panel>

          <Panel title={t('intel.crimeDistrib')} icon={<Icon name="intel" className="w-4 h-4"/>} bodyClass="p-3 space-y-2">
            {crimeCounts.map(([a, n]) => (<div key={a}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] text-app-text-muted">{a}</span>
                  <span className="font-mono text-[11px] font-bold text-app-text">{n}</span>
                </div>
                <Meter value={n} max={maxCrime} color={'#38bdf8'} height={5}/>
              </div>))}
          </Panel>

          <Panel title={t('intel.riskStrat')} icon={<Icon name="gauge" className="w-4 h-4"/>} bodyClass="p-3 grid grid-cols-2 gap-2">
            {riskCounts.map(({ r, n }) => {
            const m = RISK[r];
            return (<div key={r} className="rounded-md border border-app-border p-2.5" style={{ background: 'var(--app-bg-deep)' }}>
                  <p className="font-mono text-[20px] font-extrabold text-white">{n}</p>
                  <p className="t-label mt-0.5">{t('tone.risk.' + r)}</p>
                  <p className="text-[9px] text-app-text-faint">{Math.round((n / c.inmates.length) * 100)}{t('intel.riskPctPop')}</p>
                </div>);
        })}
          </Panel>
        </div>
      </div>

      {subject && <ProfileModal subject={subject} all={c.inmates} onClose={() => setSubject(null)} onSelect={setSubject}/>}
    </div>);
}
/* ─── Subject profile + association graph ───────────────────────────── */
function ProfileModal({ subject, all, onClose, onSelect }) {
    const { t } = useT();
    const r = RISK[subject.risk];
    const associates = subject.associates.map((id) => all.find((m) => m.id === id)).filter(Boolean).slice(0, 6);
    const [flagModal, setFlagModal] = useState(false);
    const [transferModal, setTransferModal] = useState(false);
    return (<div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(5,11,18,0.78)' }} onClick={onClose}>
      {flagModal && (
        <ActionModal
          title={`${t('common.flagInmate')} — ${subject.name}`}
          subtitle={`${subject.id} · ${subject.crimeCategory} · ${t('common.risk')}: ${t('tone.risk.' + subject.risk)}`}
          fields={[
            { id: 'flagType', label: t('intel.flagTypeLabel'), type: 'select', required: true, options: [
              { value: 'escape_risk', label: t('intel.flagEscape') },
              { value: 'gang_affiliation', label: t('intel.flagGang') },
              { value: 'contraband', label: t('intel.flagContraband') },
              { value: 'violence_risk', label: t('intel.flagViolence') },
              { value: 'informant', label: t('intel.flagInformant') },
              { value: 'protective_custody', label: t('intel.flagProtective') },
            ]},
            { id: 'priority', label: t('intel.flagPriorityLabel'), type: 'select', required: true, options: [
              { value: 'critical', label: t('intel.priorityCritical') },
              { value: 'high', label: t('intel.priorityHigh') },
              { value: 'medium', label: t('intel.priorityMedium') },
            ]},
            { id: 'notes', label: t('intel.flagJustLabel'), type: 'textarea', required: true, placeholder: t('intel.flagJustPh') },
          ]}
          confirmLabel={t('common.flagInmate')}
          confirmTone="danger"
          onConfirm={() => { onClose(); }}
          onClose={() => setFlagModal(false)}
        />
      )}
      {transferModal && (
        <ActionModal
          title={`${t('intel.transferTitle')} — ${subject.name}`}
          subtitle={`${subject.id} · ${t('intel.transferCurrentZone')}: ${subject.zoneId} · ${t('intel.transferCurrentCell')}: ${subject.cell}`}
          fields={[
            { id: 'destination', label: t('intel.transferDestLabel'), type: 'select', required: true, options: [
              { value: 'MAX', label: t('intel.transferDestMAX') },
              { value: 'BLK-A', label: t('intel.transferDestBLKA') },
              { value: 'BLK-B', label: t('intel.transferDestBLKB') },
              { value: 'BLK-C', label: t('intel.transferDestBLKC') },
              { value: 'MED', label: t('intel.transferDestMED') },
              { value: 'ISO', label: t('intel.transferDestISO') },
            ]},
            { id: 'reason', label: t('intel.transferReasonLabel'), type: 'select', required: true, options: [
              { value: 'security', label: t('intel.transferSecurity') },
              { value: 'medical', label: t('intel.transferMedical') },
              { value: 'behavioral', label: t('intel.transferBehavioral') },
              { value: 'protection', label: t('intel.transferProtection') },
              { value: 'court', label: t('intel.transferCourt') },
            ]},
            { id: 'notes', label: t('intel.transferNotesLabel'), type: 'textarea', placeholder: t('intel.transferNotesPh') },
          ]}
          confirmLabel={t('intel.transferConfirm')}
          confirmTone="primary"
          onConfirm={() => { onClose(); }}
          onClose={() => setTransferModal(false)}
        />
      )}
      <div className="panel w-full max-w-3xl animate-slide-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--app-border)' }}>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg font-mono text-sm font-bold" style={{ background: 'var(--app-accent-bg)', color: 'var(--app-accent)', border: '1px solid var(--app-accent-border)' }}>{subject.name.charAt(0)}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><h2 className="text-[15px] font-extrabold text-app-text truncate">{subject.name}</h2><Chip tone={r.chip}>{r.label}</Chip></div>
            <p className="font-mono text-[10px] text-app-text-faint">{subject.id} · {subject.nationality} · {t('intel.kvAge')} {subject.age} · {subject.crimeCategory}</p>
          </div>
          <button onClick={onClose} className="icon-btn"><Icon name="close"/></button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
          <div>
            <SectionLabel className="mb-2">{t('intel.profileDossier')}</SectionLabel>
            <div className="space-y-0">
              <KV k={t('intel.kvCustodyLevel')} v={subject.custodyLevel}/>
              <KV k={t('intel.kvThreatScore')} v={subject.threatScore} color={threatColor(subject.threatScore)}/>
              <KV k={t('intel.kvHousing')} v={`${subject.zoneId} · ${subject.cell}`}/>
              <KV k={t('intel.kvStatus')} v={<span className="capitalize">{subject.status}</span>}/>
              <KV k={t('intel.kvSentence')} v={`${subject.sentenceYears} ${t('intel.kvYears')}`}/>
              <KV k={t('intel.kvTimeServed')} v={`${(subject.admittedDaysAgo / 365).toFixed(1)} ${t('intel.kvYears')}`}/>
              <KV k={t('intel.kvLastIncident')} v={subject.lastIncidentDaysAgo == null ? t('intel.kvNoRecord') : `${t('intel.kvDaysAgo').replace('days ago', '')}${subject.lastIncidentDaysAgo} ${t('intel.kvDaysAgo')}`} color={subject.lastIncidentDaysAgo != null && subject.lastIncidentDaysAgo < 14 ? '#ef4444' : undefined}/>
            </div>
            <SectionLabel className="mb-2 mt-3">{t('intel.intFlags')}</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {subject.flags.length ? subject.flags.map((f) => <Chip key={f} tone="warning">{f}</Chip>) : <span className="text-[11px] text-app-text-faint">{t('intel.noFlags')}</span>}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-danger flex-1 justify-center text-[11px]" onClick={() => setFlagModal(true)}>{t('common.flagInmate')}</button>
              <button className="btn btn-ghost flex-1 justify-center text-[11px]" onClick={() => setTransferModal(true)}>{t('intel.btnTransfer')}</button>
            </div>
          </div>

          <div>
            <SectionLabel className="mb-2">{t('intel.associates')} · {associates.length} {t('intel.knownLabel')}</SectionLabel>
            <div className="rounded-lg border border-app-border" style={{ background: 'var(--app-bg-deep)' }}>
              <AssocGraph subject={subject} associates={associates}/>
            </div>
            <div className="mt-2 space-y-1">
              {associates.map((a) => (<button key={a.id} onClick={() => onSelect(a)} className="flex w-full items-center gap-2 rounded-md border border-app-border px-2 py-1.5 text-left hover:border-app-border-strong" style={{ background: 'var(--app-bg-deep)' }}>
                  <span className="dot" style={{ background: RISK[a.risk].hex }}/>
                  <span className="text-[11px] font-semibold text-app-text truncate flex-1">{a.name}</span>
                  <span className="font-mono text-[10px] text-app-text-faint">{a.id}</span>
                </button>))}
              {!associates.length && <p className="text-[11px] text-app-text-faint">{t('intel.noAssociates')}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>);
}
function AssocGraph({ subject, associates }) {
    const W = 300, H = 200, cx = W / 2, cy = H / 2;
    const pts = associates.map((a, i) => {
        const ang = (i / Math.max(associates.length, 1)) * Math.PI * 2 - Math.PI / 2;
        return { a, x: cx + Math.cos(ang) * 78, y: cy + Math.sin(ang) * 66 };
    });
    return (<svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
      {pts.map((p) => <line key={`l-${p.a.id}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1D3652" strokeWidth={1.2} strokeDasharray="3 3"/>)}
      {pts.map((p) => (<g key={p.a.id}>
          <circle cx={p.x} cy={p.y} r={11} fill={`${RISK[p.a.risk].hex}22`} stroke={RISK[p.a.risk].hex} strokeWidth={1.4}/>
          <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize={8} fill="#A9BBD0" fontFamily="JetBrains Mono">{p.a.id.replace('CR-', '')}</text>
        </g>))}
      <circle cx={cx} cy={cy} r={17} fill={`${RISK[subject.risk].hex}33`} stroke={RISK[subject.risk].hex} strokeWidth={2} style={{ filter: `drop-shadow(0 0 6px ${RISK[subject.risk].hex}88)` }}/>
      <text x={cx} y={cy + 3} textAnchor="middle" fontSize={8.5} fontWeight="bold" fill="#E6EDF7" fontFamily="JetBrains Mono">{subject.id.replace('CR-', '')}</text>
    </svg>);
}
