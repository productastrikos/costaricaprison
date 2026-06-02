/* ════════════════════════════════════════════════════════════════════
   CACCO — Surveillance & Security Intelligence Center
   CCTV Grid · AI Detection Engine · Perimeter Intelligence
   Incident Correlation · Threat Escalation · Thermal Analytics
   ════════════════════════════════════════════════════════════════════ */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCacco } from '../services/CaccoData';
import {
  Panel, MetricCard, Chip, PageHeader, KV, Dot, Meter,
  SectionLabel, Segmented, Ring,
} from '../components/ui';
import { Icon } from '../components/Icon';

/* ─── Seeded PRNG for deterministic initial data ─────────────────── */
function mkrng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SR  = mkrng(0xCACC0B01);
const si  = (lo, hi) => Math.floor(SR() * (hi - lo + 1)) + lo;
const sp  = (arr)    => arr[Math.floor(SR() * arr.length)];

/* ═══════════════════ STATIC CATALOGUE DATA ══════════════════════════ */

const DET_TYPES = [
  { code:'FIGHT', label:'Fight Detection',             sev:'critical', base:88, col:'#ef4444' },
  { code:'WEAP',  label:'Weapon Detection',            sev:'critical', base:95, col:'#ef4444' },
  { code:'GANG',  label:'Gang Assembly',               sev:'critical', base:90, col:'#ef4444' },
  { code:'FENC',  label:'Fence Climbing',              sev:'critical', base:92, col:'#ef4444' },
  { code:'GURD',  label:'Guard Distress Event',        sev:'critical', base:96, col:'#ef4444' },
  { code:'UENT',  label:'Unauthorized Entry',          sev:'critical', base:83, col:'#ef4444' },
  { code:'FIRE',  label:'Fire Detection',              sev:'critical', base:98, col:'#ef4444' },
  { code:'AGGR',  label:'Aggressive Behavior',         sev:'high',     base:71, col:'#f59e0b' },
  { code:'GATH',  label:'Unauthorized Gathering',      sev:'high',     base:67, col:'#f59e0b' },
  { code:'DOOR',  label:'Cell Door Tampering',         sev:'high',     base:73, col:'#f59e0b' },
  { code:'MED',   label:'Medical Emergency',           sev:'high',     base:77, col:'#f59e0b' },
  { code:'CTRB',  label:'Contraband Exchange',         sev:'high',     base:76, col:'#f59e0b' },
  { code:'CRWD',  label:'Abnormal Crowd Formation',    sev:'high',     base:68, col:'#f59e0b' },
  { code:'RACC',  label:'Restricted Area Access',      sev:'high',     base:72, col:'#f59e0b' },
  { code:'RUN',   label:'Running — Restricted Zone',   sev:'high',     base:64, col:'#f59e0b' },
  { code:'SMOK',  label:'Smoke Detection',             sev:'high',     base:70, col:'#f59e0b' },
  { code:'SOBJ',  label:'Suspicious Object',           sev:'moderate', base:54, col:'#38bdf8' },
  { code:'VISV',  label:'Visitor Screening Violation', sev:'moderate', base:52, col:'#38bdf8' },
  { code:'FALL',  label:'Fall Detection',              sev:'moderate', base:57, col:'#38bdf8' },
  { code:'NACT',  label:'Unusual Night Activity',      sev:'moderate', base:61, col:'#38bdf8' },
];

const DET_ACTIONS = {
  FIGHT:'Dispatch response team · Isolate combatants · Medical standby',
  WEAP: 'Armed response · Sector lockdown · Notify command',
  GANG: 'Intel alert · Separation protocol · Document assembly',
  FENC: 'Perimeter lockdown · Pursuit protocol · Tower engagement',
  GURD: 'Emergency response · Buddy check · Command notification',
  UENT: 'Access denial · Detain subject · Audit access logs',
  FIRE: 'Full emergency protocol · Facility lockdown · Fire service alert',
  AGGR: 'Officer intervention · Document behavior · Alert supervisor',
  GATH: 'Disperse group · Verify headcount · Cross-reference associates',
  DOOR: 'Lockdown cell · Physical inspection · Document for review',
  MED:  'Medical team dispatch · Clear corridor · Document patient ID',
  CTRB: 'Detain subjects · Evidence collection · Cell search order',
  CRWD: 'Crowd dispersal · Headcount · Request additional officers',
  RACC: 'Access denial · Subject ID · Escort to authorized area',
  RUN:  'Track subject · Announce restriction · Verify purpose',
  SMOK: 'Fire protocol · Evacuate area · Investigate source',
  SOBJ: 'Isolate area · EOD assessment · Evidence collection',
  VISV: 'Suspend visitor · Security escort · Flag for intelligence',
  FALL: 'Medical assessment · Check for cause · Document conditions',
  NACT: 'Review CCTV history · Night patrol verify · Log incident',
};

const DET_STATUS_OPT   = ['Detecting','Verifying','Confirmed','Responding','Resolved'];
const DET_STATUS_COLOR = {
  Detecting:'#f59e0b', Verifying:'#38bdf8',
  Confirmed:'#ef4444', Responding:'#8b5cf6', Resolved:'#10b981',
};
const RESP_TEAMS = ['Halcón-1','Halcón-2','Cobra','Centinela','Médico-1','Perímetro-3'];

/* ─── 16 display-camera locations ───────────────────────────────── */
const CAM_LOCS = [
  'Maximum Security Wing · Sector A', 'Cell Block A · Main Corridor',
  'Cell Block B · Recreation Access', 'Visitor Screening Hall',
  'Medical Wing · Ward 2',            'Perimeter East · Fence Line',
  'Perimeter West · Fence Line',      'Administration Entrance',
  'Guard Checkpoint Alpha',           'Recreation Yard · North',
  'Recreation Yard · South',          'Central Kitchen',
  'Workshop Bay 1',                   'Control Corridor C4',
  'Isolation Unit · Level 2',         'Vehicle Access Gate',
];

/* ─── Zone gradient by zone ID ───────────────────────────────────── */
const ZONE_GRAD = {
  MAX:      'linear-gradient(135deg,#1a0808 0%,#2d1111 100%)',
  'BLK-A':  'linear-gradient(135deg,#080f18 0%,#0d1e2f 100%)',
  'BLK-B':  'linear-gradient(135deg,#091218 0%,#0d2230 100%)',
  'BLK-C':  'linear-gradient(135deg,#081018 0%,#0f1d2b 100%)',
  MED:      'linear-gradient(135deg,#0a1a0f 0%,#122b18 100%)',
  VIS:      'linear-gradient(135deg,#0d1018 0%,#142030 100%)',
  REC:      'linear-gradient(135deg,#121008 0%,#231e10 100%)',
  INT:      'linear-gradient(135deg,#0f1018 0%,#1c1f30 100%)',
  PER:      'linear-gradient(135deg,#080c10 0%,#101824 100%)',
};

/* ─── Perimeter zone definitions ─────────────────────────────────── */
const PERIM_ZONES = [
  {
    id:'north', label:'North Perimeter', abbr:'N',
    fence:[12,11], thermal:[4,4], motion:[6,5], towers:[2,2], drones:[1,1],
    status:'alert', risk:'high', aiScore:74, intrusions:3,
    lastEvent:'5× fence triggers — Sector 7 — last 6h',
    aiNote:'Repeated sub-threshold vibrations on Sector 7 consistent with probing activity. Pattern aligns with pre-breach reconnaissance observed at peer facilities.',
  },
  {
    id:'east', label:'East Perimeter', abbr:'E',
    fence:[14,13], thermal:[5,5], motion:[4,4], towers:[1,1], drones:[1,0],
    status:'normal', risk:'moderate', aiScore:28, intrusions:0,
    lastEvent:'Animal heat signature — 02:14',
    aiNote:'Low-level anomaly detected. Animal origin confirmed by thermal classification. No human signatures present. UAV offline for scheduled maintenance.',
  },
  {
    id:'south', label:'South Perimeter', abbr:'S',
    fence:[10,10], thermal:[3,2], motion:[5,5], towers:[2,2], drones:[0,0],
    status:'normal', risk:'low', aiScore:12, intrusions:0,
    lastEvent:'Routine patrol — all clear',
    aiNote:'Perimeter secure. One thermal camera offline for scheduled maintenance. Guard patrol coverage confirmed and nominal. No threats identified.',
  },
  {
    id:'west', label:'West Perimeter', abbr:'W',
    fence:[11,11], thermal:[4,4], motion:[4,3], towers:[2,1], drones:[1,1],
    status:'caution', risk:'moderate', aiScore:46, intrusions:1,
    lastEvent:'Unknown heat signature — 23:41',
    aiNote:'Unclassified heat signature recorded near loading bay. Vehicle movement logged outside perimeter 23:38–23:44. Second tower position unoccupied. Follow-up required.',
  },
];

/* ─── Thermal detections ─────────────────────────────────────────── */
const THERMAL_DATA = [
  { id:'THM-001', ts:'02:14:33', zone:'North · Sector 7',  type:'Human Detection',        temp:36.7, conf:89, move:'Stationary → Retreating', cls:'critical', note:'Subject approached fence then retreated. Consistent with probing behavior. Recommend immediate patrol verification.' },
  { id:'THM-002', ts:'01:58:12', zone:'West · Loading Bay', type:'Vehicle Detection',      temp:82.4, conf:94, move:'Slow approach — stopped',   cls:'high',     note:'Vehicle parked 40m from perimeter. No authorized vehicles scheduled 23:00–06:00 window.' },
  { id:'THM-003', ts:'23:41:07', zone:'East · Sector 3',   type:'Animal Detection',        temp:38.1, conf:76, move:'Erratic — crossing',        cls:'low',      note:'Small animal, likely canid. Not classified as security threat. No action required.' },
  { id:'THM-004', ts:'22:19:55', zone:'North · Sector 4',  type:'Unknown Heat Signature',  temp:41.2, conf:62, move:'Intermittent',              cls:'high',     note:'Recurrent thermal bloom without visual confirmation. May indicate equipment fault or concealed heat source.' },
  { id:'THM-005', ts:'21:03:22', zone:'South · Sector 2',  type:'Human Detection',         temp:36.4, conf:97, move:'Authorized patrol route',   cls:'low',      note:'Confirmed guard patrol. Routine movement pattern. No action required.' },
];

/* ─── Incident correlations ──────────────────────────────────────── */
const CORRELATIONS = [
  {
    id:'COR-001', title:'Organized Disturbance — Block B', sev:'critical', score:91,
    linked:[
      { type:'Fight Detection',       zone:'Block B · Sector 2',    ts:'14:23:15', conf:96 },
      { type:'Unauthorized Gathering',zone:'Block B · Corridor 3',  ts:'14:19:08', conf:88 },
      { type:'Gang Assembly',         zone:'Block B · Recreation',  ts:'14:15:31', conf:82 },
      { type:'Contraband Exchange',   zone:'Block B · Cell 3-14',   ts:'13:58:44', conf:73 },
    ],
    areas:['Block B','Recreation Yard'], inmates:['CR-2048','CR-1247','CR-1883','CR-2103'],
    prediction:'Escalation to block-wide disturbance within 45 minutes if not contained.',
    action:'Immediate lockdown Block B · Deploy Cobra & Halcón-2 · Medical standby · Notify command staff',
  },
  {
    id:'COR-002', title:'Perimeter Breach Reconnaissance', sev:'high', score:78,
    linked:[
      { type:'Fence Climbing',          zone:'North Perimeter · Sector 7', ts:'02:14:33', conf:89 },
      { type:'Unusual Night Activity',  zone:'North Perimeter · Sector 6', ts:'02:09:17', conf:74 },
      { type:'Unauthorized Gathering',  zone:'Maximum Security Wing',      ts:'23:44:02', conf:67 },
    ],
    areas:['North Perimeter','Maximum Security Wing'], inmates:['CR-2048'],
    prediction:'Possible coordinated escape attempt within 24–72 hours.',
    action:'Immediate UAV overflight · Increase north perimeter patrol · Review CR-2048 communications · Intel desk notification',
  },
  {
    id:'COR-003', title:'Internal Contraband Network', sev:'high', score:71,
    linked:[
      { type:'Contraband Exchange',        zone:'Block A · Cell 2-07',    ts:'11:32:44', conf:78 },
      { type:'Visitor Screening Violation',zone:'Visitor Processing',      ts:'10:15:22', conf:69 },
      { type:'Restricted Area Access',     zone:'Block A · Tier 3',       ts:'09:58:11', conf:71 },
    ],
    areas:['Block A','Visitor Processing Area'], inmates:['CR-1103','CR-1558'],
    prediction:'Active contraband distribution network operating across Block A tiers.',
    action:'Unannounced cell search Block A tiers 2–4 · Enhanced visitor screening · RF signal sweep',
  },
  {
    id:'COR-004', title:'Medical Crisis — Maximum Security', sev:'moderate', score:58,
    linked:[
      { type:'Fall Detection',     zone:'MAX · Cell MSW-47',   ts:'08:44:19', conf:94 },
      { type:'Medical Emergency',  zone:'MAX · Cell Corridor', ts:'08:46:02', conf:91 },
    ],
    areas:['Maximum Security Wing'], inmates:['CR-1892'],
    prediction:'Inmate requires immediate medical intervention. Possible self-harm event.',
    action:'Médico-1 respond immediately · Secure corridor · Psychological evaluation post-stabilization',
  },
];

/* ─── Threat level scale ─────────────────────────────────────────── */
const THREAT_LEVELS = [
  { idx:0, code:'GREEN',  label:'NORMAL',             color:'#10b981', description:'Facility operating within normal parameters. No immediate threats identified.' },
  { idx:1, code:'YELLOW', label:'HEIGHTENED',          color:'#eab308', description:'Elevated threat indicators present. Increased monitoring and patrol density required.' },
  { idx:2, code:'ORANGE', label:'HIGH ALERT',          color:'#f97316', description:'Active security threats confirmed. Response teams deployed. Command staff notified.' },
  { idx:3, code:'RED',    label:'CRITICAL INCIDENT',   color:'#ef4444', description:'Major security incident in progress. All response units engaged. External agencies on standby.' },
  { idx:4, code:'BLACK',  label:'FACILITY EMERGENCY',  color:'#c084fc', description:'Facility-wide emergency declared. Maximum response posture. External agencies activated.' },
];

/* ─── AI architecture stack ──────────────────────────────────────── */
const AI_STACK = [
  { name:'YOLOv12',    status:'active',  role:'Object & Pose Detection',      ver:'12.1.4' },
  { name:'DeepSORT',   status:'active',  role:'Multi-Object Tracking',        ver:'2.3.1'  },
  { name:'OpenCV',     status:'active',  role:'Video Pre-processing',         ver:'4.9.0'  },
  { name:'DeepStream', status:'active',  role:'GPU Stream Pipeline',          ver:'6.4'    },
  { name:'TensorRT',   status:'active',  role:'Inference Acceleration',       ver:'8.6.1'  },
  { name:'ONVIF',      status:'active',  role:'Camera Protocol Integration',  ver:'21.12'  },
  { name:'FaceRec',    status:'standby', role:'Facial Recognition Module',    ver:'3.2.0'  },
  { name:'LPR',        status:'standby', role:'License Plate Recognition',    ver:'2.1.0'  },
];

/* ─── Zone risk predictions ──────────────────────────────────────── */
const ZONE_PREDS = [
  { zone:'Cell Block B',          risk:78, trend:'up',   reason:'Occupancy 99% · 4 incidents in 24h · Elevated tension indicators' },
  { zone:'North Perimeter',       risk:74, trend:'up',   reason:'5× fence triggers unresolved · Probing pattern match · No confirmed cause' },
  { zone:'Maximum Security Wing', risk:64, trend:'up',   reason:'CR-2048 behavioral anomaly +2.7σ · Active weapon alert · External comms flag' },
  { zone:'Recreation Yard',       risk:52, trend:'flat', reason:'High-risk group clustering at 14:00 rotation · Prior altercation pattern match' },
  { zone:'Cell Block A',          risk:41, trend:'down', reason:'Contraband sweep completed · Tension indicators declining post-search' },
  { zone:'Visitor Processing',    risk:35, trend:'flat', reason:'Flagged visitor detained · Enhanced screening active · No new anomalies' },
];

/* ════════════════════ HELPERS ════════════════════════════════════════ */

const threatColor = (s) => s >= 76 ? '#ef4444' : s >= 51 ? '#f59e0b' : s >= 21 ? '#38bdf8' : '#10b981';
const threatLabel = (s) => s >= 76 ? 'CRITICAL' : s >= 51 ? 'HIGH' : s >= 21 ? 'MODERATE' : 'LOW';
const sevColor    = (v) => ({ critical:'#ef4444', high:'#f59e0b', moderate:'#38bdf8', low:'#10b981' }[v] ?? '#666');
const perimColor  = (v) => ({ alert:'#ef4444', caution:'#f97316', normal:'#10b981' }[v] ?? '#666');
const fmtTs       = (ms) => { const d = new Date(ms); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`; };

/* ─── Detection factory ──────────────────────────────────────────── */
let _serial = 7000;
function makeDetection(cameras, now) {
  const type   = DET_TYPES[Math.floor(Math.random() * DET_TYPES.length)];
  const camIdx = Math.floor(Math.random() * Math.min(cameras.length, 16));
  const cam    = cameras[camIdx] ?? cameras[0];
  return {
    id: `DET-${_serial++}`,
    ts: now,
    label: type.label,
    sev: type.sev,
    col: type.col,
    cameraId: cam.id,
    location: CAM_LOCS[camIdx % CAM_LOCS.length],
    threatScore: Math.min(99, Math.max(5, type.base + Math.floor((Math.random() - 0.5) * 22))),
    confidence: Math.min(99, Math.max(52, 70 + Math.floor(Math.random() * 28))),
    action: DET_ACTIONS[type.code],
    team: RESP_TEAMS[Math.floor(Math.random() * RESP_TEAMS.length)],
    status: (() => { const r = Math.random(); return r < 0.22 ? 'Responding' : r < 0.44 ? 'Confirmed' : r < 0.7 ? 'Verifying' : 'Detecting'; })(),
  };
}
function seedDetections(cameras, now) {
  const picks = [0,7,12,4,9,2,14,6,1,11];
  return picks.map((ti, i) => {
    const type   = DET_TYPES[ti % DET_TYPES.length];
    const camIdx = si(0, Math.min(cameras.length - 1, 15));
    return {
      id: `DET-${6900 + i}`,
      ts: now - si(30, 900) * 1000,
      label: type.label,
      sev: type.sev,
      col: type.col,
      cameraId: cameras[camIdx]?.id ?? 'CAM-A-01',
      location: CAM_LOCS[camIdx % CAM_LOCS.length],
      threatScore: Math.min(99, Math.max(5, type.base + si(-10, 10))),
      confidence: si(62, 97),
      action: DET_ACTIONS[type.code],
      team: sp(RESP_TEAMS),
      status: sp(DET_STATUS_OPT.slice(0, 4)),
    };
  });
}

/* ════════════════════ SUB-COMPONENTS ════════════════════════════════ */

function ThreatBar({ score, height = 5, showLabel = false }) {
  const col = threatColor(score);
  return (
    <div className="flex items-center gap-2">
      <div style={{ flex:1, height, background:'var(--app-bg-deep)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ width:`${score}%`, height:'100%', background:col, borderRadius:3, boxShadow:`0 0 6px ${col}66`, transition:'width 0.5s ease' }}/>
      </div>
      {showLabel && (
        <span className="font-mono text-[9px] font-bold shrink-0" style={{ color:col, minWidth:66 }}>
          {threatLabel(score)} {score}
        </span>
      )}
    </div>
  );
}

function CamCell({ cam, idx, selected, onSelect }) {
  const grad = ZONE_GRAD[cam.zoneId] ?? ZONE_GRAD['BLK-A'];
  return (
    <button
      onClick={onSelect}
      className="group relative overflow-hidden rounded-lg border transition-all text-left w-full"
      style={{
        borderColor: selected ? '#38bdf8' : cam.aiFlags > 0 ? '#f59e0b66' : cam.online ? '#1e3248' : '#ef444444',
        boxShadow: selected ? '0 0 0 1px #38bdf866,0 0 16px #38bdf820' : cam.aiFlags > 0 ? '0 0 10px #f59e0b18' : 'none',
        background: grad,
      }}
    >
      <div className="relative" style={{ paddingTop:'56.25%' }}>
        {/* Scanlines */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.11]"
          style={{ backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.5) 2px,rgba(0,0,0,0.5) 4px)' }}/>
        {/* Camera ID */}
        <span className="absolute left-1.5 top-1.5 font-mono text-[7.5px] font-bold text-white/50 tracking-widest">{cam.id}</span>
        {/* Top-right status */}
        <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
          {cam.aiFlags > 0 && (
            <span className="rounded px-1 py-px font-mono text-[7px] font-bold"
              style={{ background:'#f59e0b1a', color:'#f59e0b', border:'1px solid #f59e0b44' }}>
              AI⚠{cam.aiFlags}
            </span>
          )}
          <Dot color={cam.online ? '#10b981' : '#ef4444'} pulse={cam.online} size={5}/>
        </div>
        {/* Location */}
        <div className="absolute bottom-1 left-1.5 right-8">
          <p className="font-mono text-[7px] text-white/35 truncate uppercase tracking-wider">
            {CAM_LOCS[idx % CAM_LOCS.length].split('·')[0].trim()}
          </p>
        </div>
        {/* FPS */}
        <span className="absolute bottom-1 right-1.5 font-mono text-[7px]" style={{ color: cam.online ? '#10b98166' : '#ef444466' }}>
          {cam.online ? `${cam.fps}fps` : 'OFFLINE'}
        </span>
        {/* REC badge */}
        {cam.online && <span className="absolute left-1.5 bottom-5 font-mono text-[6.5px] font-bold" style={{ color:'#ef444477' }}>● REC</span>}
        {/* Offline overlay */}
        {!cam.online && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background:'rgba(0,0,0,0.62)' }}>
            <Icon name="surveillance" className="h-5 w-5 opacity-20"/>
            <p className="mt-1 font-mono text-[8px] font-bold" style={{ color:'#ef4444', opacity:0.65 }}>SIGNAL LOST</p>
          </div>
        )}
      </div>
    </button>
  );
}

function CameraDetail({ cam, idx, zones }) {
  if (!cam) return null;
  const zone       = zones.find(z => z.id === cam.zoneId);
  const location   = CAM_LOCS[idx % CAM_LOCS.length];
  const storage    = 48 + (idx * 11) % 42;
  const netHealth  = cam.online ? 78 + (idx * 5) % 21 : 0;
  const detLabels  = ['Unauthorized movement detected','Unidentified gathering forming','Restricted zone breach','Contraband indicator present','Cell door manipulation'];
  const detScores  = [88, 74, 91, 67, 82];
  return (
    <div className="space-y-3">
      {/* Feed preview */}
      <div className="relative overflow-hidden rounded-lg" style={{ background:ZONE_GRAD[cam.zoneId] ?? ZONE_GRAD['BLK-A'], aspectRatio:'16/9' }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{ backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.5) 2px,rgba(0,0,0,0.5) 4px)' }}/>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {cam.online ? (
            <>
              <div className="h-8 w-8 rounded-full border border-app-accent/40 flex items-center justify-center mb-1.5" style={{ background:'var(--app-accent-bg)' }}>
                <Icon name="surveillance" className="h-4 w-4 text-app-accent"/>
              </div>
              <p className="font-mono text-[8px] tracking-widest text-white/35">LIVE FEED</p>
            </>
          ) : (
            <>
              <Icon name="surveillance" className="h-7 w-7 opacity-20"/>
              <p className="mt-1.5 font-mono text-[8px] font-bold" style={{ color:'#ef4444', opacity:0.65 }}>SIGNAL LOST</p>
            </>
          )}
        </div>
        <span className="absolute left-2 top-2 font-mono text-[8px] text-white/45 tracking-widest">{cam.id}</span>
        {cam.online && <span className="absolute left-14 top-2 font-mono text-[7px] font-bold" style={{ color:'#ef444477' }}>● REC</span>}
        <Dot color={cam.online ? '#10b981' : '#ef4444'} pulse={cam.online} size={6} className="absolute right-2 top-2"/>
        <p className="absolute bottom-2 left-2 right-2 font-mono text-[8px] text-white/35 truncate">{location}</p>
      </div>

      {/* Core metadata */}
      <div className="space-y-0">
        <KV k="Camera ID"   v={cam.id}/>
        <KV k="Status"      v={cam.online ? 'ONLINE' : 'OFFLINE'}   color={cam.online ? '#10b981' : '#ef4444'}/>
        <KV k="Zone"        v={zone?.name ?? cam.zoneId}/>
        <KV k="Frame Rate"  v={`${cam.fps} fps`}                     color={cam.fps >= 25 ? '#10b981' : '#f59e0b'}/>
        <KV k="Resolution"  v="1920 × 1080"/>
        <KV k="AI Flags"    v={cam.aiFlags}                          color={cam.aiFlags > 0 ? '#f59e0b' : '#10b981'}/>
        <KV k="Encryption"  v="AES-256"                              color="#10b981"/>
        <KV k="Retention"   v="30 days"/>
        <KV k="Protocol"    v="ONVIF 21.12"/>
      </div>

      {/* Network health */}
      <div>
        <SectionLabel className="mb-1.5">Network Health</SectionLabel>
        <Meter value={netHealth} max={100} color={netHealth > 70 ? '#10b981' : '#f59e0b'} height={5}/>
        <p className="mt-1 font-mono text-[9px] text-app-text-faint">{netHealth}% link quality · {cam.online ? 'Latency: 12ms' : 'No signal'}</p>
      </div>

      {/* Storage */}
      <div>
        <SectionLabel className="mb-1.5">Storage Utilization</SectionLabel>
        <Meter value={storage} max={100} color={storage > 80 ? '#ef4444' : storage > 65 ? '#f59e0b' : '#10b981'} height={5}/>
        <p className="mt-1 font-mono text-[9px] text-app-text-faint">{storage}% used · {(( 100 - storage) * 0.48).toFixed(1)} TB free</p>
      </div>

      {/* Recording status */}
      <div className="flex items-center gap-2 rounded-md px-2.5 py-2 border"
        style={{ background: cam.online ? '#10b98110' : '#ef444410', borderColor: cam.online ? '#10b98130' : '#ef444430' }}>
        <Dot color={cam.online ? '#10b981' : '#ef4444'} pulse={cam.online} size={6}/>
        <div>
          <p className="text-[10px] font-bold" style={{ color: cam.online ? '#10b981' : '#ef4444' }}>
            {cam.online ? 'RECORDING ACTIVE' : 'RECORDING SUSPENDED'}
          </p>
          <p className="font-mono text-[9px] text-app-text-faint">
            {cam.online ? 'Continuous recording · Cloud backup enabled' : 'Last known state preserved'}
          </p>
        </div>
      </div>

      {/* AI detections */}
      {cam.aiFlags > 0 && (
        <div>
          <SectionLabel className="mb-1.5">Active AI Detections</SectionLabel>
          <div className="space-y-1.5">
            {Array.from({ length: cam.aiFlags }).map((_, i) => {
              const score = detScores[i % detScores.length];
              return (
                <div key={i} className="rounded-md border px-2.5 py-2" style={{ background:'var(--app-bg-deep)', borderColor:`${threatColor(score)}33` }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-[10px] font-bold" style={{ color: threatColor(score) }}>{detLabels[i % detLabels.length]}</p>
                    <span className="font-mono text-[9px] font-bold shrink-0" style={{ color: threatColor(score) }}>{score}</span>
                  </div>
                  <ThreatBar score={score} height={3}/>
                  <p className="mt-1 font-mono text-[8px] text-app-text-faint">Conf: {75 + i * 6}% · {cam.id} · AI-CCTV</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Environmental conditions */}
      <div>
        <SectionLabel className="mb-1.5">Environmental Conditions</SectionLabel>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label:'Visibility', v:'Good', ok:true },
            { label:'Lighting',   v: cam.online ? 'Adequate' : 'Unknown', ok: cam.online },
            { label:'Temp (env)', v:'27°C',  ok:true },
            { label:'Humidity',   v:'78%',   ok:true },
          ].map(({ label, v, ok }) => (
            <div key={label} className="rounded px-2 py-1.5 border border-app-border" style={{ background:'rgba(0,0,0,0.25)' }}>
              <p className="t-label">{label}</p>
              <p className="font-mono text-[11px] font-bold mt-0.5" style={{ color: ok ? '#10b981' : '#f59e0b' }}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetRow({ det }) {
  const col = det.col ?? threatColor(det.threatScore);
  return (
    <div className="relative rounded-md border px-3 py-2.5 transition-all"
      style={{ borderColor:`${col}2a`, background:`${col}07` }}>
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 w-0.5 rounded-full self-stretch shrink-0" style={{ background:col, minHeight:44 }}/>
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-mono text-[8.5px] font-bold tracking-widest text-app-text-faint">{det.id}</span>
            <span className="font-mono text-[8px] text-app-text-faint">{fmtTs(det.ts)}</span>
            <span className="ml-auto font-mono text-[8px] font-bold px-1.5 py-0.5 rounded"
              style={{ background:`${DET_STATUS_COLOR[det.status]}1a`, color:DET_STATUS_COLOR[det.status], border:`1px solid ${DET_STATUS_COLOR[det.status]}3a` }}>
              {det.status.toUpperCase()}
            </span>
          </div>
          {/* Label */}
          <p className="text-[11px] font-extrabold mb-1 leading-snug" style={{ color:col }}>{det.label}</p>
          {/* Location */}
          <p className="text-[9.5px] text-app-text-muted mb-1.5 truncate">{det.location}</p>
          {/* Threat bar */}
          <ThreatBar score={det.threatScore} height={4} showLabel/>
          {/* Meta */}
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
            <span className="font-mono text-[9px] text-app-text-faint">CAM: <span className="text-app-text">{det.cameraId}</span></span>
            <span className="font-mono text-[9px] text-app-text-faint">CONF: <span className="text-app-text">{det.confidence}%</span></span>
            <span className="font-mono text-[9px] text-app-text-faint">TEAM: <span style={{ color:'#8b5cf6' }}>{det.team}</span></span>
          </div>
          {/* Recommended action */}
          <p className="mt-1.5 text-[9px] text-app-text-muted leading-relaxed">{det.action}</p>
        </div>
      </div>
    </div>
  );
}

function PerimZoneCard({ zone }) {
  const sc  = zone.aiScore;
  const col = perimColor(zone.status);
  const arc = threatColor(sc);
  return (
    <div className="rounded-lg border p-3 flex flex-col gap-2.5"
      style={{ borderColor:`${col}33`, background:'var(--app-bg-deep)' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="flex h-6 w-6 items-center justify-center rounded font-mono text-[10px] font-black"
              style={{ background:`${col}1a`, color:col, border:`1px solid ${col}44` }}>
              {zone.abbr}
            </div>
            <p className="text-[12px] font-bold text-app-text">{zone.label}</p>
          </div>
          <p className="font-mono text-[8.5px] font-bold" style={{ color:col }}>
            {zone.status.toUpperCase()} · {zone.risk.toUpperCase()} RISK · {zone.intrusions} INTRUSION{zone.intrusions !== 1 ? 'S' : ''} (24h)
          </p>
        </div>
        <Ring value={sc} max={100} size={56} stroke={5} color={arc} label={sc} sub="AI"/>
      </div>

      {/* Sensor matrix */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label:'Fence Sensors',   vals:zone.fence   },
          { label:'Thermal Cameras', vals:zone.thermal  },
          { label:'Motion Sensors',  vals:zone.motion   },
          { label:'Guard Towers',    vals:zone.towers   },
        ].map(({ label, vals }) => {
          const ok = vals[1] === vals[0];
          return (
            <div key={label} className="rounded px-2 py-1.5 border border-app-border" style={{ background:'rgba(255,255,255,0.025)' }}>
              <p className="t-label mb-1">{label}</p>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] font-bold text-app-text">{vals[1]}<span className="text-app-text-faint">/{vals[0]}</span></span>
                <Dot color={ok ? '#10b981' : '#f59e0b'} size={5}/>
              </div>
              <Meter value={vals[1]} max={vals[0]} color={ok ? '#10b981' : '#f59e0b'} height={3}/>
            </div>
          );
        })}
      </div>

      {/* UAV row */}
      {zone.drones[0] > 0 && (
        <div className="flex items-center justify-between rounded px-2 py-1.5"
          style={{ background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.18)' }}>
          <span className="text-[10px] font-semibold" style={{ color:'#38bdf8' }}>UAV Surveillance</span>
          <span className="font-mono text-[10px] font-bold" style={{ color: zone.drones[1] > 0 ? '#38bdf8' : '#f59e0b' }}>
            {zone.drones[1]}/{zone.drones[0]} active
          </span>
        </div>
      )}

      {/* Last event */}
      <div className="rounded px-2 py-1.5 border border-app-border" style={{ background:'rgba(0,0,0,0.22)' }}>
        <p className="t-label mb-0.5">Last Recorded Event</p>
        <p className="text-[10px] font-semibold text-app-text">{zone.lastEvent}</p>
      </div>

      {/* AI note */}
      <div style={{ borderTop:'1px solid var(--app-border)', paddingTop:8 }}>
        <SectionLabel className="mb-1">AI Threat Assessment</SectionLabel>
        <p className="text-[9px] text-app-text-muted leading-relaxed">{zone.aiNote}</p>
      </div>
    </div>
  );
}

function ThermalRow({ th }) {
  const col  = sevColor(th.cls);
  const icon = { 'Human Detection':'👤', 'Vehicle Detection':'🚗', 'Animal Detection':'🐾', 'Unknown Heat Signature':'⚠' }[th.type] ?? '?';
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-app-border last:border-0">
      <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[13px]"
        style={{ background:`${col}14`, border:`1px solid ${col}33` }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-[10.5px] font-bold text-app-text truncate">{th.type}</p>
          <span className="font-mono text-[8px] font-bold shrink-0" style={{ color:col }}>{th.cls.toUpperCase()}</span>
        </div>
        <p className="font-mono text-[8.5px] text-app-text-faint mb-0.5">{th.ts} · {th.zone}</p>
        <p className="text-[9px] text-app-text-muted mb-1.5 leading-relaxed">{th.note}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0">
          <span className="font-mono text-[9px] text-app-text-faint">TEMP: <span style={{ color:col }}>{th.temp}°C</span></span>
          <span className="font-mono text-[9px] text-app-text-faint">CONF: <span className="text-app-text">{th.conf}%</span></span>
          <span className="font-mono text-[9px] text-app-text-faint">MOVE: <span className="text-app-text">{th.move}</span></span>
        </div>
      </div>
    </div>
  );
}

function CorrelCard({ cor }) {
  const col = threatColor(cor.score);
  return (
    <div className="rounded-lg border p-3 flex flex-col gap-2.5"
      style={{ borderColor:`${col}30`, background:`${col}06` }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-[8.5px] text-app-text-faint">{cor.id}</span>
            <span className="rounded px-1.5 py-0.5 font-mono text-[7.5px] font-bold"
              style={{ background:`${col}1e`, color:col, border:`1px solid ${col}3e` }}>
              {threatLabel(cor.score)}
            </span>
          </div>
          <p className="text-[12px] font-extrabold text-app-text leading-snug">{cor.title}</p>
        </div>
        <Ring value={cor.score} max={100} size={52} stroke={5} color={col} label={cor.score}/>
      </div>

      {/* Linked events */}
      <div>
        <SectionLabel className="mb-1.5">Linked Detection Events ({cor.linked.length})</SectionLabel>
        <div className="space-y-1">
          {cor.linked.map((ev, i) => (
            <div key={i} className="flex items-center gap-2 rounded px-2 py-1.5 border border-app-border" style={{ background:'rgba(0,0,0,0.2)' }}>
              <Dot color={col} size={4}/>
              <span className="flex-1 text-[9.5px] font-semibold text-app-text truncate">{ev.type}</span>
              <span className="font-mono text-[8.5px] text-app-text-faint shrink-0">{ev.ts}</span>
              <span className="font-mono text-[8.5px] font-bold shrink-0" style={{ color:'#10b981' }}>{ev.conf}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Affected areas */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <SectionLabel className="mb-1">Affected Areas</SectionLabel>
          <div className="flex flex-wrap gap-1">
            {cor.areas.map(a => (
              <span key={a} className="chip chip-ghost text-[8.5px]">{a}</span>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel className="mb-1">Associated Inmates</SectionLabel>
          <div className="flex flex-wrap gap-1">
            {cor.inmates.map(m => (
              <span key={m} className="chip chip-warning text-[8.5px]">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Prediction */}
      <div className="rounded px-2.5 py-2 border" style={{ background:'rgba(239,68,68,0.05)', borderColor:'rgba(239,68,68,0.18)' }}>
        <SectionLabel className="mb-0.5">Predicted Outcome</SectionLabel>
        <p className="text-[9.5px] text-app-text-muted leading-relaxed">{cor.prediction}</p>
      </div>

      {/* Action */}
      <div className="rounded px-2.5 py-2 border" style={{ background:'rgba(56,189,248,0.05)', borderColor:'rgba(56,189,248,0.18)' }}>
        <SectionLabel className="mb-0.5">Recommended Action</SectionLabel>
        <p className="text-[9.5px] text-app-text leading-relaxed">{cor.action}</p>
      </div>
    </div>
  );
}

/* ════════════════════ MAIN PAGE ══════════════════════════════════════ */
export default function SurveillanceCenter() {
  const c    = useCacco();
  const now0 = useRef(Date.now()).current;

  /* ─ Camera state ──────────────────────────────────────────────────── */
  const displayCams = useMemo(() => c.cameras.slice(0, 16), [c.cameras]);
  const [selIdx, setSelIdx] = useState(0);
  const selectedCam = displayCams[selIdx] ?? displayCams[0];

  /* ─ Live AI detection stream ──────────────────────────────────────── */
  const [detections, setDetections] = useState(() => seedDetections(c.cameras, now0));
  useEffect(() => {
    const id = setInterval(() => {
      setDetections(prev => [makeDetection(c.cameras, Date.now()), ...prev].slice(0, 32));
    }, 4200);
    return () => clearInterval(id);
  }, [c.cameras]);

  /* ─ Derived KPIs ──────────────────────────────────────────────────── */
  const online       = useMemo(() => c.cameras.filter(x => x.online).length,  [c.cameras]);
  const offline      = useMemo(() => c.cameras.filter(x => !x.online).length, [c.cameras]);
  const criticalDets = useMemo(() => detections.filter(d => d.sev === 'critical' && d.status !== 'Resolved').length, [detections]);
  const openIncidents= useMemo(() => c.incidents.filter(i => i.stage !== 'closed').length, [c.incidents]);
  const facThreat    = useMemo(() => {
    const active = detections.filter(d => d.status !== 'Resolved').slice(0, 10);
    if (!active.length) return 0;
    return Math.round(active.reduce((s, d) => s + d.threatScore, 0) / active.length);
  }, [detections]);

  /* ─ Threat level (from facility security level 0–4) ──────────────── */
  const tl = THREAT_LEVELS[Math.min(c.facility.securityLevel, 4)] ?? THREAT_LEVELS[2];

  /* ─ Detection filter ──────────────────────────────────────────────── */
  const [detFilter, setDetFilter] = useState('all');
  const DET_FILTERS = [
    { value:'all',      label:'All'      },
    { value:'critical', label:'Critical' },
    { value:'high',     label:'High'     },
    { value:'active',   label:'Active'   },
  ];
  const filteredDets = useMemo(() => detections.filter(d => {
    if (detFilter === 'critical') return d.sev === 'critical';
    if (detFilter === 'high')     return d.sev === 'critical' || d.sev === 'high';
    if (detFilter === 'active')   return d.status !== 'Resolved';
    return true;
  }), [detections, detFilter]);

  /* ─ Camera filter ─────────────────────────────────────────────────── */
  const [camFilter, setCamFilter] = useState('all');
  const CAM_FILTERS = [
    { value:'all',     label:'All'     },
    { value:'flagged', label:'Flagged' },
    { value:'offline', label:'Offline' },
  ];
  const visibleCams = useMemo(() => displayCams.filter(cam => {
    if (camFilter === 'flagged') return cam.aiFlags > 0;
    if (camFilter === 'offline') return !cam.online;
    return true;
  }), [displayCams, camFilter]);

  /* ─── render ────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">

      {/* ═══════════════════════════════════════════════════════════════
          PAGE HEADER
          ══════════════════════════════════════════════════════════════ */}
      <PageHeader
        code="SURV"
        title="Surveillance & Security Intelligence Center"
        subtitle="Centralized CCTV operations · AI detection engine · Perimeter intelligence · Incident correlation"
        actions={<>
          <Chip tone="danger" dot>{offline} OFFLINE</Chip>
          {criticalDets > 0 && (
            <Chip tone="danger"><Dot color="#ef4444" pulse size={5}/>&nbsp;{criticalDets} CRITICAL</Chip>
          )}
          <Chip tone="success"><Dot color="#10b981" pulse size={5}/>&nbsp;RECORDING</Chip>
          <span className="font-mono text-[9px] font-bold px-2.5 py-1.5 rounded-md"
            style={{ background:`${tl.color}14`, color:tl.color, border:`1px solid ${tl.color}44` }}>
            THREAT: {tl.code}
          </span>
        </>}
      />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — GLOBAL SECURITY OVERVIEW
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Total Cameras"
          value={c.cameras.length}
          icon={<Icon name="surveillance" className="w-4 h-4"/>}
          tone="#38bdf8"
          sub="facility-wide coverage"
        />
        <MetricCard
          label="Online Cameras"
          value={online}
          icon={<Icon name="check" className="w-4 h-4"/>}
          tone="#10b981"
          sub={`${Math.round((online / c.cameras.length) * 100)}% operational`}
        />
        <MetricCard
          label="Offline Cameras"
          value={offline}
          icon={<Icon name="alert" className="w-4 h-4"/>}
          tone="#ef4444"
          sub="maintenance required"
        />
        <MetricCard
          label="Critical Detections"
          value={criticalDets}
          icon={<Icon name="ai" className="w-4 h-4"/>}
          tone="#ef4444"
          sub="unresolved critical events"
        />
        <MetricCard
          label="Open Incidents"
          value={openIncidents}
          icon={<Icon name="alert" className="w-4 h-4"/>}
          tone="#f59e0b"
          sub="active investigations"
        />
        <MetricCard
          label="Threat Score"
          value={facThreat}
          icon={<Icon name="shield" className="w-4 h-4"/>}
          tone={threatColor(facThreat)}
          sub={threatLabel(facThreat)}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — LIVE CAMERA OPERATIONS
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">

        {/* ── Camera grid ─────────────────────────────────────────── */}
        <Panel
          className="xl:col-span-3"
          title="Live Camera Matrix"
          icon={<Icon name="surveillance" className="w-4 h-4"/>}
          subtitle={`${displayCams.length} simultaneous feeds · ${online} online · ${offline} offline`}
          live
          actions={
            <div className="flex items-center gap-2">
              <Chip tone="success"><Dot color="#10b981" pulse size={4}/>&nbsp;AI ACTIVE</Chip>
              <Segmented options={CAM_FILTERS} value={camFilter} onChange={setCamFilter}/>
            </div>
          }
          bodyClass="p-3"
        >
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {visibleCams.map((cam) => {
              const origIdx = displayCams.indexOf(cam);
              return (
                <CamCell
                  key={cam.id}
                  cam={cam}
                  idx={origIdx}
                  selected={selIdx === origIdx}
                  onSelect={() => setSelIdx(origIdx)}
                />
              );
            })}
          </div>
          {visibleCams.length === 0 && (
            <div className="flex h-28 items-center justify-center text-xs text-app-text-faint">
              No cameras match current filter
            </div>
          )}
          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-4 pt-2.5" style={{ borderTop:'1px solid var(--app-border)' }}>
            {[
              { col:'#38bdf8', label:'Selected' },
              { col:'#10b981', label:'Online'   },
              { col:'#ef4444', label:'Offline'  },
              { col:'#f59e0b', label:'AI Flag'  },
            ].map(({ col, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm shrink-0" style={{ background:col }}/>
                <span className="text-[9px] text-app-text-faint">{label}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <Dot color="#ef4444" pulse size={5}/>
              <span className="font-mono text-[8.5px] font-bold" style={{ color:'#ef444488' }}>● REC</span>
              <span className="text-[9px] text-app-text-faint ml-1">Recording active on all online cameras</span>
            </div>
          </div>
        </Panel>

        {/* ── Camera Inspector ────────────────────────────────────── */}
        <Panel
          title="Camera Inspector"
          icon={<Icon name="crosshair" className="w-4 h-4"/>}
          subtitle={selectedCam ? `${selectedCam.id} · ${selectedCam.zoneId}` : 'Select a camera'}
          bodyClass="p-0"
        >
          <div className="overflow-y-auto p-3" style={{ maxHeight:660 }}>
            <CameraDetail cam={selectedCam} idx={selIdx} zones={c.zones}/>
          </div>
        </Panel>
      </div>

      {/* Camera health table */}
      <Panel
        title="Camera Health Matrix"
        icon={<Icon name="activity" className="w-4 h-4"/>}
        subtitle="All facility cameras · Health, status, and AI detection summary"
        bodyClass="overflow-x-auto"
      >
        <table className="dtable">
          <thead>
            <tr>
              <th>ID</th><th>Label</th><th>Zone</th><th>Status</th>
              <th>FPS</th><th>AI Flags</th><th>Threat</th><th>Network</th>
            </tr>
          </thead>
          <tbody>
            {c.cameras.map((cam, i) => {
              const score = cam.aiFlags > 0 ? 45 + cam.aiFlags * 14 : 10;
              return (
                <tr key={cam.id} className="cursor-pointer" onClick={() => { if (i < 16) setSelIdx(i); }}>
                  <td className="font-mono text-[10px] text-app-text-faint">{cam.id}</td>
                  <td className="font-semibold text-app-text">{cam.label}</td>
                  <td className="font-mono text-[10px]">{cam.zoneId}</td>
                  <td>
                    <span className={`chip chip-${cam.online ? 'success' : 'danger'} text-[9px]`}>
                      <span className={`dot${cam.online ? ' dot-pulse' : ''}`} style={{ background:'currentColor', width:4, height:4 }}/>
                      {cam.online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="font-mono text-[11px]" style={{ color: cam.fps >= 25 ? '#10b981' : cam.fps > 0 ? '#f59e0b' : '#ef4444' }}>{cam.fps}</td>
                  <td className="font-mono text-[11px]" style={{ color: cam.aiFlags > 0 ? '#f59e0b' : undefined }}>{cam.aiFlags}</td>
                  <td style={{ width:120 }}>
                    <ThreatBar score={score} height={4}/>
                  </td>
                  <td style={{ width:100 }}>
                    <Meter value={cam.online ? cam.fps : 0} max={30} color={cam.online ? '#10b981' : '#ef4444'} height={4}/>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — AI DETECTION ENGINE
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

        {/* ── Real-time detection stream ───────────────────────────── */}
        <Panel
          className="xl:col-span-2"
          title="AI Detection Engine"
          icon={<Icon name="ai" className="w-4 h-4"/>}
          subtitle={`${detections.length} events · ${criticalDets} critical active · Continuous feed from all ${c.cameras.length} cameras`}
          live
          actions={<Segmented options={DET_FILTERS} value={detFilter} onChange={setDetFilter}/>}
          bodyClass="p-3"
        >
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight:560 }}>
            {filteredDets.length === 0 ? (
              <div className="flex h-28 items-center justify-center text-xs text-app-text-faint">
                No detections match current filter
              </div>
            ) : (
              filteredDets.map(det => <DetRow key={det.id} det={det}/>)
            )}
          </div>
        </Panel>

        {/* ── Right column ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Threat distribution */}
          <Panel title="Threat Distribution" icon={<Icon name="activity" className="w-4 h-4"/>} bodyClass="p-3">
            <div className="space-y-3">
              {[
                { label:'Critical', sev:'critical', col:'#ef4444' },
                { label:'High',     sev:'high',     col:'#f59e0b' },
                { label:'Moderate', sev:'moderate', col:'#38bdf8' },
                { label:'Low',      sev:'low',      col:'#10b981' },
              ].map(({ label, sev, col }) => {
                const cnt = detections.filter(d => d.sev === sev).length;
                const pct = detections.length > 0 ? Math.round((cnt / detections.length) * 100) : 0;
                return (
                  <div key={sev}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold" style={{ color:col }}>{label}</span>
                      <span className="font-mono text-[10px] font-bold text-app-text">
                        {cnt} <span className="text-app-text-faint text-[9px]">({pct}%)</span>
                      </span>
                    </div>
                    <Meter value={cnt} max={Math.max(detections.length, 1)} color={col} height={5}/>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 space-y-1" style={{ borderTop:'1px solid var(--app-border)' }}>
              <SectionLabel className="mb-2">Status Breakdown</SectionLabel>
              {Object.entries(DET_STATUS_COLOR).map(([status, col]) => {
                const cnt = detections.filter(d => d.status === status).length;
                if (cnt === 0) return null;
                return (
                  <div key={status} className="flex items-center gap-2">
                    <Dot color={col} size={5}/>
                    <span className="text-[9.5px] text-app-text-muted flex-1">{status}</span>
                    <span className="font-mono text-[10px] font-bold" style={{ color:col }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Most active zones */}
          <Panel title="Most Active Zones" icon={<Icon name="dotsGrid" className="w-4 h-4"/>} bodyClass="p-3 space-y-2">
            {c.zones
              .filter(z => z.incidents24h > 0)
              .sort((a,b) => b.incidents24h - a.incidents24h)
              .slice(0, 5)
              .map(z => (
                <div key={z.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-app-text truncate">{z.name}</span>
                    <span className="font-mono text-[10px] font-bold text-app-text shrink-0">{z.incidents24h}</span>
                  </div>
                  <Meter
                    value={z.incidents24h} max={6}
                    color={z.incidents24h >= 4 ? '#ef4444' : z.incidents24h >= 2 ? '#f59e0b' : '#38bdf8'}
                    height={4}
                  />
                </div>
              ))}
          </Panel>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — INCIDENT CORRELATION ENGINE
          ══════════════════════════════════════════════════════════════ */}
      <Panel
        title="Incident Correlation Engine"
        icon={<Icon name="intel" className="w-4 h-4"/>}
        subtitle="AI-linked multi-event security correlation · Behavioral pattern synthesis · Predictive threat assessment"
        bodyClass="p-3"
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
          {CORRELATIONS.map(cor => <CorrelCard key={cor.id} cor={cor}/>)}
        </div>
      </Panel>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — PERIMETER SECURITY INTELLIGENCE
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

        {/* ── Perimeter zones ──────────────────────────────────────── */}
        <Panel
          className="xl:col-span-2"
          title="Perimeter Security Intelligence"
          icon={<Icon name="shield" className="w-4 h-4"/>}
          subtitle="Fence sensors · Thermal cameras · Motion detection · Guard towers · UAV surveillance"
          bodyClass="p-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PERIM_ZONES.map(z => <PerimZoneCard key={z.id} zone={z}/>)}
          </div>

          {/* Perimeter summary bar */}
          <div className="mt-3 pt-3 grid grid-cols-4 gap-2" style={{ borderTop:'1px solid var(--app-border)' }}>
            {PERIM_ZONES.map(z => (
              <div key={z.id} className="rounded-md px-2.5 py-2 border text-center"
                style={{ borderColor:`${perimColor(z.status)}33`, background:`${perimColor(z.status)}0a` }}>
                <p className="font-mono text-[10px] font-black" style={{ color:perimColor(z.status) }}>{z.abbr}</p>
                <p className="font-mono text-[9px] font-bold text-app-text mt-0.5">{z.aiScore}</p>
                <p className="font-mono text-[8px]" style={{ color:perimColor(z.status) }}>{z.status.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* ── Thermal monitoring ───────────────────────────────────── */}
        <Panel
          title="Thermal Analytics"
          icon={<Icon name="activity" className="w-4 h-4"/>}
          subtitle="Infrared detection feed · Signature classification engine"
          bodyClass="p-3"
        >
          <div>
            {THERMAL_DATA.map(th => <ThermalRow key={th.id} th={th}/>)}
          </div>
          {/* Legend */}
          <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop:'1px solid var(--app-border)' }}>
            <SectionLabel className="mb-2">Classification Key</SectionLabel>
            {['Human Detection','Vehicle Detection','Animal Detection','Unknown Heat Signature'].map((t,i) => {
              const icons = ['👤','🚗','🐾','⚠'];
              const cols  = ['#ef4444','#f59e0b','#10b981','#f97316'];
              return (
                <div key={t} className="flex items-center gap-2">
                  <span className="text-[11px]">{icons[i]}</span>
                  <span className="text-[9px] text-app-text-muted flex-1">{t}</span>
                  <Dot color={cols[i]} size={4}/>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — THREAT ESCALATION DASHBOARD
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

        {/* ── Threat level board ───────────────────────────────────── */}
        <Panel
          title="Threat Escalation Dashboard"
          icon={<Icon name="alert" className="w-4 h-4"/>}
          subtitle="Facility-wide security posture"
          bodyClass="p-3"
        >
          {/* Current level */}
          <div className="rounded-xl border p-5 mb-4 text-center"
            style={{ borderColor:`${tl.color}44`, background:`${tl.color}0e` }}>
            <p className="t-label mb-2 tracking-[0.18em]">CURRENT THREAT LEVEL</p>
            <div className="flex items-center justify-center gap-3 mb-2">
              <Dot color={tl.color} pulse size={10}/>
              <p className="font-mono text-[2.4rem] font-black tracking-widest leading-none" style={{ color:tl.color }}>
                {tl.code}
              </p>
            </div>
            <p className="text-[11px] font-bold tracking-[0.2em] mb-2" style={{ color:tl.color }}>{tl.label}</p>
            <p className="text-[9.5px] text-app-text-muted leading-relaxed">{tl.description}</p>
          </div>

          {/* Threat scale */}
          <SectionLabel className="mb-2">Security Posture Scale</SectionLabel>
          <div className="space-y-1.5 mb-4">
            {THREAT_LEVELS.map((lvl) => (
              <div key={lvl.code} className="flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-all"
                style={{
                  background: tl.code === lvl.code ? `${lvl.color}16` : 'transparent',
                  border: `1px solid ${tl.code === lvl.code ? lvl.color + '40' : 'transparent'}`,
                }}>
                <div className="h-3 w-3 rounded shrink-0" style={{
                  background: lvl.color,
                  boxShadow: tl.code === lvl.code ? `0 0 8px ${lvl.color}99` : 'none',
                }}/>
                <span className="font-mono text-[9.5px] font-bold shrink-0" style={{ color:lvl.color, minWidth:46 }}>
                  {lvl.code}
                </span>
                <span className="text-[9px] text-app-text-muted flex-1">— {lvl.label}</span>
                {tl.code === lvl.code && <Dot color={lvl.color} pulse size={5}/>}
              </div>
            ))}
          </div>

          {/* Active emergencies */}
          <SectionLabel className="mb-2">Active Emergencies</SectionLabel>
          {c.facility.lockdownZones > 0 ? (
            <div className="rounded-md border px-3 py-2.5 mb-2"
              style={{ background:'#ef444410', borderColor:'#ef444430' }}>
              <div className="flex items-center gap-2 mb-1">
                <Dot color="#ef4444" pulse size={6}/>
                <span className="text-[11px] font-bold" style={{ color:'#ef4444' }}>LOCKDOWN IN EFFECT</span>
              </div>
              <p className="text-[9.5px] text-app-text-muted">
                {c.facility.lockdownZones} zone{c.facility.lockdownZones > 1 ? 's' : ''} under active lockdown protocol
              </p>
            </div>
          ) : (
            <div className="rounded-md border px-3 py-2.5 mb-2"
              style={{ background:'#10b98110', borderColor:'#10b98130' }}>
              <p className="text-[11px] font-bold" style={{ color:'#10b981' }}>NO ACTIVE EMERGENCIES</p>
              <p className="text-[9.5px] text-app-text-muted mt-0.5">All protocols within normal parameters</p>
            </div>
          )}

          {/* High risk areas */}
          <SectionLabel className="mb-2 mt-3">High-Risk Areas (24h)</SectionLabel>
          <div className="space-y-1.5">
            {c.zones
              .filter(z => z.risk === 'extreme' || z.risk === 'high' || z.incidents24h >= 2)
              .sort((a,b) => b.incidents24h - a.incidents24h)
              .slice(0, 4)
              .map(z => {
                const col = z.risk === 'extreme' || z.incidents24h >= 4 ? '#ef4444' : '#f59e0b';
                return (
                  <div key={z.id} className="flex items-center gap-2 rounded px-2 py-1.5 border"
                    style={{ borderColor:`${col}28`, background:`${col}08` }}>
                    <Dot color={col} size={5}/>
                    <span className="flex-1 text-[10px] font-semibold text-app-text truncate">{z.name}</span>
                    <span className="font-mono text-[9px] shrink-0" style={{ color:col }}>{z.incidents24h} INC</span>
                  </div>
                );
              })}
          </div>
        </Panel>

        {/* ── AI Predictive Analytics ──────────────────────────────── */}
        <Panel
          className="xl:col-span-2"
          title="AI Predictive Analytics"
          icon={<Icon name="ai" className="w-4 h-4"/>}
          subtitle="Zone risk forecasting · Behavioral anomaly detection · Threat prediction models"
          bodyClass="p-3"
        >
          {/* Zone risk predictions */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:grid-cols-3">
            {ZONE_PREDS.map(zp => {
              const col = threatColor(zp.risk);
              return (
                <div key={zp.zone} className="rounded-lg border p-3"
                  style={{ borderColor:`${col}2e`, background:'var(--app-bg-deep)' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10.5px] font-bold text-app-text leading-snug">{zp.zone}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[8px] font-bold" style={{ color:col }}>
                          {threatLabel(zp.risk)} · {zp.risk}%
                        </span>
                        <span style={{ color: zp.trend === 'up' ? '#ef4444' : zp.trend === 'down' ? '#10b981' : '#555', fontSize:8 }}>
                          {zp.trend === 'up' ? '▲' : zp.trend === 'down' ? '▼' : '─'}
                        </span>
                      </div>
                    </div>
                    <Ring value={zp.risk} max={100} size={46} stroke={5} color={col} label={zp.risk}/>
                  </div>
                  <ThreatBar score={zp.risk} height={4}/>
                  <SectionLabel className="mt-2 mb-1">AI Reasoning</SectionLabel>
                  <p className="text-[8.5px] text-app-text-muted leading-relaxed">{zp.reason}</p>
                </div>
              );
            })}
          </div>

          {/* Behavioral anomalies */}
          <div className="mt-3 pt-3 grid grid-cols-1 gap-3 sm:grid-cols-2" style={{ borderTop:'1px solid var(--app-border)' }}>
            <div>
              <SectionLabel className="mb-2">Behavioral Anomalies Detected</SectionLabel>
              <div className="space-y-1.5">
                {[
                  { label:'Subject CR-2048 — behavioral deviation +2.7σ', sev:'critical' },
                  { label:'Block B — coordinated movement pattern active', sev:'high' },
                  { label:'North fence — repeated probing sub-pattern',    sev:'high' },
                  { label:'West loading bay — unauthorized vehicle access',sev:'moderate' },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-2 rounded px-2 py-1.5 border border-app-border"
                    style={{ background:'rgba(0,0,0,0.2)' }}>
                    <Dot color={sevColor(a.sev)} pulse={a.sev === 'critical'} size={5} className="mt-0.5 shrink-0"/>
                    <p className="text-[9px] text-app-text leading-relaxed">{a.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionLabel className="mb-2">Security Recommendations</SectionLabel>
              <div className="space-y-1.5">
                {c.recommendations.slice(0,4).map(r => (
                  <div key={r.id} className="rounded px-2 py-1.5 border border-app-border"
                    style={{ background:'rgba(139,92,246,0.05)' }}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono text-[8px] font-bold"
                        style={{ color: r.priority === 'critical' ? '#ef4444' : r.priority === 'high' ? '#f59e0b' : '#8b5cf6' }}>
                        {r.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[9px] font-semibold text-app-text leading-snug">{r.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Response team readiness */}
          <div className="mt-3 pt-3" style={{ borderTop:'1px solid var(--app-border)' }}>
            <SectionLabel className="mb-2">Response Team Readiness</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {c.teams.map(team => {
                const col = { standby:'#10b981', deployed:'#38bdf8', responding:'#f59e0b', unavailable:'#ef4444' }[team.status] ?? '#666';
                return (
                  <div key={team.id} className="rounded-md border p-2.5 text-center"
                    style={{ borderColor:`${col}30`, background:`${col}08` }}>
                    <p className="font-mono text-[9px] font-bold text-app-text">{team.callsign}</p>
                    <p className="font-mono text-[15px] font-extrabold mt-1.5 leading-none" style={{ color:col }}>{team.readiness}%</p>
                    <Meter value={team.readiness} max={100} color={col} height={3} className="mt-1.5"/>
                    <p className="font-mono text-[8px] mt-1.5 font-bold" style={{ color:col }}>{team.status.toUpperCase()}</p>
                    <p className="font-mono text-[8px] text-app-text-faint">{team.members}m</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>
      </div>

    </div>
  );
}
