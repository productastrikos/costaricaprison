/* ════════════════════════════════════════════════════════════════════
   CACCO Command Platform — Operational Data Provider
   Holds the live snapshot, drives the continuously-updating alert
   stream, and recomputes alert-dependent KPIs in real time.
   ════════════════════════════════════════════════════════════════════ */
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { INMATES, STAFF, ZONES, CAMERAS, PROGRAMS, TEAMS, RECOMMENDATIONS, WEATHER, SYSTEM_HEALTH, FACILITY, seedAlerts, makeAlert, buildIntel, buildIncidents, buildKpis, } from '../data/mockData';
const CaccoContext = createContext(null);
const STREAM_INTERVAL_MS = 9000;
const MAX_STREAM = 40;
export function CaccoProvider({ children }) {
    const now0 = useRef(Date.now()).current;
    const [alerts, setAlerts] = useState(() => seedAlerts(now0));
    const [kpis, setKpis] = useState(() => buildKpis(seedAlerts(now0)));
    const [securityLevel, setSecLevel] = useState(FACILITY.securityLevel);
    const [lastUpdate, setLastUpdate] = useState(now0);
    const [streamPaused, setStreamPaused] = useState(false);
    // Static (heavy) collections built once
    const intel = useMemo(() => buildIntel(now0), [now0]);
    const incidents = useMemo(() => buildIncidents(now0), [now0]);
    // Continuously-updating live alert stream
    useEffect(() => {
        if (streamPaused)
            return undefined;
        const handle = setInterval(() => {
            const ts = Date.now();
            setAlerts((prev) => [makeAlert(ts), ...prev].slice(0, MAX_STREAM));
            setLastUpdate(ts);
        }, STREAM_INTERVAL_MS);
        return () => clearInterval(handle);
    }, [streamPaused]);
    // Recompute only the alert-dependent KPI when the stream changes (stable sparklines)
    useEffect(() => {
        const active = alerts.filter((a) => a.status === 'active' || a.status === 'dispatched').length;
        setKpis((prev) => prev.map((k) => k.id === 'k-alerts'
            ? {
                ...k,
                value: active,
                deltaPct: k.previous === 0 ? 0 : +(((active - k.previous) / k.previous) * 100).toFixed(1),
                trend: active > k.previous ? 'up' : active < k.previous ? 'down' : 'flat',
                rag: active >= 5 ? 'critical' : active >= 3 ? 'warning' : 'normal',
            }
            : k));
    }, [alerts]);
    const value = useMemo(() => ({
        kpis,
        zones: ZONES,
        inmates: INMATES,
        staff: STAFF,
        alerts,
        intel,
        recommendations: RECOMMENDATIONS,
        incidents,
        cameras: CAMERAS,
        programs: PROGRAMS,
        teams: TEAMS,
        weather: WEATHER,
        systemHealth: SYSTEM_HEALTH,
        facility: { ...FACILITY, securityLevel },
        lastUpdate,
        acknowledgeAlert: (id) => setAlerts((p) => p.map((a) => (a.id === id ? { ...a, acknowledged: true, status: 'monitoring' } : a))),
        dismissAlert: (id) => setAlerts((p) => p.filter((a) => a.id !== id)),
        acknowledgeAll: () => setAlerts((p) => p.map((a) => ({ ...a, acknowledged: true }))),
        setSecurityLevel: setSecLevel,
        streamPaused,
        toggleStream: () => setStreamPaused((s) => !s),
    }), [kpis, alerts, intel, incidents, securityLevel, lastUpdate, streamPaused]);
    return <CaccoContext.Provider value={value}>{children}</CaccoContext.Provider>;
}
export function useCacco() {
    const ctx = useContext(CaccoContext);
    if (!ctx)
        throw new Error('useCacco must be used within a CaccoProvider');
    return ctx;
}
