export const NAV = [
    {
        label: 'Command', key: 'Command',
        items: [
            { path: '/', label: 'Command Center', key: 'commandCenter', icon: 'command', description: 'Facility-wide operational nerve center', badge: 'alerts' },
        ],
    },
    {
        label: 'Operations', key: 'Operations',
        items: [
            { path: '/security', label: 'Security Operations', key: 'securityOps', icon: 'shield', description: 'Posture, response teams, lockdowns, sally ports', badge: 'lockdown' },
            { path: '/surveillance', label: 'Surveillance Center', key: 'surveillance', icon: 'surveillance', description: 'CCTV grid & AI video analytics', badge: 'cameras' },
            { path: '/incidents', label: 'Incident Management', key: 'incidents', icon: 'incident', description: 'Case lifecycle from report to review', badge: 'incidents' },
        ],
    },
    {
        label: 'Intelligence', key: 'Intelligence',
        items: [
            { path: '/intelligence', label: 'Inmate Intelligence', key: 'inmateIntel', icon: 'intel', description: 'Population profiling & association graph', badge: 'extreme' },
            { path: '/analytics', label: 'AI Analytics', key: 'aiAnalytics', icon: 'ai', description: 'Predictive models & threat forecasting', badge: 'recs' },
        ],
    },
    {
        label: 'Facility', key: 'Facility',
        items: [
            { path: '/staff', label: 'Staff Operations', key: 'staffOps', icon: 'staff', description: 'Personnel roster, shifts & deployment' },
            { path: '/rehabilitation', label: 'Rehabilitation Programs', key: 'rehab', icon: 'rehab', description: 'Education, vocational & psychological tracks' },
            { path: '/twin', label: 'Digital Twin', key: 'twin', icon: 'twin', description: 'Live schematic facility model' },
        ],
    },
    {
        label: 'Governance', key: 'Governance',
        items: [
            { path: '/reports', label: 'Reports & Compliance', key: 'reports', icon: 'reports', description: 'Audit, statutory reporting & exports' },
            { path: '/admin', label: 'System Administration', key: 'admin', icon: 'admin', description: 'Access control, integrations & health' },
        ],
    },
];
export const NAV_FLAT = NAV.flatMap((g) => g.items);
export const PAGE_TITLE = Object.fromEntries(NAV_FLAT.map((i) => [i.path, i.label]));
