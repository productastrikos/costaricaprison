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

/* ─── Profile dropdown ──────────────────────────────────────────────── */
function ProfileDropdown({ onClose, t }) {
  const menuItems = [
    { icon: 'users', labelKey: 'layout.profileUser' },
    { icon: 'bell', labelKey: 'layout.profileNotifications' },
    { icon: 'admin', labelKey: 'layout.profileSettings' },
  ];
  return (
    <div
      className="absolute right-0 top-full mt-1 z-[300] rounded-xl border shadow-2xl overflow-hidden"
      style={{ width: 200, background: 'var(--app-panel-2)', borderColor: 'var(--app-border)' }}
      onClick={e => e.stopPropagation()}
    >
      {/* User info */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--app-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-[11px]"
            style={{ background: 'var(--app-accent-bg)', color: 'var(--app-accent)', border: '1px solid var(--app-accent-border)' }}>
            D
          </div>
          <div>
            <p className="text-[12px] font-bold text-app-text">{t('layout.profileEngineer')}</p>
            <p className="text-[9px] font-mono" style={{ color: 'var(--app-success)' }}>● {t('layout.profileOnline')}</p>
          </div>
        </div>
      </div>
      {/* Menu items */}
      {menuItems.map(({ icon, labelKey }) => (
        <button key={labelKey} onClick={onClose}
          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold transition-colors text-left"
          style={{ color: 'var(--app-text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--app-surface-raised)'; e.currentTarget.style.color = 'var(--app-text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--app-text-faint)'; }}
        >
          <Icon name={icon} className="w-3.5 h-3.5 shrink-0"/>
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}
const VERSION = 'v3.4.1';
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
    const { facility, staff, alerts, intel, recommendations, lastUpdate } = cacco;
    const { t, lang, toggleLang } = useT();
    const [collapsed, setCollapsed] = useState(false);
    const [drawer, setDrawer] = useState(null);
    const [now, setNow] = useState(() => new Date());
    const [query, setQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const searchRef = useRef(null);
    const searchInput = useRef(null);
    const profileRef = useRef(null);
    useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
    useEffect(() => {
        const h = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
                searchInput.current?.focus();
            }
            if (e.key === 'Escape') setShowSearch(false);
        };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, []);
    useEffect(() => {
        const h = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    const onDuty = useMemo(() => staff.filter((s) => s.status === 'on-duty' || s.status === 'responding').length, [staff]);
    const activeAlerts = useMemo(() => alerts.filter((a) => a.status === 'active' || a.status === 'dispatched').length, [alerts]);
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
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
                return (<div key={item.path} className="px-2">
                      <button onClick={() => navigate(item.path)} className={`nav-item ${active ? 'active' : ''}`} title={collapsed ? `${item.label} — ${item.description}` : item.description}>
                        <Icon name={item.icon} className="w-[18px] h-[18px] shrink-0"/>
                        {!collapsed && <span className="truncate">{t(`nav.item.${item.key}`)}</span>}
                      </button>
                    </div>);
            })}
              </div>))}
          </nav>

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
              <input ref={searchInput} value={query} placeholder={t('layout.search')} onChange={(e) => { setQuery(e.target.value); setShowSearch(true); }} onFocus={() => setShowSearch(true)} onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) { navigate(results[0].path); setShowSearch(false); setQuery(''); } }}/>
              {showSearch && query.trim() && (<div className="search-dropdown">
                  {results.length === 0
                ? <div className="search-dropdown-empty">{t('layout.searchNoResults')} "{query}"</div>
                : results.map((r, i) => (<button key={i} className="search-dropdown-item" onMouseDown={(e) => { e.preventDefault(); navigate(r.path); setShowSearch(false); setQuery(''); }}>
                        <span className="sdi-icon"><Icon name={r.icon} className="w-4 h-4"/></span>
                        <span className="min-w-0 flex-1"><span className="sdi-label block truncate">{r.label}</span><span className="sdi-desc block truncate">{r.desc}</span></span>
                      </button>))}
                </div>)}
            </div>

            <div className="flex-1"/>

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
            <button onClick={() => setDrawer((d) => (d === 'intel' ? null : 'intel'))} className={`icon-btn ${drawer === 'intel' ? 'active' : ''}`} title={t('layout.drawerIntelTitle')}>
              <Icon name="bell"/>
              {activeAlerts > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-0.5 font-mono text-[9px] font-bold animate-pulse" style={{ background: 'var(--app-danger)', color: '#fff' }}>{activeAlerts}</span>}
            </button>

            {/* AI advisor drawer */}
            <button onClick={() => setDrawer((d) => (d === 'advisor' ? null : 'advisor'))} className="btn" title={t('cc.aiAdvisor')} style={{ background: 'var(--app-violet-bg)', color: 'var(--app-violet)', border: '1px solid rgba(155,107,255,0.4)' }}>
              <Icon name="ai" className="w-4 h-4"/><span>{t('layout.advisory')}</span>
            </button>

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-[11px] transition-colors"
                style={{ background: 'var(--app-accent-bg)', color: 'var(--app-accent)', border: '1px solid var(--app-accent-border)' }}
                title={t('layout.profileUser')}
              >
                D
              </button>
              {profileOpen && <ProfileDropdown t={t} onClose={() => setProfileOpen(false)}/>}
            </div>
          </header>


          {/* ── CONTENT ── */}
          <main className="relative flex-1 overflow-y-auto">
            <div className="p-4">{children}</div>
          </main>
        </div>

        {/* ════ DRAWERS ════ */}
        {drawer === 'intel' && (<Drawer title={t('layout.drawerIntelTitle')} subtitle={`${intel.length} ${t('layout.drawerIntelSubActive')}`} icon="crosshair" onClose={() => setDrawer(null)} width={380}>
            <div className="mb-3">
              <div className="t-label mb-1.5 px-0.5">{t('layout.drawerIntelAlerts')} · {activeAlerts}</div>
              <div className="space-y-1.5">
                {alerts.filter((a) => a.status === 'active' || a.status === 'dispatched').slice(0, 4).map((a) => (<AlertCard key={a.id} alert={a} now={now.getTime()} compact onAck={cacco.acknowledgeAlert}/>))}
              </div>
            </div>
            <div className="t-label mb-1.5 px-0.5">{t('layout.drawerIntelAssess')}</div>
            <div className="space-y-2.5">
              {intel.map((it) => <IntelCard key={it.id} intel={it} now={now.getTime()}/>)}
            </div>
          </Drawer>)}

        {drawer === 'advisor' && (<Drawer title={t('layout.drawerAdvisory')} subtitle={`${recommendations.length} ${t('layout.drawerAdvisorySubRecs')}`} icon="ai" tone="#8b5cf6" onClose={() => setDrawer(null)} width={420}>
            <div className="space-y-2.5">
              {recommendations.map((r) => <RecommendationCard key={r.id} rec={r} onAction={() => undefined}/>)}
            </div>
          </Drawer>)}
      </div>

      {/* ════ FOOTER (classification bar) ════ */}
      <footer className="flex shrink-0 items-center gap-3 px-4 font-mono" style={{ height: 'var(--app-footer-h)', background: 'var(--app-bg-deep)', borderTop: '1px solid var(--app-border)' }}>
        <span className="classification flex items-center gap-1.5" style={{ color: '#f59e0b' }}>
          <Icon name="lock" className="w-3 h-3"/> {t('layout.footerRestricted')}
        </span>
        <span className="hidden md:inline text-[9.5px] text-app-text-faint tracking-wide">
          {t('layout.footerPlatform')}
        </span>
        <span className="ml-auto flex items-center gap-3 text-[9.5px] text-app-text-faint">
          <span className="hidden sm:inline">{VERSION}</span>
          <span className="hidden lg:inline">{t('layout.footerDataRefresh')} {zulu(new Date(lastUpdate))}</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="dot dot-pulse" style={{ background: 'var(--app-success)', color: 'var(--app-success)' }}/>
            {t('layout.footerNominal')}
          </span>
        </span>
      </footer>
    </div>);
}
/* ─── Drawer shell ──────────────────────────────────────────────────── */
function Drawer({ title, subtitle, icon, tone = '#38bdf8', width = 380, onClose, children }) {
    const { t } = useT();
    return (<div className="drawer animate-slide-left" style={{ width }}>
      <div className="flex items-center gap-2.5 px-4 shrink-0" style={{ height: 'var(--app-header-h)', borderBottom: '1px solid var(--app-border)' }}>
        <span style={{ color: tone }}><Icon name={icon} className="w-4 h-4"/></span>
        <div className="min-w-0 flex-1">
          <h3 className="panel-title truncate">{title}</h3>
          <p className="text-[9.5px] text-app-text-faint mt-0.5">{subtitle}</p>
        </div>
        <Chip tone="danger" className="mr-1"><span className="dot dot-pulse" style={{ background: 'currentColor' }}/>{t('common.live')}</Chip>
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
