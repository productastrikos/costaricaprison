/* ════════════════════════════════════════════════════════════════════
   CACCO — AI Analytics
   Predictive threat modelling · behavioral pattern analysis · risk forecasting
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { Panel, MetricCard, Chip, PageHeader, Meter, Ring, Sparkline, Confidence, Dot } from '../components/ui';
import { Icon } from '../components/Icon';
import { RecommendationCard } from '../components/cards';
import { RISK, THREAT } from '../utils/tone';
import { fmtNum } from '../utils/format';
import { useT } from '../contexts/LanguageContext';
import { executeRecommendation } from '../services/api';
/* Simulated model confidence series */
const MODEL_SPARK = [72, 74, 73, 76, 79, 77, 80, 82, 78, 84, 86, 85, 87, 89, 88, 91];
const VIOLENCE_SPARK = [14, 16, 13, 17, 19, 15, 22, 20, 18, 24, 21, 23, 25, 22, 27, 26];
const ESCAPE_SPARK = [3, 2, 4, 3, 2, 5, 4, 3, 6, 5, 4, 7, 5, 6, 5, 8];
const MODELS = [
    { title: 'Threat Escalation Predictor', desc: 'LSTM-based temporal model · 72h forecast window · trained on 5y incident data', accuracy: 91, lastRun: '4 min ago', status: 'active' },
    { title: 'Behavioral Pattern Mapper', desc: 'Graph neural network · inmate co-occurrence · crime pattern correlation · behavioral deviation analysis', accuracy: 87, lastRun: '18 min ago', status: 'active' },
    { title: 'Violence Risk Scorer', desc: 'Gradient boost ensemble · behavioural features · historical incidents', accuracy: 84, lastRun: '9 min ago', status: 'active' },
    { title: 'Contraband Flow Detector', desc: 'Anomaly detection · visitor pattern analysis · movement correlation', accuracy: 79, lastRun: '31 min ago', status: 'active' },
    { title: 'Escape Risk Classifier', desc: 'Random forest · perimeter events · movement logs · psych flags', accuracy: 93, lastRun: '12 min ago', status: 'active' },
    { title: 'Recidivism Predictor', desc: 'Cox proportional hazards · rehabilitation programme outcomes', accuracy: 76, lastRun: '2h ago', status: 'training' },
];
export default function AIAnalytics() {
    const c = useCacco();
    const { t } = useT();
    const [toast, setToast] = useState(null);
    const fire = (rec) => {
        executeRecommendation(rec.id).then((r) => {
            setToast(`${r.message} · ${r.ref}`);
            setTimeout(() => setToast(null), 3200);
        });
    };
    const critRecs = useMemo(() => c.recommendations.filter((r) => r.priority === 'critical' || r.priority === 'high'), [c.recommendations]);
    const threatKpi = c.kpis.find((k) => k.id === 'k-threat');
    const threatIndex = threatKpi?.value ?? 0;
    /* Risk breakdown for gauge display */
    const riskCounts = useMemo(() => {
        return {
            extreme: { n: c.inmates.filter((m) => m.risk === 'extreme').length, pct: 0 },
            high: { n: c.inmates.filter((m) => m.risk === 'high').length, pct: 0 },
            medium: { n: c.inmates.filter((m) => m.risk === 'medium').length, pct: 0 },
            low: { n: c.inmates.filter((m) => m.risk === 'low').length, pct: 0 },
        };
    }, [c.inmates]);
    Object.values(riskCounts).forEach((v) => { v.pct = Math.round((v.n / c.inmates.length) * 100); });
    /* Top predicted threats (derived from intel confidence) */
    const topThreats = useMemo(() => [...c.intel].sort((a, b) => b.confidence - a.confidence).slice(0, 5), [c.intel]);
    /* Crime category risk heat */
    const crimeRisk = useMemo(() => {
        const map = new Map();
        c.inmates.forEach((m) => {
            const cur = map.get(m.crimeCategory) ?? { n: 0, avgThreat: 0 };
            map.set(m.crimeCategory, { n: cur.n + 1, avgThreat: cur.avgThreat + m.threatScore });
        });
        return [...map.entries()]
            .map(([crime, { n, avgThreat }]) => ({ crime, n, avg: Math.round(avgThreat / n) }))
            .sort((a, b) => b.avg - a.avg);
    }, [c.inmates]);
    const maxAvg = crimeRisk[0]?.avg ?? 1;
    return (<div className="space-y-4">
      <PageHeader code="AI-SYS" title={t('ai.title')} subtitle={t('ai.subtitle')} actions={<>
            <Chip tone="violet"><Icon name="cpu" className="w-3 h-3"/> {MODELS.filter((m) => m.status === 'active').length} MODELS ACTIVE</Chip>
            <Chip tone="danger" dot>{critRecs.length} {t('common.criticalRecs')}</Chip>
          </>}/>

      {/* Headline gauges */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="AI Threat Index" value={threatIndex} icon={<Icon name="gauge" className="w-4 h-4"/>} tone="#8b5cf6" sub="composite model score 0–100"/>
        <MetricCard label="Models Running" value={MODELS.filter((m) => m.status === 'active').length} icon={<Icon name="cpu" className="w-4 h-4"/>} tone="#38bdf8" sub="real-time inference"/>
        <MetricCard label={t('common.highPriorityRecs')} value={critRecs.length} icon={<Icon name="alert" className="w-4 h-4"/>} tone="#ef4444" sub={t('common.requireImmediateReview')}/>
        <MetricCard label="Avg Model Accuracy" value={`${Math.round(MODELS.reduce((s, m) => s + m.accuracy, 0) / MODELS.length)}%`} icon={<Icon name="ai" className="w-4 h-4"/>} tone="#10b981" sub="across active models" mono={false}/>
      </div>

      {/* Triptych: threat index / model cards / recommendations */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Threat forecast */}
        <div className="space-y-4">
          <Panel title={t('ai.forecastTitle')} icon={<Icon name="gauge" className="w-4 h-4"/>} bodyClass="p-4">
            <div className="flex items-center justify-center">
              <Ring value={threatIndex} size={130} stroke={11} color="#8b5cf6" sub="AI THREAT INDEX"/>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="t-label">Violence Risk Trend</span>
                  <span className="font-mono text-[11px] font-bold text-app-warning">{VIOLENCE_SPARK[VIOLENCE_SPARK.length - 1]}%</span>
                </div>
                <Sparkline data={VIOLENCE_SPARK} color="#f59e0b" height={32}/>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="t-label">Model Confidence</span>
                  <span className="font-mono text-[11px] font-bold text-app-accent">{MODEL_SPARK[MODEL_SPARK.length - 1]}%</span>
                </div>
                <Sparkline data={MODEL_SPARK} color="#38bdf8" height={32}/>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="t-label">Escape Risk Score</span>
                  <span className="font-mono text-[11px] font-bold text-app-danger">{ESCAPE_SPARK[ESCAPE_SPARK.length - 1]}</span>
                </div>
                <Sparkline data={ESCAPE_SPARK} color="#ef4444" height={32}/>
              </div>
            </div>
          </Panel>

          <Panel title={t('ai.riskStrat')} icon={<Icon name="intel" className="w-4 h-4"/>} bodyClass="p-3 grid grid-cols-2 gap-2">
            {Object.entries(riskCounts).map(([r, { n, pct }]) => {
            const m = RISK[r];
            return (<div key={r} className="rounded-md border border-app-border p-2.5" style={{ background: 'var(--app-bg-deep)' }}>
                  <p className="font-mono text-[22px] font-extrabold leading-none text-white">{fmtNum(n)}</p>
                  <p className="t-label mt-1">{m.label}</p>
                  <p className="text-[9px] text-app-text-faint">{pct}% of pop.</p>
                </div>);
        })}
          </Panel>
        </div>

        {/* Active models */}
        <Panel title={t('ai.modelsTitle')} icon={<Icon name="cpu" className="w-4 h-4"/>} subtitle={t('ai.modelsSub')} bodyClass="overflow-y-auto p-2.5 space-y-2">
          <div style={{ maxHeight: 560 }} className="space-y-2">
            {MODELS.map((m) => (<div key={m.title} className="rounded-lg border border-app-border p-2.5" style={{ background: 'var(--app-bg-deep)' }}>
                <div className="flex items-center gap-2">
                  <Dot color={m.status === 'active' ? '#10b981' : m.status === 'training' ? '#38bdf8' : '#f59e0b'} pulse={m.status === 'active'} size={7}/>
                  <span className="text-[11px] font-bold text-app-text truncate flex-1">{m.title}</span>
                  <span className="font-mono text-[9px] font-bold uppercase" style={{ color: m.status === 'active' ? '#10b981' : '#38bdf8' }}>{m.status}</span>
                </div>
                <p className="mt-1.5 text-[9.5px] leading-relaxed text-app-text-faint">{m.desc}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="t-label shrink-0">Accuracy</span>
                    <Confidence value={m.accuracy} color="#8b5cf6"/>
                  </div>
                  <span className="ml-3 font-mono text-[9px] text-app-text-faint shrink-0">{m.lastRun}</span>
                </div>
              </div>))}
          </div>
        </Panel>

        {/* High-priority recommendations */}
        <Panel title={t('ai.recsTitle')} icon={<Icon name="ai" className="w-4 h-4"/>} subtitle={t('ai.recsSub')} actions={<Chip tone="violet"><Icon name="cpu" className="w-3 h-3"/> {c.recommendations.length}</Chip>} bodyClass="overflow-y-auto p-2.5 space-y-2">
          <div style={{ maxHeight: 560 }} className="space-y-2">
            {c.recommendations.map((r) => <RecommendationCard key={r.id} rec={r} onAction={fire}/>)}
          </div>
        </Panel>
      </div>

      {/* Crime category threat heat + top intel */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title={t('ai.crimeProfile')} icon={<Icon name="intel" className="w-4 h-4"/>} subtitle={t('ai.crimeProfileSub')} bodyClass="p-3 space-y-2.5">
          {crimeRisk.map(({ crime, n, avg }) => (<div key={crime}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[11px] text-app-text-muted">{crime}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="t-label">{n} subjects</span>
                  <span className="font-mono text-[12px] font-bold" style={{ color: avg >= 70 ? '#ef4444' : avg >= 50 ? '#f59e0b' : '#38bdf8' }}>{avg}</span>
                </div>
              </div>
              <Meter value={avg} max={maxAvg} color={avg >= 70 ? '#ef4444' : avg >= 50 ? '#f59e0b' : '#38bdf8'} height={5}/>
            </div>))}
        </Panel>

        <Panel title={t('ai.topSignals')} icon={<Icon name="crosshair" className="w-4 h-4"/>} subtitle={t('ai.topSignalsSub')} bodyClass="p-3 space-y-2.5">
          {topThreats.map((intel) => {
            const t = THREAT[intel.severity];
            return (<div key={intel.id} className="rounded-lg border border-app-border p-2.5" style={{ background: 'var(--app-bg-deep)' }}>
                <div className="flex items-start gap-2">
                  <Dot color={t.hex} size={6}/>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-app-text">{intel.title}</p>
                    <p className="mt-0.5 text-[9.5px] text-app-text-faint">{intel.category} · {intel.affectedZone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-[10px] font-bold" style={{ color: t.hex }}>{t.label}</p>
                    <p className="text-[9px] text-app-text-faint">{intel.confidence}% conf.</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Confidence value={intel.confidence} color={t.hex}/>
                </div>
              </div>);
        })}
        </Panel>
      </div>

      {toast && (<div className="fixed bottom-9 right-4 z-[400] animate-slide-up rounded-lg border px-4 py-3 text-xs font-semibold shadow-2xl" style={{ background: 'var(--app-panel-2)', borderColor: 'var(--app-accent-border)', color: 'var(--app-accent)' }}>
          <Icon name="check" className="mr-1.5 inline w-3.5 h-3.5"/>{toast}
        </div>)}
    </div>);
}
