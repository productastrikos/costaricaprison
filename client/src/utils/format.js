/* CACCO — formatting helpers */
export function timeAgo(ms, now = Date.now()) {
    const diff = now - ms;
    if (diff < 0)
        return 'now';
    if (diff < 60000)
        return `${Math.floor(diff / 1000)}s`;
    if (diff < 3600000)
        return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000)
        return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
}
export function clockTime(d) {
    return d.toLocaleTimeString('en-GB', { hour12: false });
}
export function clockDate(d) {
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}
export function zulu(d) {
    return `${d.toISOString().slice(11, 19)}Z`;
}
export const pad2 = (n) => String(n).padStart(2, '0');
export const fmtNum = (n) => n.toLocaleString('en-US');
