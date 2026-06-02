export const RAG_HEX = {
    normal: '#10b981', warning: '#f59e0b', critical: '#ef4444', info: '#38bdf8',
};
export const THREAT = {
    info: { hex: '#38bdf8', chip: 'info', label: 'INFO' },
    low: { hex: '#22d3ee', chip: 'info', label: 'LOW' },
    moderate: { hex: '#f59e0b', chip: 'warning', label: 'MODERATE' },
    high: { hex: '#f97316', chip: 'warning', label: 'HIGH' },
    critical: { hex: '#ef4444', chip: 'danger', label: 'CRITICAL' },
};
export const RISK = {
    low: { hex: '#10b981', chip: 'success', label: 'LOW' },
    medium: { hex: '#38bdf8', chip: 'info', label: 'MEDIUM' },
    high: { hex: '#f59e0b', chip: 'warning', label: 'HIGH' },
    extreme: { hex: '#ef4444', chip: 'danger', label: 'EXTREME' },
};
export const OPSTATUS = {
    normal: { hex: '#10b981', chip: 'success', label: 'NORMAL' },
    elevated: { hex: '#f59e0b', chip: 'warning', label: 'ELEVATED' },
    critical: { hex: '#ef4444', chip: 'danger', label: 'CRITICAL' },
    lockdown: { hex: '#ef4444', chip: 'danger', label: 'LOCKDOWN' },
};
export const PRIORITY = {
    low: { hex: '#22d3ee', chip: 'info', label: 'LOW' },
    medium: { hex: '#38bdf8', chip: 'info', label: 'MEDIUM' },
    high: { hex: '#f59e0b', chip: 'warning', label: 'HIGH' },
    critical: { hex: '#ef4444', chip: 'danger', label: 'CRITICAL' },
};
export const ALERT_STATUS = {
    active: { hex: '#ef4444', chip: 'danger', label: 'ACTIVE' },
    dispatched: { hex: '#f97316', chip: 'warning', label: 'DISPATCHED' },
    contained: { hex: '#38bdf8', chip: 'info', label: 'CONTAINED' },
    monitoring: { hex: '#22d3ee', chip: 'info', label: 'MONITORING' },
    resolved: { hex: '#10b981', chip: 'success', label: 'RESOLVED' },
};
export const STAGE = {
    reported: { hex: '#ef4444', chip: 'danger', label: 'REPORTED' },
    investigating: { hex: '#f59e0b', chip: 'warning', label: 'INVESTIGATING' },
    response: { hex: '#f97316', chip: 'warning', label: 'RESPONSE' },
    review: { hex: '#38bdf8', chip: 'info', label: 'REVIEW' },
    closed: { hex: '#10b981', chip: 'success', label: 'CLOSED' },
};
export const SEC_LEVEL = {
    1: { hex: '#10b981', label: 'NORMAL', code: 'LEVEL 1' },
    2: { hex: '#38bdf8', label: 'HEIGHTENED', code: 'LEVEL 2' },
    3: { hex: '#f59e0b', label: 'HIGH ALERT', code: 'LEVEL 3' },
    4: { hex: '#ef4444', label: 'CRITICAL INCIDENT', code: 'LEVEL 4' },
};
