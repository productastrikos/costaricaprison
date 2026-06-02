/* ════════════════════════════════════════════════════════════════════
   CACCO — Command Center (operational nerve center)
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { useNow } from '../utils/useNow';
import { KpiCard, StatusCard, AlertCard, IntelCard, RecommendationCard } from '../components/cards';
import { Panel, Chip, Dot } from '../components/ui';
import { Icon } from '../components/Icon';
import { SEC_LEVEL } from '../utils/tone';
import { useT } from '../contexts/LanguageContext';
import { executeRecommendation } from '../services/api';
const STATUS_ORDER = ['BLK-A', 'BLK-B', 'BLK-C', 'MAX', 'MED', 'VIS'];
export default function CommandCenter() {
    const c = useCacco();
    const now = useNow();
    const { t } = useT();
    const [toast, setToast] = useState(null);
    const statusZones = useMemo(() => STATUS_ORDER.map((id) => c.zones.find((z) => z.id === id)).filter(Boolean), [c.zones]);
    const sec = SEC_LEVEL[c.facility.securityLevel];
    const sortedAlerts = useMemo(() => [...c.alerts].sort((a, b) => b.createdAtMs - a.createdAtMs), [c.alerts]);
    const fire = (rec) => {
        executeRecommendation(rec.id).then((r) => {
            setToast(`${r.message} · ${r.ref}`);
            setTimeout(() => setToast(null), 3200);
        });
    };
    return (<div className="space-y-4">
      {/* ── Facility status banner ── */}
      <div className="panel flex items-center gap-3 px-4 py-3">
        <Icon name="shield" className="w-4 h-4 shrink-0 text-app-accent"/>
        <h1 className="text-[13px] font-bold tracking-tight text-app-text truncate flex-1">CENTRO DE ALTA CONTENCIÓN DEL CRIMEN ORGANIZADO</h1>
      </div>

      {/* ── Strategic KPIs ── */}
      <div>
        <SectionTitle icon="gauge">{t('cc.strategicIndicators')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {c.kpis.map((k) => <KpiCard key={k.id} kpi={k}/>)}
        </div>
      </div>

      {/* ── Operational status grid ── */}
      <Panel title={t('cc.opStatusTitle')} icon={<Icon name="dotsGrid" className="w-4 h-4"/>} subtitle={t('cc.opStatusSub')} bodyClass="p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {statusZones.map((z) => <StatusCard key={z.id} zone={z}/>)}
        </div>
      </Panel>

      {/* ── Triptych: live stream / advisor / intel ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Live Alert Stream */}
        <Panel title={t('cc.liveAlerts')} icon={<Icon name="bell" className="w-4 h-4"/>} live actions={<button onClick={c.toggleStream} className="icon-btn" title={c.streamPaused ? t('common.resumeStream') : t('common.pauseStream')}>
              <Icon name={c.streamPaused ? 'play' : 'pause'} className="w-3.5 h-3.5"/>
            </button>} className="xl:col-span-1" bodyClass="overflow-y-auto p-2.5 space-y-1.5">
          <div style={{ maxHeight: 560 }}>
            <div className="space-y-1.5">
              {sortedAlerts.map((a) => (<AlertCard key={a.id} alert={a} now={now} onAck={c.acknowledgeAlert} onDismiss={c.dismissAlert}/>))}
            </div>
          </div>
        </Panel>

        {/* AI Operations Advisor */}
        <Panel title={t('cc.aiAdvisor')} icon={<Icon name="ai" className="w-4 h-4"/>} subtitle={t('cc.aiAdvisorSub')} actions={<Chip tone="violet"><Icon name="cpu" className="w-3 h-3"/> {c.recommendations.length}</Chip>} bodyClass="overflow-y-auto p-2.5 space-y-2.5">
          <div style={{ maxHeight: 560 }} className="space-y-2.5">
            {c.recommendations.map((r) => <RecommendationCard key={r.id} rec={r} onAction={fire}/>)}
          </div>
        </Panel>

        {/* Threat Intelligence Feed */}
        <Panel title={t('cc.threatIntel')} icon={<Icon name="crosshair" className="w-4 h-4"/>} subtitle={t('cc.threatIntelSub')} actions={<Chip tone="danger" dot>{c.intel.filter((i) => i.severity === 'high' || i.severity === 'critical').length} {t('common.high')}</Chip>} bodyClass="overflow-y-auto p-2.5 space-y-2.5">
          <div style={{ maxHeight: 560 }} className="space-y-2.5">
            {c.intel.map((it) => <IntelCard key={it.id} intel={it} now={now}/>)}
          </div>
        </Panel>
      </div>

      {/* ── Response team readiness ── */}
      <Panel title={t('cc.responseTitle')} icon={<Icon name="shield" className="w-4 h-4"/>} subtitle={t('cc.responseSub')} bodyClass="p-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {c.teams.map((t) => {
            const color = t.status === 'standby' ? '#10b981' : t.status === 'deployed' ? '#f59e0b' : t.status === 'responding' ? '#ef4444' : '#526278';
            return (<div key={t.id} className="relative rounded-lg border border-app-border p-3" style={{ background: 'var(--app-bg-deep)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="dot dot-pulse" style={{ background: 'var(--app-accent)' }}/>
                  <span className="font-mono text-[11px] font-bold text-app-text">{t.callsign}</span>
                </div>
                <div className="space-y-0.5">
                  <p className="font-mono text-[10px] uppercase font-bold text-app-text-muted">{t.status}</p>
                  <p className="text-[9.5px] text-app-text-faint">{t.members} personnel</p>
                  <p className="text-[9.5px] text-app-text-faint">{t.zoneId ?? 'BASE'}</p>
                </div>
              </div>);
        })}
        </div>
      </Panel>

      {toast && (<div className="fixed bottom-9 right-4 z-[400] animate-slide-up rounded-lg border px-4 py-3 text-xs font-semibold shadow-2xl" style={{ background: 'var(--app-panel-2)', borderColor: 'var(--app-success-border)', color: 'var(--app-success)' }}>
          <Icon name="check" className="mr-1.5 inline w-3.5 h-3.5"/>{toast}
        </div>)}
    </div>);
}
function SectionTitle({ icon, children }) {
    return (<div className="mb-2 flex items-center gap-2">
      <Icon name={icon} className="w-3.5 h-3.5 text-app-accent"/>
      <span className="t-label" style={{ fontSize: 10, letterSpacing: '0.16em' }}>{children}</span>
      <span className="ml-2 h-px flex-1" style={{ background: 'var(--app-border)' }}/>
    </div>);
}
