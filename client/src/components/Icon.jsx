/* ════════════════════════════════════════════════════════════════════
   CACCO — Tactical line-art icon set (24×24, currentColor stroke)
   ════════════════════════════════════════════════════════════════════ */
import React from 'react';
const P = {
    command: (<><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/></>),
    shield: (<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>),
    surveillance: (<><path d="M2 7l13-3 1.2 4.5L3.2 11.5z"/><path d="M3 11.5V19"/><path d="M9 10.5V15a2 2 0 01-2 2H5"/><circle cx="17" cy="15.5" r="3"/></>),
    intel: (<><circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="7" r="2.4"/><circle cx="12" cy="17" r="2.4"/><path d="M8 7l8 .6M7.5 8.3 11 14.7M16.5 9 13 15"/></>),
    staff: (<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2.2"/><path d="M5.6 16.5a3.6 3.6 0 016.8 0"/><path d="M15 9h4M15 12h4M15 15h2.5"/></>),
    rehab: (<><path d="M3 5.5A2 2 0 015 5h5a2 2 0 012 2v12a2.5 2.5 0 00-2.5-2H3z"/><path d="M21 5.5A2 2 0 0019 5h-5a2 2 0 00-2 2v12a2.5 2.5 0 012.5-2H21z"/></>),
    incident: (<><path d="M10.3 3.9 1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></>),
    ai: (<><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 6V3M15 6V3M9 21v-3M15 21v-3M6 9H3M6 15H3M21 9h-3M21 15h-3"/></>),
    twin: (<><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/></>),
    reports: (<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/></>),
    admin: (<><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="20" cy="14" r="2"/></>),
    clock: (<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>),
    bell: (<><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></>),
    search: (<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>),
    menu: (<><path d="M3 6h18M3 12h18M3 18h18"/></>),
    close: (<><path d="M6 6l12 12M18 6L6 18"/></>),
    chevronR: (<path d="M9 6l6 6-6 6"/>),
    chevronD: (<path d="M6 9l6 6 6-6"/>),
    cloud: (<path d="M17.5 19a4.5 4.5 0 00.5-9 6 6 0 00-11.6 1.5A3.8 3.8 0 007 19z"/>),
    activity: (<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>),
    signal: (<><path d="M2 20h.01M7 20v-4M12 20v-9M17 20V7M22 20V4"/></>),
    pin: (<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>),
    fire: (<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1 .3-1.8 1.5-3.5"/>),
    lock: (<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>),
    radio: (<><circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 000 8.4M16.2 16.2a6 6 0 000-8.4M4.9 4.9a10 10 0 000 14.2M19.1 19.1a10 10 0 000-14.2"/></>),
    check: (<path d="M20 6L9 17l-5-5"/>),
    eye: (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>),
    crosshair: (<><circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/></>),
    zap: (<path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>),
    users: (<><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/></>),
    user: (<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></>),
    pause: (<><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></>),
    play: (<path d="M7 4l13 8-13 8z"/>),
    filter: (<path d="M3 4h18l-7 9v6l-4 2v-8z"/>),
    download: (<><path d="M12 3v12M7 11l5 4 5-4"/><path d="M5 21h14"/></>),
    refresh: (<><path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/><path d="M3 21v-5h5"/></>),
    alert: (<><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><circle cx="12" cy="16" r="0.6" fill="currentColor"/></>),
    wind: (<path d="M9.6 4.6A2 2 0 1111 8H2m10.6 11.4A2 2 0 1014 16H2m15.7-8.3A2.5 2.5 0 1119.5 12H2"/>),
    drop: (<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>),
    cpu: (<><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></>),
    arrowUp: (<path d="M12 19V5M6 11l6-6 6 6"/>),
    arrowDown: (<path d="M12 5v14M6 13l6 6 6-6"/>),
    dotsGrid: (<><circle cx="5" cy="5" r="1.4" fill="currentColor"/><circle cx="12" cy="5" r="1.4" fill="currentColor"/><circle cx="19" cy="5" r="1.4" fill="currentColor"/><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/><circle cx="5" cy="19" r="1.4" fill="currentColor"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/><circle cx="19" cy="19" r="1.4" fill="currentColor"/></>),
    pulseHeart: (<path d="M20.8 8.6a5 5 0 00-8.8-3 5 5 0 00-8.8 3c0 4 4.5 7.6 8.8 10.4 4.3-2.8 8.8-6.4 8.8-10.4z"/>),
    gauge: (<><path d="M12 13l4-4"/><path d="M3 18a9 9 0 1118 0"/><circle cx="12" cy="13" r="1.2" fill="currentColor"/></>),
    route: (<><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H14a4 4 0 000-8H9a4 4 0 010-8h6.5"/></>),
};
export function Icon({ name, className = 'w-4 h-4', strokeWidth = 1.7 }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>);
}
