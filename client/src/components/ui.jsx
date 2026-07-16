/* ════════════════════════════════════════════════════════════════════
   CACCO — Shared UI primitives
   ════════════════════════════════════════════════════════════════════ */
import React, { useState } from 'react';
import { Icon } from './Icon';
/* ─── Panel ─────────────────────────────────────────────────────────── */
export function Panel({ title, subtitle, icon, actions, children, className = '', bodyClass = '', flush = false, live = false, }) {
    return (<section className={`${flush ? 'panel-flush' : 'panel'} flex flex-col overflow-hidden ${className}`}>
      {(title || actions) && (<header className="panel-header shrink-0">
          {icon && <span className="text-app-accent">{icon}</span>}
          <div className="min-w-0">
            {title && <h3 className="panel-title truncate">{title}</h3>}
            {subtitle && <p className="text-[10px] text-app-text-faint mt-0.5 truncate" style={{ letterSpacing: '0.04em' }}>{subtitle}</p>}
          </div>
          {live && (<span className="chip chip-danger ml-1">
              <span className="dot dot-pulse" style={{ background: 'currentColor' }}/>LIVE
            </span>)}
          {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </header>)}
      <div className={`flex-1 min-h-0 ${bodyClass}`}>{children}</div>
    </section>);
}
/* ─── Chip ──────────────────────────────────────────────────────────── */
export function Chip({ tone = 'ghost', children, className = '', dot = false, style }) {
    return (<span className={`chip chip-${tone} ${className}`} style={style}>
      {dot && <span className="dot" style={{ background: 'currentColor', width: 5, height: 5 }}/>}
      {children}
    </span>);
}
/* ─── Signal dot ────────────────────────────────────────────────────── */
export function Dot({ color, pulse = false, size = 8 }) {
    return <span className={`dot ${pulse ? 'dot-pulse' : ''}`} style={{ background: color, color, width: size, height: size }}/>;
}
/* ─── Trend badge ───────────────────────────────────────────────────── */
export function TrendBadge({ deltaPct, inverted = false, suffix = '%' }) {
    const up = deltaPct >= 0;
    // "good" = up unless inverted (e.g. fewer alerts is good)
    const good = inverted ? !up : up;
    const color = deltaPct === 0 ? '#526278' : good ? '#10b981' : '#ef4444';
    return (<span className="inline-flex items-center gap-1 font-mono font-bold" style={{ color, fontSize: 10 }}>
      <span style={{ fontSize: 8 }}>{up ? '▲' : '▼'}</span>
      {Math.abs(deltaPct).toFixed(1)}{suffix}
    </span>);
}
/* ─── Meter ─────────────────────────────────────────────────────────── */
export function Meter({ value, max = 100, color = '#38bdf8', height = 6 }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return (<div className="meter" style={{ height }}>
      <i style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}66` }}/>
    </div>);
}
/* ─── Sparkline ─────────────────────────────────────────────────────── */
export function Sparkline({ data, color = '#38bdf8', width = 96, height = 28, fill = true }) {
    const id = React.useId();
    if (!data.length)
        return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const step = width / (data.length - 1 || 1);
    const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / span) * (height - 4) - 2).toFixed(1)}`);
    return (<svg width={width} height={height} className="overflow-visible">
      {fill && (<>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon points={`0,${height} ${pts.join(' ')} ${width},${height}`} fill={`url(#${id})`}/>
        </>)}
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round"/>
    </svg>);
}
/* ─── Section label ─────────────────────────────────────────────────── */
export function SectionLabel({ children, className = '' }) {
    return <p className={`t-label ${className}`}>{children}</p>;
}
/* ─── Stat tile ─────────────────────────────────────────────────────── */
export function StatTile({ label, value, color, mono = true }) {
    return (<div className="rounded-md border border-app-border bg-app-bg-deep/40 px-3 py-2" style={{ background: 'rgba(5,11,18,0.4)' }}>
      <p className="t-label">{label}</p>
      <p className={`mt-0.5 font-bold ${mono ? 'font-mono' : ''}`} style={{ color: color ?? 'var(--app-text)', fontSize: 16 }}>{value}</p>
    </div>);
}
/* ─── Confidence bar ────────────────────────────────────────────────── */
export function Confidence({ value, color = '#8b5cf6' }) {
    return (<div className="flex items-center gap-2">
      <div className="meter flex-1" style={{ height: 5 }}>
        <i style={{ width: `${value}%`, background: color }}/>
      </div>
      <span className="font-mono text-[10px] font-bold" style={{ color }}>{value}%</span>
    </div>);
}
/* ─── Radial gauge ──────────────────────────────────────────────────── */
export function Ring({ value, max = 100, size = 92, stroke = 8, color = '#38bdf8', label, sub }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(1, value / max));
    return (<div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--app-border)" strokeWidth={stroke}/>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset 0.6s ease', filter: `drop-shadow(0 0 4px ${color}88)` }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-mono font-extrabold text-app-text" style={{ fontSize: size * 0.26 }}>{label ?? value}</span>
        {sub && <span className="t-label mt-1">{sub}</span>}
      </div>
    </div>);
}
/* ─── Segmented control / tabs ──────────────────────────────────────── */
export function Segmented({ options, value, onChange }) {
    return (<div className="inline-flex items-center gap-1 rounded-lg border border-app-border bg-app-bg-deep p-1" style={{ background: 'var(--app-bg-deep)' }}>
      {options.map((o) => {
            const active = o.value === value;
            return (<button key={o.value} onClick={() => onChange(o.value)} className="rounded-md px-3 py-1 text-[11px] font-semibold transition-all" style={{
                    background: active ? 'var(--app-accent-bg)' : 'transparent',
                    color: active ? 'var(--app-accent)' : 'var(--app-text-faint)',
                    border: `1px solid ${active ? 'var(--app-accent-border)' : 'transparent'}`,
                }}>
            {o.label}
          </button>);
        })}
    </div>);
}
/* ─── Empty state ───────────────────────────────────────────────────── */
export function EmptyState({ children }) {
    return <div className="flex h-full items-center justify-center py-10 text-center text-xs text-app-text-faint">{children}</div>;
}
/* ─── Compact metric card ───────────────────────────────────────────── */
export function MetricCard({ label, value, icon, tone = '#38bdf8', sub, mono = true }) {
    return (<div className="kpi-card">
      <div className="flex items-center gap-2.5">
        <div className="kpi-icon-box shrink-0" style={{ color: 'var(--app-accent)' }}>
          {icon}
        </div>
        <p className="flex-1 leading-tight text-[13px] font-medium" style={{ color: '#b0b0b0' }}>{label}</p>
      </div>
      <p className={`mt-3 font-bold leading-none tracking-tight text-white ${mono ? 'font-mono' : ''}`} style={{ fontSize: 'clamp(1.6rem, 2.2vw, 2.4rem)' }}>{value}</p>
      {sub && <p className="mt-1.5 text-[10px]" style={{ color: '#777777' }}>{sub}</p>}
    </div>);
}
/* ─── Key/value row ─────────────────────────────────────────────────── */
export function KV({ k, v, color }) {
    return (<div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--app-border-soft)' }}>
      <span className="t-label">{k}</span>
      <span className="font-mono text-[11px] font-semibold" style={{ color: color ?? 'var(--app-text)' }}>{v}</span>
    </div>);
}
/* ─── Page scaffold header ──────────────────────────────────────────── */
export function PageHeader({ title, subtitle, code, actions }) {
    return (<div className="flex items-center justify-between gap-4 flex-wrap rounded-xl px-5 py-4" style={{ background: 'var(--app-panel)', border: '1px solid var(--app-border)', marginBottom: 0 }}>
      <div className="flex items-center gap-3">
        {code && (<div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style={{ background: 'var(--app-accent-bg)', border: '1px solid var(--app-accent-border)', color: 'var(--app-accent)' }}>
            <span className="font-mono text-[9px] font-black tracking-widest leading-none text-center">{code}</span>
          </div>)}
        <div>
          <h1 className="text-[18px] font-extrabold tracking-tight text-app-text leading-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-app-text-faint mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>);
}
/* ─── Action Modal ──────────────────────────────────────────────────── */
export function ActionModal({ title, subtitle, fields = [], onConfirm, onClose, confirmLabel = 'Confirmar', confirmTone = 'primary' }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(f => [f.id, f.defaultValue ?? ''])));
  const set = (id, val) => setValues(prev => ({ ...prev, [id]: val }));
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(2px)' }}/>
      <div
        className="relative w-full max-w-md rounded-xl border shadow-2xl flex flex-col max-h-[90vh]"
        style={{ background: 'var(--app-panel-2)', borderColor: 'var(--app-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--app-border)' }}>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-extrabold text-app-text leading-snug">{title}</h3>
            {subtitle && <p className="text-[11px] text-app-text-faint mt-1 leading-snug">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="icon-btn shrink-0 mt-0.5">
            <Icon name="close" className="w-4 h-4"/>
          </button>
        </div>
        {/* Body */}
        {fields.length > 0 && (
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {fields.map(field => (
              <div key={field.id}>
                <label className="block t-label mb-1.5">{field.label}{field.required && <span style={{ color: 'var(--app-danger)' }}> *</span>}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={values[field.id] ?? ''}
                    placeholder={field.placeholder ?? ''}
                    onChange={e => set(field.id, e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-[12px] font-mono resize-none"
                    style={{ background: 'var(--app-bg-deep)', borderColor: 'var(--app-border)', color: 'var(--app-text)', outline: 'none' }}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={values[field.id] ?? ''}
                    onChange={e => set(field.id, e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-[12px] font-mono"
                    style={{ background: 'var(--app-bg-deep)', borderColor: 'var(--app-border)', color: 'var(--app-text)', outline: 'none' }}
                  >
                    <option value="">— Seleccione —</option>
                    {(field.options ?? []).map(o => (
                      <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type ?? 'text'}
                    value={values[field.id] ?? ''}
                    placeholder={field.placeholder ?? ''}
                    onChange={e => set(field.id, e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-[12px] font-mono"
                    style={{ background: 'var(--app-bg-deep)', borderColor: 'var(--app-border)', color: 'var(--app-text)', outline: 'none' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t shrink-0" style={{ borderColor: 'var(--app-border)' }}>
          <button onClick={onClose} className="btn flex-1">Cancelar</button>
          <button
            onClick={() => { onConfirm && onConfirm(values); onClose(); }}
            className={`btn btn-${confirmTone} flex-1`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
