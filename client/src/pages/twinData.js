/* ═══════════════════════════════════════════════════════════════════════
   CACCO Digital Twin — Tactical Map Data
   All coordinates are in a 2400×1800 SVG viewBox space.
   ═══════════════════════════════════════════════════════════════════════ */

/* ─── Seeded PRNG ───────────────────────────────────────────────────── */
function rng(seed) {
  let a = seed >>> 0;
  return () => { a ^= a << 13; a ^= a >> 17; a ^= a << 5; return (a >>> 0) / 0x100000000; };
}
const R = rng(20260603);
export const ri  = (lo, hi) => Math.floor(R() * (hi - lo + 1)) + lo;
export const rp  = (arr) => arr[Math.floor(R() * arr.length)];
export const rc  = (p) => R() < p;

export const VW = 2400, VH = 1800;

/* ─── Zone Definitions ──────────────────────────────────────────────── */
export const TWIN_ZONES = [
  // Perimeter
  { id:'PERIM',  label:'Perimeter Security',     short:'PERIM',  kind:'perimeter',   x:20,   y:20,   w:2360, h:1760, risk:'medium', status:'normal',   cap:0,   occ:0,   psnl:20, inc:1  },
  // Admin column (left)
  { id:'ADMIN',  label:'Administration',          short:'ADMIN',  kind:'admin',       x:60,   y:80,   w:230,  h:185,  risk:'low',    status:'normal',   cap:0,   occ:0,   psnl:8,  inc:0  },
  { id:'CTRL',   label:'Control Room',            short:'CTRL',   kind:'control',     x:60,   y:285,  w:230,  h:145,  risk:'low',    status:'normal',   cap:0,   occ:0,   psnl:6,  inc:0  },
  { id:'ENTRY',  label:'Main Entrance',           short:'ENTRY',  kind:'entrance',    x:60,   y:450,  w:230,  h:110,  risk:'medium', status:'normal',   cap:50,  occ:12,  psnl:4,  inc:0  },
  { id:'VISIT',  label:'Visitor Center',          short:'VIS',    kind:'visitor',     x:60,   y:590,  w:230,  h:170,  risk:'medium', status:'normal',   cap:60,  occ:31,  psnl:5,  inc:0  },
  // Secondary column
  { id:'ARMORY', label:'Armory',                  short:'ARM',    kind:'armory',      x:330,  y:80,   w:190,  h:135,  risk:'high',   status:'normal',   cap:0,   occ:0,   psnl:3,  inc:0  },
  { id:'EVID',   label:'Evidence Storage',        short:'EVID',   kind:'storage',     x:330,  y:235,  w:190,  h:110,  risk:'medium', status:'normal',   cap:0,   occ:0,   psnl:2,  inc:0  },
  { id:'CHKPT',  label:'Security Checkpoint',     short:'CHKPT',  kind:'checkpoint',  x:330,  y:365,  w:190,  h:90,   risk:'medium', status:'elevated', cap:0,   occ:0,   psnl:4,  inc:1  },
  // Top-center: max security + isolation
  { id:'MAX',    label:'Maximum Security Wing',   short:'MAX',    kind:'maxsecurity', x:560,  y:80,   w:580,  h:230,  risk:'extreme',status:'critical', cap:90,  occ:81,  psnl:30, inc:3  },
  { id:'ISO',    label:'Isolation Wing',          short:'ISO',    kind:'isolation',   x:1180, y:80,   w:240,  h:230,  risk:'high',   status:'elevated', cap:30,  occ:18,  psnl:8,  inc:1  },
  // Top-right: services
  { id:'KITCH',  label:'Kitchen',                 short:'KITCH',  kind:'services',    x:1470, y:80,   w:250,  h:150,  risk:'low',    status:'normal',   cap:0,   occ:0,   psnl:5,  inc:0  },
  { id:'WKSHP',  label:'Workshop',                short:'WRKSHP', kind:'services',    x:1470, y:250,  w:250,  h:150,  risk:'medium', status:'normal',   cap:40,  occ:22,  psnl:4,  inc:0  },
  // Recreation yard (center)
  { id:'REC',    label:'Recreation Yard',         short:'YRD',    kind:'recreation',  x:560,  y:350,  w:870,  h:310,  risk:'medium', status:'elevated', cap:200, occ:78,  psnl:15, inc:2  },
  // Cell blocks
  { id:'BLK_A',  label:'Cell Block A',            short:'BLK-A',  kind:'cellblock',   x:60,   y:800,  w:460,  h:380,  risk:'medium', status:'normal',   cap:150, occ:138, psnl:18, inc:1  },
  { id:'BLK_B',  label:'Cell Block B',            short:'BLK-B',  kind:'cellblock',   x:570,  y:800,  w:460,  h:380,  risk:'high',   status:'critical', cap:150, occ:149, psnl:22, inc:4  },
  { id:'BLK_C',  label:'Cell Block C',            short:'BLK-C',  kind:'cellblock',   x:1080, y:800,  w:460,  h:380,  risk:'medium', status:'elevated', cap:140, occ:121, psnl:18, inc:2  },
  // Right side services
  { id:'MAINT',  label:'Laundry & Maintenance',   short:'MAINT',  kind:'maintenance', x:1590, y:690,  w:270,  h:210,  risk:'low',    status:'normal',   cap:0,   occ:0,   psnl:3,  inc:0  },
  // Bottom row
  { id:'MED',    label:'Medical Center',          short:'MED',    kind:'medical',     x:60,   y:1260, w:380,  h:290,  risk:'low',    status:'normal',   cap:45,  occ:19,  psnl:10, inc:0  },
  { id:'INTAKE', label:'Intake & Processing',     short:'INTAKE', kind:'intake',      x:490,  y:1260, w:290,  h:290,  risk:'low',    status:'normal',   cap:30,  occ:12,  psnl:6,  inc:0  },
  { id:'REHAB',  label:'Rehabilitation Center',   short:'REHAB',  kind:'rehab',       x:830,  y:1260, w:360,  h:290,  risk:'low',    status:'normal',   cap:80,  occ:47,  psnl:8,  inc:0  },
  // Vehicle gate
  { id:'VGATE',  label:'Vehicle Gate',            short:'V-GATE', kind:'gate',        x:920,  y:1700, w:320,  h:60,   risk:'high',   status:'normal',   cap:0,   occ:0,   psnl:4,  inc:0  },
];

/* ─── Guard towers ──────────────────────────────────────────────────── */
export const GUARD_TOWERS = [
  { id:'GT-NW', x:20,   y:20,   label:'Tower NW' },
  { id:'GT-NE', x:2340, y:20,   label:'Tower NE' },
  { id:'GT-SW', x:20,   y:1740, label:'Tower SW' },
  { id:'GT-SE', x:2340, y:1740, label:'Tower SE' },
];

/* ─── Cell blocks ───────────────────────────────────────────────────── */
function buildCells(zId, x, y, w, h, rows, cols) {
  const cw = (w - 20) / cols, ch = (h - 40) / rows;
  return Array.from({ length: rows * cols }, (_, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const statusPool = ['occ','occ','occ','occ','empty','empty', rc(.05)?'iso':rc(.04)?'med':'occ'];
    return {
      id: `${zId}-C${String(i+1).padStart(3,'0')}`,
      zId, r, c, num: i + 1,
      x: x + 10 + c * cw, y: y + 32 + r * ch, w: cw - 2, h: ch - 2,
      status: rp(statusPool),
      inmateId: `CR-${ri(1001,1520)}`,
    };
  });
}

export const CELL_BLOCKS = {
  MAX:   buildCells('MAX',   560,  80,  580, 230,  9, 10),
  ISO:   buildCells('ISO',  1180,  80,  240, 230,  6,  5),
  BLK_A: buildCells('BLK_A',  60, 800,  460, 380, 10, 10),
  BLK_B: buildCells('BLK_B', 570, 800,  460, 380, 10, 10),
  BLK_C: buildCells('BLK_C',1080, 800,  460, 380, 10, 10),
};

export const CELL_FILL   = { occ:'#112240', empty:'#070c11', iso:'#2a1200', med:'#081c10' };
export const CELL_STROKE = { occ:'#1e4070', empty:'#0e1620', iso:'#b56000', med:'#0e6040' };

/* ─── Guards ────────────────────────────────────────────────────────── */
const FN = ['Carlos','José','Luis','Miguel','Diego','Andrés','Fernando','Javier','Roberto','Eduardo','Wílmer','Yeison','Kevin','Bryan','Greivin','Mauricio'];
const LN = ['Vargas','Jiménez','Rodríguez','González','Mora','Castro','Rojas','Soto','Alvarado','Núñez','Cordero','Solís','Brenes','Picado','Ramírez','Chacón'];
const gname = () => `${rp(FN)} ${rp(LN)}`;
const DEPLOYABLE = TWIN_ZONES.filter(z => z.kind !== 'perimeter' && z.kind !== 'gate');

export function buildGuards(count = 54) {
  return Array.from({ length: count }, (_, i) => {
    const z = rp(DEPLOYABLE);
    return {
      id: `GRD-${String(i+1).padStart(3,'0')}`,
      name: gname(), badge: `OFR-${200+i}`,
      x: z.x + ri(14, z.w - 14), y: z.y + ri(14, z.h - 14),
      zId: z.id, assignment: z.label,
      status: rp(['duty','duty','duty','respond','break']),
      radioStatus: rp(['active','active','active','silent']),
      shift: rp(['Alpha','Alpha','Bravo']),
      clearance: ri(2,4),
    };
  });
}

/* ─── Inmate transit positions ──────────────────────────────────────── */
const TRANSIT_KINDS = ['recreation','intake','rehab','medical','visitor'];
const TRANSIT_ZONES = TWIN_ZONES.filter(z => TRANSIT_KINDS.includes(z.kind));

export const INMATE_POSITIONS = Array.from({ length: 36 }, (_, i) => {
  const z = rp(TRANSIT_ZONES);
  return {
    id: `IP-${i}`, inmateId: `CR-${ri(1001,1520)}`,
    x: z.x + ri(16, z.w - 16), y: z.y + ri(16, z.h - 16),
    zId: z.id,
    risk: rp(['low','med','med','high','extreme']),
  };
});

export const RISK_CLR = { low:'#10b981', med:'#f59e0b', high:'#f97316', extreme:'#ef4444' };

/* ─── Doors ─────────────────────────────────────────────────────────── */
export const DOORS = [
  { id:'D01', label:'Main Entrance Gate',    x:175,  y:455,  status:'locked',   kind:'gate',  horiz:true  },
  { id:'D02', label:'Admin → Control',       x:175,  y:283,  status:'unlocked', kind:'door',  horiz:true  },
  { id:'D03', label:'Admin → Entrance',      x:175,  y:448,  status:'locked',   kind:'door',  horiz:true  },
  { id:'D04', label:'MAX Wing Entry',        x:560,  y:195,  status:'locked',   kind:'sec',   horiz:false },
  { id:'D05', label:'MAX → REC Corridor',    x:720,  y:350,  status:'locked',   kind:'sec',   horiz:true  },
  { id:'D06', label:'ISO Wing Entry',        x:1180, y:195,  status:'locked',   kind:'sec',   horiz:false },
  { id:'D07', label:'Block A Main Entry',    x:60,   y:1000, status:'locked',   kind:'sec',   horiz:false },
  { id:'D08', label:'Block B Main Entry',    x:570,  y:1000, status:'forced',   kind:'sec',   horiz:false },
  { id:'D09', label:'Block C Main Entry',    x:1080, y:1000, status:'locked',   kind:'sec',   horiz:false },
  { id:'D10', label:'Medical Wing Entry',    x:248,  y:1260, status:'unlocked', kind:'door',  horiz:false },
  { id:'D11', label:'Armory Security Door',  x:425,  y:148,  status:'locked',   kind:'sec',   horiz:true  },
  { id:'D12', label:'REC → Block B',         x:800,  y:800,  status:'locked',   kind:'sec',   horiz:true  },
  { id:'D13', label:'Vehicle Gate',          x:1080, y:1700, status:'locked',   kind:'gate',  horiz:true  },
  { id:'D14', label:'Checkpoint Gate',       x:425,  y:408,  status:'unlocked', kind:'sec',   horiz:true  },
];

export const DOOR_CLR = {
  locked:'#38bdf8', unlocked:'#10b981', forced:'#ef4444', tampered:'#f59e0b', offline:'#526278',
};

/* ─── Sensors ───────────────────────────────────────────────────────── */
const SENSOR_TYPES = ['motion','motion','thermal','door','smoke','metal'];

export function buildSensors() {
  const sensors = []; let n = 1;
  TWIN_ZONES.filter(z => z.kind !== 'perimeter').forEach(z => {
    const cnt = z.kind === 'maxsecurity' ? 8 : z.kind === 'cellblock' ? 6 : 3;
    for (let i = 0; i < cnt; i++) {
      sensors.push({
        id: `SEN-${String(n++).padStart(3,'0')}`,
        type: rp(SENSOR_TYPES),
        x: z.x + ri(12, z.w - 12), y: z.y + ri(12, z.h - 12),
        zId: z.id, status: rc(.05) ? 'fault' : 'active',
        battery: ri(55, 100), last: `${ri(1,45)}m ago`,
      });
    }
  });
  // Perimeter fence sensors
  for (let i = 0; i < 20; i++) {
    const side = i < 5 ? 'N' : i < 10 ? 'E' : i < 15 ? 'S' : 'W';
    const x = side==='N'||side==='S' ? 100 + i * 110 : (side==='E' ? 2370 : 28);
    const y = side==='E'||side==='W' ? 80 + i * 85  : (side==='N' ? 25   : 1775);
    sensors.push({
      id: `FEN-${String(i+1).padStart(2,'0')}`, type:'fence',
      x: Math.min(x, 2380), y: Math.min(y, 1790),
      zId:'PERIM', status: i === 8 ? 'triggered' : 'active',
      battery: 100, last: `${ri(1,120)}m ago`,
    });
  }
  return sensors;
}

export const SEN_CLR = {
  motion:'#38bdf8', thermal:'#f59e0b', door:'#10b981',
  smoke:'#ef4444', metal:'#8b5cf6', fence:'#f97316',
};
export const SEN_ST_CLR = { active:'#10b981', fault:'#ef4444', triggered:'#f97316' };

/* ─── Cameras ───────────────────────────────────────────────────────── */
export function buildCameras() {
  const cams = []; let n = 1;
  TWIN_ZONES.filter(z => z.kind !== 'perimeter').forEach(z => {
    const cnt = z.kind==='maxsecurity' ? 10 : z.kind==='cellblock' ? 8 : 4;
    for (let i = 0; i < cnt; i++) {
      cams.push({
        id: `CAM-${String(n++).padStart(3,'0')}`,
        label: `${z.short} CAM ${i+1}`,
        x: z.x + (i % 2 === 0 ? 12 : z.w - 12),
        y: z.y + ri(12, z.h - 12),
        angle: ri(0, 360), fov: 65,
        range: z.kind==='maxsecurity' ? 100 : 70,
        zId: z.id, online: !rc(.05),
        flags: rc(.3) ? ri(1,4) : 0,
        recording: true,
      });
    }
  });
  return cams;
}

/* ─── Active incidents on map ───────────────────────────────────────── */
export const MAP_INCIDENTS = [
  { id:'MI-1', type:'Fight Detected',    x:710,  y:930,  sev:'high',     zId:'BLK_B', status:'active'     },
  { id:'MI-2', type:'Weapon Detected',   x:700,  y:175,  sev:'critical', zId:'MAX',   status:'active'     },
  { id:'MI-3', type:'Gathering',         x:910,  y:490,  sev:'moderate', zId:'REC',   status:'monitoring' },
  { id:'MI-4', type:'Perimeter Breach',  x:1300, y:25,   sev:'high',     zId:'PERIM', status:'dispatched' },
  { id:'MI-5', type:'Contraband Found',  x:350,  y:910,  sev:'moderate', zId:'BLK_A', status:'monitoring' },
];
export const INC_CLR = { critical:'#ef4444', high:'#f97316', moderate:'#f59e0b', low:'#38bdf8' };

/* ─── AI Predictions ────────────────────────────────────────────────── */
export const AI_PREDICTIONS = [
  { id:'AIP-1', type:'Potential Fight',       x:790, y:960, prob:73, conf:68, zId:'BLK_B', win:'45 min'  },
  { id:'AIP-2', type:'Gang Gathering Risk',   x:970, y:470, prob:61, conf:72, zId:'REC',   win:'2 hrs'   },
  { id:'AIP-3', type:'Escape Attempt Risk',   x:1300,y:950, prob:42, conf:55, zId:'BLK_C', win:'6 hrs'   },
];

/* ─── Heatmap datasets ──────────────────────────────────────────────── */
export const HEATMAP_DATA = {
  occupancy:     { MAX:.90, BLK_A:.92, BLK_B:.99, BLK_C:.86, REC:.39, ISO:.60, MED:.42, INTAKE:.40, VISIT:.52, REHAB:.59, PERIM:.1  },
  violence_risk: { MAX:.85, BLK_A:.45, BLK_B:.78, BLK_C:.52, REC:.61, ISO:.70, MED:.10, INTAKE:.15, VISIT:.30, REHAB:.18, PERIM:.35 },
  contraband:    { MAX:.60, BLK_A:.70, BLK_B:.55, BLK_C:.45, REC:.40, ISO:.30, MED:.05, INTAKE:.25, VISIT:.65, REHAB:.20, PERIM:.15 },
  gang_activity: { MAX:.75, BLK_A:.55, BLK_B:.80, BLK_C:.50, REC:.70, ISO:.40, MED:.05, INTAKE:.10, VISIT:.40, REHAB:.15, PERIM:.20 },
};

/* ─── Timeline events ───────────────────────────────────────────────── */
const EVT_T = ['Fight','Weapon','Gathering','Contraband','Perimeter Alert','Medical Response','Gate Opened','Headcount Complete','Cell Search','Zone Lockdown','Patrol Dispatch','Camera Alert'];
export const TIMELINE_EVENTS = Array.from({ length: 55 }, (_, i) => {
  const z = rp(TWIN_ZONES.filter(z => z.kind !== 'perimeter'));
  return {
    id: `EVT-${1000+i}`, type: rp(EVT_T),
    zone: z.label, zId: z.id,
    sev: rp(['critical','high','moderate','low']),
    t: new Date(Date.now() - ri(1, 480) * 60000),
    ack: rc(.55),
  };
}).sort((a, b) => b.t - a.t);

/* ─── Color helpers ─────────────────────────────────────────────────── */
export const STATUS_HEX  = { normal:'#10b981', elevated:'#f59e0b', critical:'#ef4444' };
export const STATUS_FILL = {
  normal:   'rgba(16,185,129,0.07)',
  elevated: 'rgba(245,158,11,0.09)',
  critical: 'rgba(239,68,68,0.11)',
};

export function zoneLayerColor(z, layer) {
  if (layer === 'status')    return STATUS_HEX[z.status] || '#38bdf8';
  if (layer === 'occupancy') { const p = z.cap > 0 ? z.occ / z.cap : 0; return p>.95?'#ef4444':p>.85?'#f59e0b':p>.5?'#38bdf8':'#10b981'; }
  if (layer === 'incidents') return z.inc>=3?'#ef4444':z.inc>=1?'#f59e0b':'#10b981';
  if (layer === 'personnel') return '#38bdf8';
  return '#38bdf8';
}

export function zoneMetric(z, layer) {
  if (layer === 'occupancy') return z.cap > 0 ? `${Math.round(z.occ/z.cap*100)}%` : '—';
  if (layer === 'incidents') return `${z.inc} inc`;
  if (layer === 'personnel') return `${z.psnl}`;
  return z.cap > 0 ? `${z.occ}/${z.cap}` : '—';
}
