/* ════════════════════════════════════════════════════════════════════
   CACCO — Command Center (operational nerve center)
   ════════════════════════════════════════════════════════════════════ */
import React, { useMemo, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import { useNow } from '../utils/useNow';
import { KpiCard, StatusCard, AlertCard, IntelCard, RecommendationCard } from '../components/cards';
import { Panel, Chip, ActionModal } from '../components/ui';
import { Icon } from '../components/Icon';
import { useT } from '../contexts/LanguageContext';
import { executeRecommendation } from '../services/api';
const STATUS_ORDER = ['BLK-A', 'BLK-B', 'BLK-C', 'MAX', 'MED', 'VIS'];
export default function CommandCenter() {
    const c = useCacco();
    const now = useNow();
    const { t } = useT();
    const [toast, setToast] = useState(null);
    const [zoneModal, setZoneModal] = useState(null);
    const [recModal, setRecModal] = useState(null);
    const [ackModal, setAckModal] = useState(null);
    const statusZones = useMemo(() => STATUS_ORDER.map((id) => c.zones.find((z) => z.id === id)).filter(Boolean), [c.zones]);
    const sortedAlerts = useMemo(() => [...c.alerts].sort((a, b) => b.createdAtMs - a.createdAtMs), [c.alerts]);
    const fire = (rec) => {
        executeRecommendation(rec.id).then((r) => {
            setToast(`${r.message} · ${r.ref}`);
            setTimeout(() => setToast(null), 3200);
        });
    };
    return (<div className="space-y-4">

      {/* Zone Action Modal */}
      {zoneModal && (
        <ActionModal
          title={`${t('cc.modalZoneActions')} — ${zoneModal.name}`}
          subtitle={`${t('common.zone')} ${zoneModal.id} · ${t('cc.modalZoneOccupancy')}: ${zoneModal.occupancy}/${zoneModal.capacity} · ${t('cc.modalZoneRisk')}: ${zoneModal.risk}`}
          fields={[
            { id: 'action', label: t('cc.modalActionLabel'), type: 'select', required: true, options: [
              { value: 'lockdown', label: t('cc.optLockdown') },
              { value: 'patrol', label: t('cc.optPatrol') },
              { value: 'incident', label: t('cc.optIncident') },
              { value: 'personnel', label: t('cc.optPersonnel') },
            ]},
            { id: 'priority', label: t('cc.modalPriorityLabel'), type: 'select', required: true, options: [
              { value: 'critical', label: t('cc.optCritical') },
              { value: 'high', label: t('cc.optHigh') },
              { value: 'medium', label: t('cc.optMedium') },
              { value: 'low', label: t('cc.optLow') },
            ]},
            { id: 'notes', label: t('cc.ackNotesLabel'), type: 'textarea', placeholder: t('common.modalNotesPlaceholder') },
          ]}
          confirmLabel={t('cc.executeAction')}
          confirmTone="danger"
          onConfirm={(vals) => { setToast(`${t('cc.toastAction')} ${zoneModal.name}: ${vals.action}`); }}
          onClose={() => setZoneModal(null)}
        />
      )}

      {/* Recommendation Execution Modal */}
      {recModal && (
        <ActionModal
          title={t('cc.executeRec')}
          subtitle={recModal.title}
          fields={[
            { id: 'team', label: t('cc.recTeamLabel'), type: 'select', required: true, options: c.teams.map(tm => ({ value: tm.callsign, label: tm.callsign })) },
            { id: 'timeline', label: t('cc.recTimeline'), type: 'select', options: [
              { value: 'immediate', label: t('cc.recOptImmediate') },
              { value: '1h', label: t('cc.recOpt1h') },
              { value: '4h', label: t('cc.recOpt4h') },
              { value: 'shift', label: t('cc.recOptShift') },
            ]},
            { id: 'notes', label: t('cc.recNotesLabel'), type: 'textarea', placeholder: t('cc.recNotesPh') },
          ]}
          confirmLabel={t('cc.executeRec')}
          confirmTone="primary"
          onConfirm={() => { fire(recModal); }}
          onClose={() => setRecModal(null)}
        />
      )}

      {/* Alert Acknowledge Modal */}
      {ackModal && (
        <ActionModal
          title={t('cc.ackTitle')}
          subtitle={`${ackModal.category} · ${ackModal.location}`}
          fields={[
            { id: 'action', label: t('cc.ackActionLabel'), type: 'select', required: true, options: [
              { value: 'dispatched', label: t('cc.ackOptDispatched') },
              { value: 'monitoring', label: t('cc.ackOptMonitoring') },
              { value: 'resolved', label: t('cc.ackOptResolved') },
              { value: 'escalated', label: t('cc.ackOptEscalated') },
            ]},
            { id: 'officer', label: t('cc.ackOfficerLabel'), type: 'text', placeholder: t('cc.ackOfficerPh') },
            { id: 'notes', label: t('cc.ackNotesLabel'), type: 'textarea', placeholder: t('cc.ackNotesPh') },
          ]}
          confirmLabel={t('cc.ackConfirm')}
          confirmTone="primary"
          onConfirm={() => { c.acknowledgeAlert(ackModal.id); }}
          onClose={() => setAckModal(null)}
        />
      )}

      {/* ── Facility status banner ── */}
      <div className="panel flex items-center gap-3 px-4 py-3">
        <Icon name="shield" className="w-4 h-4 shrink-0 text-app-accent"/>
        <h1 className="text-[13px] font-bold tracking-tight text-app-text truncate flex-1">{t('cc.facilityName')}</h1>
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
          {statusZones.map((z) => <StatusCard key={z.id} zone={z} onClick={() => setZoneModal(z)}/>)}
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
              {sortedAlerts.map((a) => (<AlertCard key={a.id} alert={a} now={now} onAck={(id) => setAckModal(c.alerts.find(al => al.id === id))} onDismiss={c.dismissAlert}/>))}
            </div>
          </div>
        </Panel>

        {/* AI Operations Advisor */}
        <Panel title={t('cc.aiAdvisor')} icon={<Icon name="ai" className="w-4 h-4"/>} subtitle={t('cc.aiAdvisorSub')} actions={<Chip tone="violet"><Icon name="cpu" className="w-3 h-3"/> {c.recommendations.length}</Chip>} bodyClass="overflow-y-auto p-2.5 space-y-2.5">
          <div style={{ maxHeight: 560 }} className="space-y-2.5">
            {c.recommendations.map((r) => <RecommendationCard key={r.id} rec={r} onAction={(rec) => setRecModal(rec)}/>)}
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
          {c.teams.map((tm) => {
            const color = tm.status === 'standby' ? '#10b981' : tm.status === 'deployed' ? '#f59e0b' : tm.status === 'responding' ? '#ef4444' : '#526278';
            return (<div key={tm.id} className="relative rounded-lg border border-app-border p-3" style={{ background: 'var(--app-bg-deep)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="dot dot-pulse" style={{ background: color }}/>
                  <span className="font-mono text-[11px] font-bold text-app-text">{tm.callsign}</span>
                </div>
                <div className="space-y-0.5">
                  <p className="font-mono text-[10px] uppercase font-bold text-app-text-muted">{t(`sec.teamStatus.${tm.status}`) || tm.status.toUpperCase()}</p>
                  <p className="text-[9.5px] text-app-text-faint">{tm.members} {t('cc.personnel')}</p>
                  <p className="text-[9.5px] text-app-text-faint">{tm.zoneId ?? 'BASE'}</p>
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
