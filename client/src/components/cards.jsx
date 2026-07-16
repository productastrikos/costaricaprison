/* ════════════════════════════════════════════════════════════════════
   CACCO — Reusable operational cards
   KpiCard · StatusCard · AlertCard · IntelCard · RecommendationCard
   ════════════════════════════════════════════════════════════════════ */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { THREAT, RISK, OPSTATUS, PRIORITY, ALERT_STATUS, } from '../utils/tone';
import { timeAgo, fmtNum } from '../utils/format';
import { Chip, Dot, Meter, Confidence } from './ui';
import { Icon } from './Icon';
import { useT } from '../contexts/LanguageContext';
/* ─── KPI icon + route mapping ──────────────────────────────────────── */
const KPI_META = {
    'k-inmates':   { icon: 'users', route: '/intelligence', tKey1: 'kpi.prevDay',   tKey2: 'kpi.change',    tKeyLabel: 'kpi.nameInmates'   },
    'k-occupancy': { icon: 'gauge', route: '/twin',         tKey1: 'kpi.prevDay',   tKey2: 'kpi.change',    tKeyLabel: 'kpi.nameOccupancy' },
    'k-personnel': { icon: 'staff', route: '/staff',        tKey1: 'kpi.prevShift', tKey2: 'kpi.change',    tKeyLabel: 'kpi.namePersonnel' },
    'k-alerts':    { icon: 'bell',  route: '/security',     tKey1: 'kpi.yesterday', tKey2: 'kpi.trend',     tKeyLabel: 'kpi.nameAlerts'    },
    'k-highrisk':  { icon: 'fire',  route: '/intelligence', tKey1: 'kpi.prevDay',   tKey2: 'kpi.change',    tKeyLabel: 'kpi.nameHighrisk'  },
    'k-threat':    { icon: 'ai',    route: '/analytics',    tKey1: 'kpi.baseline',  tKey2: 'kpi.deviation', tKeyLabel: 'kpi.nameThreat'    },
};
/* ─── KPI Card ──────────────────────────────────────────────────────── */
const STATUS_COLORS = { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' };
export function KpiCard({ kpi }) {
    const navigate = useNavigate();
    const { t: tr } = useT();
    const meta = KPI_META[kpi.id] ?? { icon: 'gauge', route: '/', tKey1: 'kpi.prevDay', tKey2: 'kpi.change', tKeyLabel: 'kpi.nameInmates' };
    const statusColor = STATUS_COLORS[kpi.rag] ?? '#10b981';
    return (<div className="kpi-card">
      {/* Row 1 — icon + label */}
      <div className="flex items-center gap-2.5">
        <div className="kpi-icon-box shrink-0" style={{ color: 'var(--app-accent)' }}>
          <Icon name={meta.icon} className="w-4 h-4"/>
        </div>
        <p className="flex-1 leading-tight text-[13px] font-medium" style={{ color: '#b0b0b0' }}>{tr(meta.tKeyLabel)}</p>
      </div>

      {/* Row 2 — large metric full width */}
      <div className="mt-3 flex items-end gap-1.5">
        <span className="font-bold leading-none tracking-tight text-white" style={{ fontSize: 'clamp(2.4rem, 3.2vw, 3.6rem)' }}>
          {kpi.display ?? fmtNum(kpi.value)}
        </span>
        {kpi.unit && <span className="mb-1 text-[14px] font-medium" style={{ color: '#777777' }}>{kpi.unit}</span>}
      </div>

      {/* Row 3 — sub-metrics */}
      <div className="mt-3 flex items-start gap-6">
        <div>
          <p className="t-label">{tr(meta.tKey1)}</p>
          <p className="text-[13px] font-semibold mt-1" style={{ color: '#e0e0e0' }}>
            {fmtNum(kpi.previous)}{kpi.unit ?? ''}
          </p>
        </div>
        <div>
          <p className="t-label">{tr(meta.tKey2)}</p>
          <p className="text-[13px] font-semibold mt-1" style={{ color: '#e0e0e0' }}>
            {kpi.deltaPct > 0 ? '+' : ''}{kpi.deltaPct.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="kpi-card-divider"/>

      {/* Row 4 — status dot + VIEW DETAILS */}
      <div className="flex items-center justify-between mt-2.5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: statusColor }}>
          <Dot color={statusColor} pulse={kpi.rag === 'critical'} size={6}/>
          {tr('tone.rag.' + kpi.rag)}
        </span>
        <button onClick={() => navigate(meta.route)} className="kpi-view-details">
          {tr('common.viewDetails')}
        </button>
      </div>
    </div>);
}
/* ─── Operational Status Card ───────────────────────────────────────── */
export function StatusCard({ zone, onClick }) {
    const { t } = useT();
    const s = OPSTATUS[zone.status];
    const r = RISK[zone.risk];
    const loadPct = zone.capacity > 0 ? Math.round((zone.occupancy / zone.capacity) * 100) : 0;
    return (<button onClick={onClick} className="panel text-left transition-transform hover:-translate-y-0.5">
      <div className="flex items-center gap-2 px-3.5 pt-3">
        <h4 className="text-[12px] font-bold text-app-text truncate flex-1">{zone.name}</h4>
        <Chip tone={s.chip} dot>{t('tone.op.' + zone.status)}</Chip>
      </div>
      <div className="px-3.5 py-3">
        <div className="flex items-center justify-between mb-1">
          <span className="t-label">{t('common.occupancy')}</span>
          <span className="font-mono text-[11px] font-bold text-app-text">
            {zone.capacity > 0 ? `${zone.occupancy}/${zone.capacity}` : '—'}
            <span className="ml-1 text-app-text-faint">{zone.capacity > 0 ? `${loadPct}%` : ''}</span>
          </span>
        </div>
        <Meter value={loadPct} color={s.hex}/>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Mini label={t('common.incidents')} value={zone.incidents24h} color={zone.incidents24h >= 4 ? '#ef4444' : zone.incidents24h >= 2 ? '#f59e0b' : '#A9BBD0'}/>
          <Mini label={t('common.risk')} value={t('tone.risk.' + zone.risk)} color={r.hex} small/>
          <Mini label={t('common.personnel')} value={zone.assignedPersonnel} color="#A9BBD0"/>
        </div>
      </div>
    </button>);
}
function Mini({ label, value, color, small = false }) {
    return (<div>
      <p className="t-label">{label}</p>
      <p className="mt-0.5 font-mono font-bold" style={{ color, fontSize: small ? 11 : 14 }}>{value}</p>
    </div>);
}
/* ─── Live Alert Card ───────────────────────────────────────────────── */
export function AlertCard({ alert, now, onAck, onDismiss, compact = false }) {
    const { t } = useT();
    const thr = THREAT[alert.threat];
    const as_ = ALERT_STATUS[alert.status];
    return (<div className="animate-stream rounded-lg border bg-app-panel/60 p-2.5" style={{ borderColor: 'var(--app-border)', background: 'rgba(15,27,43,0.6)' }}>
      <div className="flex items-center gap-2">
        <Dot color={thr.hex} pulse={alert.threat === 'critical' || alert.threat === 'high'} size={7}/>
        <span className="text-[12px] font-bold text-app-text truncate flex-1">{alert.category}</span>
        <span className="font-mono text-[9.5px] text-app-text-faint">{timeAgo(alert.createdAtMs, now)}</span>
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
        <Chip tone={thr.chip}>{t('tone.threat.' + alert.threat)}</Chip>
        <Chip tone={as_.chip}>{t('tone.alertStatus.' + alert.status)}</Chip>
        <span className="font-mono text-[10px] text-app-text-faint truncate">{alert.location}</span>
      </div>

      {!compact && (<p className="mt-1.5 text-[11px] text-app-text-muted leading-snug">
          <span className="t-label">{t('cards.action')} · </span>{alert.requiredAction}
        </p>)}

      <div className="mt-2 flex items-center gap-2">
        <span className="chip chip-ghost font-mono">{alert.responseTeam}</span>
        <span className="font-mono text-[9.5px] text-app-text-faint ml-auto">{alert.source}</span>
        {onAck && !alert.acknowledged && (<button onClick={() => onAck(alert.id)} className="text-[10px] font-bold text-app-accent hover:underline">{t('common.ack')}</button>)}
        {onDismiss && (<button onClick={() => onDismiss(alert.id)} className="text-app-text-faint hover:text-app-danger" title={t('cards.dismiss')}>
            <Icon name="close" className="w-3 h-3" strokeWidth={2.2}/>
          </button>)}
      </div>
    </div>);
}
/* ─── Threat Intelligence Card ──────────────────────────────────────── */
export function IntelCard({ intel, now }) {
    const { t } = useT();
    const thr = THREAT[intel.severity];
    return (<div className="rounded-lg border border-app-border p-3" style={{ background: 'rgba(15,27,43,0.5)' }}>
      <div className="flex items-center gap-2">
        <Chip tone="violet" className="font-mono">{intel.category}</Chip>
        <Chip tone={thr.chip}>{t('tone.threat.' + intel.severity)}</Chip>
        <span className="font-mono text-[9.5px] text-app-text-faint ml-auto">{timeAgo(intel.createdAtMs, now)}</span>
      </div>
      <h4 className="mt-2 text-[12.5px] font-bold text-app-text leading-snug">{intel.title}</h4>
      <p className="mt-1 text-[11px] text-app-text-muted leading-snug line-clamp-2">{intel.detail}</p>

      <div className="mt-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="t-label">{t('cards.modelConf')}</span>
          <span className="font-mono text-[9.5px] text-app-text-faint">{t('cards.src')} · {intel.source}</span>
        </div>
        <Confidence value={intel.confidence} color={thr.hex}/>
      </div>

      <div className="mt-2.5 rounded-md border border-app-border px-2.5 py-2" style={{ background: 'rgba(74,168,255,0.05)' }}>
        <p className="text-[11px] text-app-text-muted leading-snug">
          <span className="t-label" style={{ color: 'var(--app-accent)' }}>{t('cards.recommended')} · </span>{intel.recommendedResponse}
        </p>
        <p className="mt-1 t-label">{t('cards.zoneLabel')} · <span className="text-app-text-faint font-mono">{intel.affectedZone}</span></p>
      </div>
    </div>);
}
/* ─── AI Operations Advisor — Recommendation Card ───────────────────── */
export function RecommendationCard({ rec, onAction }) {
    const { t: tr } = useT();
    const p = PRIORITY[rec.priority];
    return (<div className="rounded-lg border p-3" style={{ borderColor: 'var(--app-border)', background: 'linear-gradient(180deg, rgba(155,107,255,0.06), rgba(15,27,43,0.5))' }}>
      <div className="flex items-center gap-2">
        <Chip tone={p.chip}>{tr('tone.priority.' + rec.priority)} {tr('cards.priority')}</Chip>
        <span className="t-label truncate">{rec.category}</span>
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-bold text-app-violet">
          <Icon name="ai" className="w-3 h-3"/>{rec.confidence}%
        </span>
      </div>

      <h4 className="mt-2 text-[13px] font-bold text-app-text leading-snug">{rec.title}</h4>

      <div className="mt-2 space-y-2">
        <Field label={tr('cards.reasoning')} text={rec.reasoning}/>
        <div className="rounded-md border border-app-border px-2.5 py-1.5" style={{ background: 'rgba(74,168,255,0.06)' }}>
          <Field label={tr('cards.suggestedAction')} text={rec.suggestedAction} accent/>
        </div>
        <Field label={tr('cards.expectedOutcome')} text={rec.expectedOutcome}/>
      </div>

      {onAction && (<button onClick={() => onAction(rec)} className="btn btn-primary mt-3 w-full justify-center">
          <Icon name="zap" className="w-3.5 h-3.5"/> {tr('common.execute')}
        </button>)}
    </div>);
}
function Field({ label, text, accent = false }) {
    return (<p className="text-[11px] leading-snug" style={{ color: accent ? 'var(--app-text)' : 'var(--app-text-muted)' }}>
      <span className="t-label" style={{ color: accent ? 'var(--app-accent)' : undefined }}>{label} · </span>{text}
    </p>);
}
