/* ─── Seeded PRNG (mulberry32) ──────────────────────────────────────── */
function rng(seed) {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const R = rng(74168255);
const int = (lo, hi) => Math.floor(R() * (hi - lo + 1)) + lo;
const pick = (arr) => arr[Math.floor(R() * arr.length)];
const chance = (p) => R() < p;
const weighted = (entries) => {
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = R() * total;
    for (const [v, w] of entries) {
        if ((r -= w) <= 0)
            return v;
    }
    return entries[0][0];
};
const spark = (base, vary, n = 16) => Array.from({ length: n }, (_, i) => Math.max(0, +(base + Math.sin(i * 0.6) * vary + (R() - 0.5) * vary).toFixed(1)));
/* ─── Name pools (Latin American) ───────────────────────────────────── */
const FIRST = ['Carlos', 'José', 'Luis', 'Juan', 'Miguel', 'Diego', 'Andrés', 'Fernando', 'Ricardo',
    'Javier', 'Roberto', 'Eduardo', 'Mauricio', 'Alejandro', 'Sergio', 'Óscar', 'Raúl', 'Hernán',
    'Emilio', 'Gustavo', 'Rodrigo', 'Iván', 'Néstor', 'Tomás', 'Marco', 'Pablo', 'Esteban', 'Wílmer',
    'Yeison', 'Bryan', 'Kevin', 'Dylan', 'Greivin', 'Maikel'];
const LAST = ['Vargas', 'Jiménez', 'Rodríguez', 'González', 'Hernández', 'Mora', 'Castro', 'Rojas',
    'Soto', 'Alvarado', 'Núñez', 'Cordero', 'Quesada', 'Solís', 'Chacón', 'Montero', 'Salazar',
    'Vega', 'Araya', 'Brenes', 'Calderón', 'Espinoza', 'Fuentes', 'Guzmán', 'Lobo', 'Murillo',
    'Obando', 'Picado', 'Ramírez', 'Sánchez', 'Zúñiga', 'Medina', 'Ortega', 'Peña'];
const fullName = () => `${pick(FIRST)} ${pick(LAST)} ${pick(LAST)}`;
const NATIONALITIES = [
    ['Costa Rica', 46], ['Colombia', 14], ['México', 10], ['Venezuela', 9],
    ['El Salvador', 7], ['Honduras', 6], ['Nicaragua', 5], ['Guatemala', 3],
];
const INMATE_FLAGS = ['Escape Risk', 'Violence History', 'Contraband History',
    'Repeat Offender', 'Witness Protection', 'External Comms', 'Hunger Strike Risk',
    'Assault on Staff', 'Smuggling Network', 'Mental Health Watch'];
const ZONE_SEEDS = [
    { id: 'MAX', name: 'Maximum Security Wing', code: 'MSW', kind: 'maxsecurity', capacity: 90, residents: 81, risk: 'extreme', geo: { x: 15, y: 8, w: 70, h: 13 } },
    { id: 'BLK-A', name: 'Cell Block A', code: 'A', kind: 'cellblock', capacity: 150, residents: 138, risk: 'medium', geo: { x: 8, y: 26, w: 24, h: 22 } },
    { id: 'BLK-B', name: 'Cell Block B', code: 'B', kind: 'cellblock', capacity: 150, residents: 149, risk: 'high', geo: { x: 38, y: 26, w: 24, h: 22 } },
    { id: 'BLK-C', name: 'Cell Block C', code: 'C', kind: 'cellblock', capacity: 140, residents: 121, risk: 'medium', geo: { x: 68, y: 26, w: 24, h: 22 } },
    { id: 'REC', name: 'Recreation Yard', code: 'YRD', kind: 'recreation', capacity: 200, residents: 0, risk: 'medium', geo: { x: 15, y: 52, w: 70, h: 9 } },
    { id: 'MED', name: 'Medical Wing', code: 'MED', kind: 'medical', capacity: 45, residents: 19, risk: 'low', geo: { x: 8, y: 66, w: 26, h: 22 } },
    { id: 'INT', name: 'Intake & Processing', code: 'INT', kind: 'intake', capacity: 30, residents: 12, risk: 'low', geo: { x: 40, y: 66, w: 20, h: 22 } },
    { id: 'VIS', name: 'Visitor Processing Area', code: 'VIS', kind: 'visitor', capacity: 60, residents: 0, risk: 'low', geo: { x: 66, y: 66, w: 26, h: 22 } },
    { id: 'PER', name: 'Perimeter Security', code: 'PER', kind: 'perimeter', capacity: 0, residents: 0, risk: 'medium', geo: { x: 2, y: 2, w: 96, h: 92 } },
];
/* ─── Inmate generation ─────────────────────────────────────────────── */
const RESIDENTIAL = ZONE_SEEDS.filter((z) => z.residents > 0);
function buildInmates() {
    const out = [];
    let serial = 1001;
    for (const z of RESIDENTIAL) {
        const isMax = z.kind === 'maxsecurity';
        for (let i = 0; i < z.residents; i++) {
            const risk = isMax
                ? weighted([['extreme', 6], ['high', 3], ['medium', 1]])
                : z.risk === 'high'
                    ? weighted([['extreme', 1], ['high', 4], ['medium', 4], ['low', 1]])
                    : weighted([['extreme', 0.4], ['high', 2], ['medium', 5], ['low', 3]]);
            const CRIME_MAX = ['Homicide', 'Organized Crime', 'Drug Trafficking', 'Kidnapping', 'Armed Robbery', 'Sexual Violence'];
            const CRIME_GEN = ['Assault', 'Drug Offenses', 'Theft & Robbery', 'Fraud', 'Domestic Violence', 'Property Crime', 'Trafficking'];
            const crimeCategory = isMax ? pick(CRIME_MAX) : pick(CRIME_GEN);
            const custodyLevel = { extreme: 'Level I', high: 'Level II', medium: 'Level III', low: 'Level IV' }[risk];
            const threatBase = { extreme: 82, high: 64, medium: 42, low: 22 }[risk];
            const threatScore = Math.min(99, Math.max(5, threatBase + int(-9, 12)));
            const flags = [];
            if (risk === 'extreme' && chance(0.5))
                flags.push('Escape Risk');
            if (chance(0.25))
                flags.push(pick(INMATE_FLAGS));
            if (chance(0.18))
                flags.push(pick(INMATE_FLAGS));
            out.push({
                id: `CR-${serial++}`,
                name: fullName(),
                age: int(19, 58),
                nationality: weighted(NATIONALITIES),
                crimeCategory,
                custodyLevel,
                risk,
                threatScore,
                zoneId: z.id,
                cell: `${z.code}-${int(1, 4)}${String(int(1, 48)).padStart(2, '0')}`,
                status: weighted([['general', 80], ['segregation', 6], ['medical', 4], ['protective', 4], ['transit', 3], ['court', 3]]),
                sentenceYears: int(4, 45),
                admittedDaysAgo: int(20, 2100),
                flags: Array.from(new Set(flags)),
                associates: [],
                lastIncidentDaysAgo: chance(0.4) ? int(0, 180) : null,
            });
        }
    }
    // Build intelligence-graph edges within shared crime categories
    const byCrime = new Map();
    out.forEach((m) => {
        const arr = byCrime.get(m.crimeCategory) ?? [];
        arr.push(m);
        byCrime.set(m.crimeCategory, arr);
    });
    out.forEach((m) => {
        const peers = byCrime.get(m.crimeCategory);
        if (!peers || peers.length < 3)
            return;
        const n = int(0, 3);
        for (let i = 0; i < n; i++) {
            const peer = peers[Math.floor(R() * peers.length)];
            if (peer.id !== m.id && !m.associates.includes(peer.id))
                m.associates.push(peer.id);
        }
    });
    // Guarantee a named, profiled subject referenced by the AI advisor
    out[47] = { ...out[47], id: 'CR-2048', name: 'Maikel Otárola Vega', risk: 'extreme', threatScore: 91, custodyLevel: 'Level I', crimeCategory: 'Organized Crime', flags: ['Escape Risk', 'External Comms', 'Violence History'] };
    return out;
}
export const INMATES = buildInmates();
/* ─── Zones (occupancy derived from actual inmate assignment) ────────── */
export const ZONES = ZONE_SEEDS.map((z) => {
    const occ = z.kind === 'visitor' ? 31 : z.kind === 'recreation' ? 0 : z.kind === 'perimeter' ? 0
        : INMATES.filter((m) => m.zoneId === z.id).length;
    const loadPct = z.capacity > 0 ? occ / z.capacity : 0;
    const incidents24h = z.kind === 'maxsecurity' ? int(2, 5) : z.kind === 'cellblock' ? int(0, 4) : int(0, 2);
    const status = z.kind === 'perimeter'
        ? 'normal'
        : loadPct > 0.97 || incidents24h >= 4 ? 'critical'
            : loadPct > 0.85 || incidents24h >= 2 ? 'elevated' : 'normal';
    const personnel = z.kind === 'maxsecurity' ? int(26, 34) : z.kind === 'cellblock' ? int(14, 22)
        : z.kind === 'perimeter' ? int(18, 24) : int(4, 10);
    return {
        id: z.id, name: z.name, code: z.code, kind: z.kind,
        capacity: z.capacity, occupancy: occ, incidents24h, risk: z.risk,
        assignedPersonnel: personnel, status, geo: z.geo,
    };
});
const zoneName = (id) => ZONES.find((z) => z.id === id)?.name ?? id;
const STATUS_ZONES = ZONES.filter((z) => ['MAX', 'BLK-A', 'BLK-B', 'BLK-C', 'MED', 'VIS'].includes(z.id));
export { STATUS_ZONES };
/* ─── Staff generation ──────────────────────────────────────────────── */
const ROLE_MIX = [
    ['Security Officer', 67], ['Response Team', 22], ['Surveillance Operator', 17],
    ['Intelligence Analyst', 12], ['Medical', 14], ['Case Manager', 13],
    ['Maintenance', 4], ['Director', 1],
];
// Total: 67+22+17+12+14+13+4+1 = 150
function buildStaff() {
    const out = [];
    let badge = 100;
    ROLE_MIX.forEach(([role, count]) => {
        for (let i = 0; i < count; i++) {
            const shift = pick(['Alpha', 'Bravo', 'Charlie']);
            out.push({
                id: `STF-${String(out.length + 1).padStart(3, '0')}`,
                name: fullName(),
                role,
                badge: `OFR-${badge++}`,
                shift,
                zoneId: role === 'Director' || role === 'Intelligence Analyst' ? null : pick(STATUS_ZONES).id,
                status: shift === 'Alpha'
                    ? weighted([['on-duty', 70], ['responding', 6], ['break', 14], ['off-duty', 10]])
                    : weighted([['off-duty', 64], ['leave', 10], ['on-duty', 22], ['break', 4]]),
                clearance: role === 'Director' ? 5 : role === 'Intelligence Analyst' ? 4 : role === 'Response Team' ? 4 : int(2, 3),
                yearsService: int(1, 24),
            });
        }
    });
    return out;
}
export const STAFF = buildStaff();
/* ─── Live security alerts ──────────────────────────────────────────── */
const ALERT_ACTIONS = {
    'Fight Detected': 'Dispatch response team · isolate combatants',
    'Unauthorized Gathering': 'Disperse · verify counts · review CCTV',
    'Medical Emergency': 'Medical team to location · clear corridor',
    'Contraband Discovery': 'Secure evidence · search adjacent cells',
    'Perimeter Alert': 'Perimeter patrol verify · review fence sensors',
    'Visitor Security Violation': 'Detain visitor · suspend processing line',
    'Suspicious Movement': 'Surveillance track · flag subject',
    'Cell Block Lockdown': 'Confirm lockdown · headcount · hold movement',
    'Weapon Detected': 'Armed response · lock down sector',
    'Communication Intercept': 'Intelligence review · trace network',
};
const TEAM_CALLSIGNS = ['Halcón-1', 'Halcón-2', 'Cobra', 'Centinela', 'Médico-1', 'Perímetro-3'];
const threatFor = (cat) => ({
    'Fight Detected': 'high', 'Unauthorized Gathering': 'moderate', 'Medical Emergency': 'high',
    'Contraband Discovery': 'moderate', 'Perimeter Alert': 'high', 'Visitor Security Violation': 'moderate',
    'Suspicious Movement': 'low', 'Cell Block Lockdown': 'critical', 'Weapon Detected': 'critical',
    'Communication Intercept': 'moderate',
}[cat]);
let ALERT_SERIAL = 4400;
export function makeAlert(now) {
    const category = pick(Object.keys(ALERT_ACTIONS));
    const zone = pick(STATUS_ZONES.concat(ZONES.filter((z) => z.id === 'PER' || z.id === 'REC')));
    const threat = threatFor(category);
    return {
        id: `ALT-${ALERT_SERIAL++}`,
        category,
        threat,
        zoneId: zone.id,
        location: `${zone.name} · Sector ${pick(['1', '2', '3', '4'])}`,
        responseTeam: pick(TEAM_CALLSIGNS),
        status: weighted([['active', 5], ['dispatched', 3], ['monitoring', 2]]),
        requiredAction: ALERT_ACTIONS[category],
        createdAtMs: now,
        acknowledged: false,
        source: pick(['AI-CCTV', 'Officer Report', 'Sensor Grid', 'Biometric Gate', 'Intel Desk']),
    };
}
export function seedAlerts(now) {
    const presets = [
        ['Cell Block Lockdown', 'BLK-B', 'active', 3],
        ['Fight Detected', 'BLK-B', 'dispatched', 8],
        ['Contraband Discovery', 'BLK-A', 'contained', 17],
        ['Weapon Detected', 'MAX', 'active', 24],
        ['Unauthorized Gathering', 'REC', 'monitoring', 33],
        ['Medical Emergency', 'MED', 'resolved', 41],
        ['Perimeter Alert', 'PER', 'dispatched', 52],
        ['Visitor Security Violation', 'VIS', 'contained', 68],
        ['Suspicious Movement', 'BLK-C', 'monitoring', 79],
        ['Communication Intercept', 'MAX', 'active', 96],
    ];
    return presets.map(([category, zoneId, status, minsAgo], i) => ({
        id: `ALT-${4300 + i}`,
        category,
        threat: threatFor(category),
        zoneId,
        location: `${zoneName(zoneId)} · Sector ${(i % 4) + 1}`,
        responseTeam: TEAM_CALLSIGNS[i % TEAM_CALLSIGNS.length],
        status,
        requiredAction: ALERT_ACTIONS[category],
        createdAtMs: now - minsAgo * 60000,
        acknowledged: status === 'resolved' || status === 'contained',
        source: pick(['AI-CCTV', 'Officer Report', 'Sensor Grid', 'Biometric Gate', 'Intel Desk']),
    }));
}
/* ─── Threat intelligence feed ──────────────────────────────────────── */
export function buildIntel(now) {
    const items = [
        { category: 'Behavioral Pattern', title: 'Coordinated high-risk inmate activity surge in Block B', source: 'Behavioral AI', severity: 'high', zoneId: 'BLK-B', confidence: 87, recommendedResponse: 'Increase surveillance coverage · review association clusters in the wing', detail: 'Network analysis shows 14 new association edges forming around known high-threat subjects over 72h.', mins: 12 },
        { category: 'Contraband Intelligence', title: 'Probable mobile-device cache — Block A tier 3', source: 'Signal Sweep', severity: 'moderate', zoneId: 'BLK-A', confidence: 73, recommendedResponse: 'Schedule unannounced cell search · RF triangulation', detail: 'Three unauthorized 4G signatures detected during 02:00–04:00 window across two nights.', mins: 26 },
        { category: 'Behavioral Anomaly', title: 'Elevated aggression markers — subject CR-2048', source: 'Predictive Model', severity: 'high', zoneId: 'MAX', confidence: 81, recommendedResponse: 'Order psychological evaluation · review visitation logs', detail: 'Movement, association and commissary patterns deviate +2.7σ from 30-day baseline.', mins: 44 },
        { category: 'Visitor Risk Assessment', title: 'Flagged visitor linked to external syndicate', source: 'Intel Desk', severity: 'moderate', zoneId: 'VIS', confidence: 69, recommendedResponse: 'Enhanced screening · assign discreet escort', detail: 'Visitor identity matches watchlist entry associated with smuggling logistics.', mins: 58 },
        { category: 'Perimeter Security', title: 'Repeated fence-sensor triggers — north line', source: 'Sensor Grid', severity: 'moderate', zoneId: 'PER', confidence: 64, recommendedResponse: 'Physical patrol verification · drone overflight', detail: 'Sector 7 vibration sensors tripped 5× in 6h; weather ruled out as cause.', mins: 71 },
        { category: 'Communication Network', title: 'Coordinated commissary timing across blocks', source: 'Pattern Analysis', severity: 'low', zoneId: 'BLK-C', confidence: 58, recommendedResponse: 'Monitor · correlate with movement logs', detail: 'Synchronized purchasing suggests a courier signalling scheme under evaluation.', mins: 95 },
    ];
    return items.map((it, i) => ({
        ...it,
        id: `INT-${920 + i}`,
        affectedZone: zoneName(it.zoneId),
        createdAtMs: now - it.mins * 60000,
    }));
}
/* ─── AI operations advisor ─────────────────────────────────────────── */
export const RECOMMENDATIONS = [
    { id: 'AIR-001', priority: 'high', category: 'Patrol Posture', zoneId: 'BLK-B', title: 'Increase patrol frequency in Cell Block B', reasoning: 'Occupancy at 99% with 4 incidents in 24h and rising behavioral risk indicators. Incident probability model projects +38% likelihood of disturbance this shift.', suggestedAction: 'Add one roving patrol pair on 20-minute cycles; stage Response Team Cobra at Sally Port 2.', expectedOutcome: 'Projected 30–40% reduction in disturbance likelihood within the shift.', confidence: 88 },
    { id: 'AIR-002', priority: 'medium', category: 'Capacity Planning', zoneId: 'BLK-B', title: 'Potential overcrowding risk projected within 14 days', reasoning: 'Intake trend (+1.4%/wk) against current residential capacity crosses the 100% line in Block B in ~12 days at present transfer cadence.', suggestedAction: 'Approve 18 transfers from Block B to Block C; expedite 6 pending classification reviews.', expectedOutcome: 'Restores 8% headroom; defers capacity breach beyond 30-day horizon.', confidence: 76 },
    { id: 'AIR-003', priority: 'critical', category: 'Behavioral Health', zoneId: 'MAX', title: 'Recommend psychological evaluation for inmate CR-2048', reasoning: 'Behavioral telemetry for CR-2048 deviates +2.7σ from baseline; threat score climbed 91 from 78 in 30 days with new external-comms flag.', suggestedAction: 'Order priority psychological evaluation; restrict visitation pending review; brief Block intel officer.', expectedOutcome: 'Early de-escalation; intelligence on emerging leadership transition.', confidence: 84 },
    { id: 'AIR-004', priority: 'high', category: 'Behavioral Intelligence', zoneId: 'REC', title: 'Elevated conflict risk indicators detected in Recreation Yard', reasoning: 'Clustering analysis of yard CCTV shows three high-risk inmate groups congregating during the 14:00 rotation — a precursor pattern to prior altercations.', suggestedAction: 'Stagger yard rotation by housing assignment; add elevated-post observer; pre-position medical.', expectedOutcome: 'Reduces proximity of conflicting subjects; lowers altercation risk during high-density window.', confidence: 80 },
    { id: 'AIR-005', priority: 'medium', category: 'Perimeter', zoneId: 'PER', title: 'Correlate north-line sensor triggers with drone sweep', reasoning: 'Recurring Sector 7 fence triggers without confirmed cause; pattern resembles pre-breach probing observed at peer facilities.', suggestedAction: 'Task UAV overflight for next two nights during 02:00–04:00; increase thermal camera gain.', expectedOutcome: 'Confirms or clears intrusion hypothesis; deters probing activity.', confidence: 71 },
];
/* ─── Incidents ─────────────────────────────────────────────────────── */
export function buildIncidents(now) {
    const types = ['Assault', 'Contraband', 'Riot Risk', 'Medical', 'Escape Attempt', 'Self-Harm', 'Disturbance', 'Property Damage'];
    const stages = ['reported', 'investigating', 'response', 'review', 'closed'];
    const out = [];
    for (let i = 0; i < 16; i++) {
        const type = i < 8 ? types[i] : pick(types);
        const zone = pick(STATUS_ZONES.concat(ZONES.filter((z) => z.id === 'REC')));
        const severity = weighted([['critical', 2], ['high', 4], ['moderate', 4], ['low', 2]]);
        const stage = i < 4 ? stages[i % stages.length] : pick(stages);
        const involved = INMATES.filter(() => chance(0.004)).slice(0, int(1, 3)).map((m) => m.id);
        out.push({
            id: `INC-${5200 + i}`,
            type,
            severity,
            zoneId: zone.id,
            stage,
            reportedAtMs: now - int(20, 5200) * 60000,
            commander: pick(STAFF.filter((s) => s.role === 'Response Team' || s.role === 'Security Officer')).name,
            involvedInmates: involved.length ? involved : [pick(INMATES).id],
            summary: incidentSummary(type, zone.name),
            responseTeam: pick(TEAM_CALLSIGNS),
            casualties: severity === 'critical' ? int(0, 3) : chance(0.2) ? 1 : 0,
        });
    }
    return out.sort((a, b) => b.reportedAtMs - a.reportedAtMs);
}
function incidentSummary(type, zone) {
    const map = {
        Assault: `Physical altercation between inmates in ${zone}; combatants separated.`,
        Contraband: `Prohibited items recovered during search in ${zone}.`,
        'Riot Risk': `Coordinated agitation detected in ${zone}; elevated to riot-risk protocol.`,
        Medical: `Medical response required in ${zone}; subject stabilized.`,
        'Escape Attempt': `Attempted breach from ${zone}; subject contained.`,
        'Self-Harm': `Self-harm event in ${zone}; medical and mental-health engaged.`,
        Disturbance: `Verbal disturbance escalating in ${zone}; de-escalation applied.`,
        'Property Damage': `Fixture damage reported in ${zone}; maintenance dispatched.`,
    };
    return map[type];
}
/* ─── Surveillance cameras ──────────────────────────────────────────── */
export const CAMERAS = ZONES.filter((z) => z.kind !== 'perimeter').flatMap((z) => Array.from({ length: z.kind === 'maxsecurity' ? 10 : z.kind === 'cellblock' ? 8 : 5 }, (_, i) => ({
    id: `CAM-${z.code}-${String(i + 1).padStart(2, '0')}`,
    label: `${z.code} Cam ${i + 1}`,
    zoneId: z.id,
    online: !chance(0.05),
    aiFlags: chance(0.3) ? int(1, 4) : 0,
    fps: pick([24, 25, 30]),
}))).concat(Array.from({ length: 12 }, (_, i) => ({
    id: `CAM-PER-${String(i + 1).padStart(2, '0')}`,
    label: `Perimeter Cam ${i + 1}`,
    zoneId: 'PER',
    online: !chance(0.03),
    aiFlags: chance(0.2) ? int(1, 2) : 0,
    fps: 30,
})));
/* ─── Rehabilitation programs ───────────────────────────────────────── */
export const PROGRAMS = [
    { id: 'PRG-01', name: 'Adult Basic Education', category: 'Education', enrolled: 86, capacity: 120, completionRate: 64, facilitator: 'Dra. Solís' },
    { id: 'PRG-02', name: 'Vocational Carpentry', category: 'Vocational', enrolled: 42, capacity: 48, completionRate: 71, facilitator: 'Ing. Mora' },
    { id: 'PRG-03', name: 'Cognitive Behavioral Therapy', category: 'Psychological', enrolled: 58, capacity: 80, completionRate: 55, facilitator: 'Dr. Vega' },
    { id: 'PRG-04', name: 'Substance Recovery', category: 'Substance', enrolled: 64, capacity: 90, completionRate: 49, facilitator: 'Lic. Rojas' },
    { id: 'PRG-05', name: 'Reintegration Pathway', category: 'Reintegration', enrolled: 31, capacity: 40, completionRate: 78, facilitator: 'Lic. Brenes' },
    { id: 'PRG-06', name: 'Agricultural Skills', category: 'Vocational', enrolled: 38, capacity: 60, completionRate: 67, facilitator: 'Ing. Castro' },
    { id: 'PRG-07', name: 'Conflict De-escalation', category: 'Psychological', enrolled: 47, capacity: 60, completionRate: 61, facilitator: 'Dra. Núñez' },
];
/* ─── Response teams ────────────────────────────────────────────────── */
export const TEAMS = [
    { id: 'RT-1', callsign: 'Halcón-1', members: 6, status: 'standby', zoneId: 'MAX', readiness: 98 },
    { id: 'RT-2', callsign: 'Halcón-2', members: 6, status: 'deployed', zoneId: 'BLK-B', readiness: 84 },
    { id: 'RT-3', callsign: 'Cobra', members: 8, status: 'responding', zoneId: 'BLK-B', readiness: 71 },
    { id: 'RT-4', callsign: 'Centinela', members: 5, status: 'standby', zoneId: 'PER', readiness: 95 },
    { id: 'RT-5', callsign: 'Médico-1', members: 4, status: 'standby', zoneId: 'MED', readiness: 100 },
];
/* ─── Header widgets ────────────────────────────────────────────────── */
export const WEATHER = { tempC: 27, condition: 'Partly Cloudy', windKph: 12, humidity: 78 };
export const SYSTEM_HEALTH = { uptimePct: 99.7, servicesOnline: 41, servicesTotal: 42, latencyMs: 38, status: 'normal' };
export const FACILITY = { securityLevel: 3, emergencyActive: false, emergencyLabel: 'NO ACTIVE EMERGENCY', lockdownZones: 1 };
/* ─── Derived strategic KPIs ────────────────────────────────────────── */
export function buildKpis(alerts) {
    const totalInmates = INMATES.length;
    const residentialCap = RESIDENTIAL.reduce((s, z) => s + z.capacity, 0);
    const occupancyPct = Math.round((totalInmates / residentialCap) * 100);
    const onDuty = STAFF.filter((s) => s.status === 'on-duty' || s.status === 'responding').length;
    const activeAlerts = alerts.filter((a) => a.status === 'active' || a.status === 'dispatched').length;
    const highRisk = INMATES.filter((m) => m.risk === 'high' || m.risk === 'extreme').length;
    const threatIndex = Math.round(INMATES.reduce((s, m) => s + m.threatScore, 0) / INMATES.length + 4);
    const mk = (id, label, value, previous, rag, opts = {}) => {
        const deltaPct = previous === 0 ? 0 : +(((value - previous) / previous) * 100).toFixed(1);
        const trend = value > previous ? 'up' : value < previous ? 'down' : 'flat';
        return { id, label, value, previous, deltaPct, trend, rag, spark: spark(value, value * 0.04), ...opts };
    };
    return [
        mk('k-inmates',   'Total Inmates',          totalInmates,  totalInmates - 3,          'normal',                                                                              { hint: 'Active custody population' }),
        mk('k-occupancy', 'Facility Occupancy',      occupancyPct,  occupancyPct - 1,          occupancyPct > 90 ? 'critical' : occupancyPct > 85 ? 'warning' : 'normal',           { unit: '%', hint: 'Population vs residential capacity' }),
        mk('k-alerts',    'Active Security Alerts',  activeAlerts,  Math.max(0, activeAlerts - 2), activeAlerts >= 5 ? 'critical' : activeAlerts >= 3 ? 'warning' : 'normal',      { inverted: true, hint: 'Unresolved live events' }),
        mk('k-highrisk',  'High-Risk Inmates',       highRisk,      highRisk - 5,              highRisk > 180 ? 'warning' : 'normal',                                               { inverted: true, hint: 'Risk ≥ High classification' }),
    ];
}
