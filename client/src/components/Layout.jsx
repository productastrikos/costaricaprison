/* ════════════════════════════════════════════════════════════════════
   CACCO Command Platform — Application shell
   Sidebar · Command header · Classified footer · Intel/Advisor drawers
   ════════════════════════════════════════════════════════════════════ */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV, NAV_FLAT, PAGE_TITLE } from '../config/nav';
import { Icon } from './Icon';
import { Chip } from './ui';
import { IntelCard, AlertCard, RecommendationCard } from './cards';
import { useCacco } from '../services/CaccoData';
import { useT } from '../contexts/LanguageContext';
import { clockTime, clockDate, zulu } from '../utils/format';
const VERSION = 'v3.4.1';
function resolveBadge(key, s) {
    if (!key)
        return null;
    const active = s.alerts.filter((a) => a.status === 'active' || a.status === 'dispatched').length;
    switch (key) {
        case 'alerts': return active ? { count: active, tone: '#ef4444' } : null;
        case 'lockdown': return s.facility.lockdownZones ? { count: s.facility.lockdownZones, tone: '#ef4444' } : null;
        case 'cameras': {
            const off = s.cameras.filter((c) => !c.online).length;
            return off ? { count: off, tone: '#f59e0b' } : null;
        }
        case 'incidents': {
            const open = s.incidents.filter((i) => i.stage !== 'closed').length;
            return open ? { count: open, tone: '#f59e0b' } : null;
        }
        case 'extreme': {
            const x = s.inmates.filter((m) => m.risk === 'extreme').length;
            return x ? { count: x, tone: '#ef4444' } : null;
        }
        case 'recs': {
            const c = s.recommendations.filter((r) => r.priority === 'critical' || r.priority === 'high').length;
            return c ? { count: c, tone: '#8b5cf6' } : null;
        }
        default: return null;
    }
}
const fmtBadge = (n) => (n > 99 ? '99+' : String(n));
/* ─── Search index ──────────────────────────────────────────────────── */
const SEARCH = [
    ...NAV_FLAT.map((i) => ({ label: i.label, path: i.path, desc: i.description, icon: i.icon })),
    { label: 'Live Alert Stream', path: '/', desc: 'Command Center › Real-time events', icon: 'bell' },
    { label: 'Response Teams', path: '/security', desc: 'Security Operations › Readiness', icon: 'shield' },
    { label: 'Association Graph', path: '/intelligence', desc: 'Inmate Intelligence › Network', icon: 'intel' },
    { label: 'Threat Forecast', path: '/analytics', desc: 'AI Analytics › Predictive', icon: 'ai' },
    { label: 'Facility Schematic', path: '/twin', desc: 'Digital Twin › Floor plan', icon: 'twin' },
];
/* ════════════════════════════════════════════════════════════════════ */
export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const cacco = useCacco();
    const { facility, weather, systemHealth, staff, alerts, intel, recommendations, lastUpdate } = cacco;
    const { t, lang, toggleLang } = useT();
    const [collapsed, setCollapsed] = useState(false);
    const [drawer, setDrawer] = useState(null);
    const [now, setNow] = useState(() => new Date());
    const [query, setQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef(null);
    const searchInput = useRef(null);
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
    useEffect(() => {
        const h = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
                searchInput.current?.focus();
            }
            if (e.key === 'Escape') {
                setShowSearch(false);
            }
        };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, []);
    useEffect(() => {
        const h = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
            }
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    const onDuty = useMemo(() => staff.filter((s) => s.status === 'on-duty' || s.status === 'responding').length, [staff]);
    const activeAlerts = useMemo(() => alerts.filter((a) => a.status === 'active' || a.status === 'dispatched').length, [alerts]);
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q)
            return [];
        return SEARCH.filter((s) => (s.label + ' ' + s.desc).toLowerCase().includes(q)).slice(0, 8);
    }, [query]);
    const pageTitle = PAGE_TITLE[location.pathname] ?? 'Command Center';
    return (<div className={`flex h-screen w-screen flex-col overflow-hidden${facility.emergencyActive ? ' emergency-overlay' : ''}`} style={{ background: 'var(--app-bg)' }}>
      <div className="flex flex-1 overflow-hidden">

        {/* ════ SIDEBAR ════ */}
        <aside className="flex shrink-0 flex-col overflow-hidden transition-all duration-200" style={{ width: collapsed ? 64 : 'var(--app-sidebar-w)', background: 'var(--app-panel-2)', borderRight: '1px solid var(--app-border)' }}>
          {/* Brand */}
          <button onClick={() => navigate('/')} className="flex items-center gap-3 px-3.5 shrink-0" style={{ height: 'var(--app-header-h)', borderBottom: '1px solid var(--app-border)' }}>
            <Emblem />
            {!collapsed && (<div className="text-left leading-none">
                <div className="text-[13px] font-extrabold tracking-wide text-app-text">CACCO</div>
                <div className="text-[8.5px] font-bold tracking-[0.22em] text-app-accent mt-1">{t('layout.platform')}</div>
              </div>)}
          </button>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1.5">
            {NAV.map((group) => (<div key={group.label}>
                {!collapsed && <p className="nav-section-label">{t(`nav.group.${group.key}`)}</p>}
                {collapsed && <div className="mx-3 my-2 h-px" style={{ background: 'var(--app-border)' }}/>}
                {group.items.map((item) => {
                const active = location.pathname === item.path;
                const badge = resolveBadge(item.badge, cacco);
                return (<div key={item.path} className="px-2">
                      <button onClick={() => navigate(item.path)} className={`nav-item ${active ? 'active' : ''}`} title={collapsed ? `${item.label} — ${item.description}` : item.description}>
                        <Icon name={item.icon} className="w-[18px] h-[18px] shrink-0"/>
                        {!collapsed && <span className="truncate">{t(`nav.item.${item.key}`)}</span>}
                        {!collapsed && badge && (
                          <span className="ml-auto font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: badge.tone + '22', color: badge.tone }}>
                            {fmtBadge(badge.count)}
                          </span>
                        )}
                      </button>
                    </div>);
            })}
              </div>))}
          </nav>

          {/* Operator block */}
          <div className="shrink-0 p-2.5 space-y-1.5" style={{ borderTop: '1px solid var(--app-border)' }}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold" style={{ background: 'var(--app-accent-bg)', color: 'var(--app-accent)', border: '1px solid var(--app-accent-border)' }}>CO</div>
              {!collapsed && (<div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-bold text-app-text">Cmdr. A. Solano</div>
                  <div className="truncate text-[9px] font-mono" style={{ color: 'var(--app-success)' }}>● CLEARANCE 5 · ON DUTY</div>
                </div>)}
            </div>
            {!collapsed && (<button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors" style={{ color: 'var(--app-text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--app-danger)'; e.currentTarget.style.background = 'var(--app-danger-bg)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--app-text-faint)'; e.currentTarget.style.background = 'transparent'; }} title="Lock session">
                <Icon name="lock" className="w-3.5 h-3.5"/>
                {t('layout.logout')}
              </button>)}
          </div>
        </aside>

        {/* ════ MAIN COLUMN ════ */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* ── HEADER ── */}
          <header className="flex shrink-0 items-center gap-2.5 px-3" style={{ height: 'var(--app-header-h)', background: 'var(--app-panel-2)', borderBottom: '1px solid var(--app-border)' }}>
            <button onClick={() => setCollapsed((c) => !c)} className="icon-btn" title="Toggle sidebar"><Icon name="menu"/></button>

            <div className="hidden md:flex flex-col leading-none mr-1">
              <span className="font-mono text-[9px] tracking-[0.18em] text-app-text-faint">CACCO // {pageTitle.toUpperCase()}</span>
              <span className="text-[13px] font-bold text-app-text mt-1">{pageTitle}</span>
            </div>

            {/* Search */}
            <div ref={searchRef} className="header-search relative ml-1 max-w-xs flex-1 min-w-[140px]">
              <Icon name="search" className="w-3.5 h-3.5 text-app-text-faint shrink-0"/>
              <input ref={searchInput} value={query} placeholder={t('layout.search')} onChange={(e) => { setQuery(e.target.value); setShowSearch(true); }} onFocus={() => setShowSearch(true)} onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) {
        navigate(results[0].path);
        setShowSearch(false);
        setQuery('');
    } }}/>
              {showSearch && query.trim() && (<div className="search-dropdown">
                  {results.length === 0
                ? <div className="search-dropdown-empty">No results for “{query}”</div>
                : results.map((r, i) => (<button key={i} className="search-dropdown-item" onMouseDown={(e) => { e.preventDefault(); navigate(r.path); setShowSearch(false); setQuery(''); }}>
                        <span className="sdi-icon"><Icon name={r.icon} className="w-4 h-4"/></span>
                        <span className="min-w-0 flex-1"><span className="sdi-label block truncate">{r.label}</span><span className="sdi-desc block truncate">{r.desc}</span></span>
                      </button>))}
                </div>)}
            </div>

            <div className="flex-1"/>

            {/* Widgets */}
            <HeaderWidget icon="cloud" hint="Site weather · Liberia, Guanacaste">
              <span className="font-mono font-bold">{weather.tempC}°C</span>
              <span className="text-app-text-faint">{weather.condition}</span>
            </HeaderWidget>

            <HeaderWidget icon="users" hint="Active security personnel on shift">
              <span className="font-mono font-bold text-app-success">{onDuty}</span>
              <span className="text-app-text-faint">{t('layout.onDuty')}</span>
            </HeaderWidget>

            <HeaderWidget icon="activity" hint={`System health · ${systemHealth.servicesOnline}/${systemHealth.servicesTotal} services · ${systemHealth.latencyMs}ms`}>
              <span className="dot dot-pulse" style={{ background: 'var(--app-success)', color: 'var(--app-success)' }}/>
              <span className="font-mono font-bold">{systemHealth.uptimePct}%</span>
            </HeaderWidget>

            {/* Clock */}
            <div className="hidden lg:flex flex-col items-end leading-none px-2 mono">
              <span className="text-[13px] font-bold tracking-wide text-app-text">{clockTime(now)}</span>
              <span className="text-[8.5px] text-app-text-faint mt-1">{clockDate(now).toUpperCase()}</span>
            </div>



            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="icon-btn"
              title={lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', minWidth: 38, padding: '0 8px' }}
            >
              {lang === 'en' ? 'ES' : 'EN'}
            </button>

            {/* Threat intel drawer */}
            <button onClick={() => setDrawer((d) => (d === 'intel' ? null : 'intel'))} className={`icon-btn ${drawer === 'intel' ? 'active' : ''}`} title="Threat Intelligence Feed">
              <Icon name="bell"/>
              {activeAlerts > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-0.5 font-mono text-[9px] font-bold animate-pulse" style={{ background: 'var(--app-danger)', color: '#fff' }}>{activeAlerts}</span>}
            </button>

            {/* AI advisor drawer */}
            <button onClick={() => setDrawer((d) => (d === 'advisor' ? null : 'advisor'))} className="btn" title="AI Operations Advisor" style={{ background: 'var(--app-violet-bg)', color: 'var(--app-violet)', border: '1px solid rgba(155,107,255,0.4)' }}>
              <Icon name="ai" className="w-4 h-4"/><span>{t('layout.advisory')}</span>
            </button>
          </header>


          {/* ── CONTENT ── */}
          <main className="relative flex-1 overflow-y-auto">
            <div className="p-4">{children}</div>
          </main>
        </div>

        {/* ════ DRAWERS ════ */}
        {drawer === 'intel' && (<Drawer title="Threat Intelligence Feed" subtitle={`${intel.length} active assessments`} icon="crosshair" onClose={() => setDrawer(null)} width={380}>
            <div className="mb-3">
              <div className="t-label mb-1.5 px-0.5">Active Security Alerts · {activeAlerts}</div>
              <div className="space-y-1.5">
                {alerts.filter((a) => a.status === 'active' || a.status === 'dispatched').slice(0, 4).map((a) => (<AlertCard key={a.id} alert={a} now={now.getTime()} compact onAck={cacco.acknowledgeAlert}/>))}
              </div>
            </div>
            <div className="t-label mb-1.5 px-0.5">Intelligence Assessments</div>
            <div className="space-y-2.5">
              {intel.map((it) => <IntelCard key={it.id} intel={it} now={now.getTime()}/>)}
            </div>
          </Drawer>)}

        {drawer === 'advisor' && (<Drawer title="S!aP Advisory" subtitle={`${recommendations.length} recommendations`} icon="ai" tone="#8b5cf6" onClose={() => setDrawer(null)} width={420}>
            <div className="space-y-2.5">
              {recommendations.map((r) => <RecommendationCard key={r.id} rec={r} onAction={() => undefined}/>)}
            </div>
          </Drawer>)}
      </div>

      {/* ════ FOOTER (classification bar) ════ */}
      <footer className="flex shrink-0 items-center gap-3 px-4 font-mono" style={{ height: 'var(--app-footer-h)', background: 'var(--app-bg-deep)', borderTop: '1px solid var(--app-border)' }}>
        <span className="classification flex items-center gap-1.5" style={{ color: '#f59e0b' }}>
          <Icon name="lock" className="w-3 h-3"/> RESTRICTED
        </span>
        <span className="hidden md:inline text-[9.5px] text-app-text-faint tracking-wide">
          CACCO Command Platform · Costa Rican Ministry of Justice and Peace
        </span>
        <span className="ml-auto flex items-center gap-3 text-[9.5px] text-app-text-faint">
          <span className="hidden sm:inline">{VERSION}</span>
          <span className="hidden lg:inline">DATA REFRESH {zulu(new Date(lastUpdate))}</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="dot dot-pulse" style={{ background: 'var(--app-success)', color: 'var(--app-success)' }}/>
            SYSTEMS NOMINAL
          </span>
        </span>
      </footer>
    </div>);
}
/* ─── Header widget shell ───────────────────────────────────────────── */
function HeaderWidget({ icon, hint, children }) {
    return (<div className="hidden xl:flex items-center gap-2 rounded-md border border-app-border px-2.5 py-1.5" style={{ background: 'var(--app-bg-deep)' }} title={hint}>
      <Icon name={icon} className="w-3.5 h-3.5 text-app-text-faint"/>
      <div className="flex items-center gap-1.5 text-[10px]">{children}</div>
    </div>);
}
/* ─── Drawer shell ──────────────────────────────────────────────────── */
function Drawer({ title, subtitle, icon, tone = '#38bdf8', width = 380, onClose, children }) {
    return (<div className="drawer animate-slide-left" style={{ width }}>
      <div className="flex items-center gap-2.5 px-4 shrink-0" style={{ height: 'var(--app-header-h)', borderBottom: '1px solid var(--app-border)' }}>
        <span style={{ color: tone }}><Icon name={icon} className="w-4 h-4"/></span>
        <div className="min-w-0 flex-1">
          <h3 className="panel-title truncate">{title}</h3>
          <p className="text-[9.5px] text-app-text-faint mt-0.5">{subtitle}</p>
        </div>
        <Chip tone="danger" className="mr-1"><span className="dot dot-pulse" style={{ background: 'currentColor' }}/>LIVE</Chip>
        <button onClick={onClose} className="icon-btn"><Icon name="close"/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">{children}</div>
    </div>);
}
/* ─── Brand emblem ──────────────────────────────────────────────────── */
function Emblem() {
    return (<div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg,#16314F 0%,#0F1B2B 100%)', border: '1px solid var(--app-accent-border)' }}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="var(--app-accent)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 11v5M12 8v8M15 11v5"/>
      </svg>
    </div>);
}
