/* ============================================================
   utils.js — ikon, format, keamanan (escape), toast, modal, berkas
   ============================================================ */

// ---------- Ikon (gaya Lucide, 24x24) ----------
const ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'upload-cloud': '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3" fill="currentColor"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  list: '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>',
  landmark: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  'credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  key: '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  grip: '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  percent: '<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  whatsapp: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  'zoom-in': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/>',
  maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  'rotate-cw': '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  'bar-chart': '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
  mouse: '<rect x="5" y="2" width="14" height="20" rx="7"/><path d="M12 6v4"/>',
  'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'
};
function icon(nama, cls) {
  const extra = nama === 'whatsapp' ? ' ic-wa' : '';
  return '<svg class="ic ' + (cls || '') + extra + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICON_PATHS[nama] || ICON_PATHS.info) + '</svg>';
}

function ambilDaftarKupon(sumber) {
  try {
    const raw = (sumber && (sumber.kupon_promo !== undefined ? sumber.kupon_promo : (sumber.nilai && sumber.nilai.kupon_promo))) || (window.S && window.S.pengaturan && window.S.pengaturan.kupon_promo);
    if (!raw) return [];
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

// ---------- DOM & string ----------
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
function esc(s) {
  return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function debounce(fn, ms) { let t; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(() => fn.apply(c, a), ms || 250); }; }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function on(root, ev, sel, fn) {
  root.addEventListener(ev, (e) => { const t = e.target.closest(sel); if (t && root.contains(t)) fn(e, t); });
}

// ---------- Format ----------
const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const BLN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
function rupiah(n) { return 'Rp ' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function bagianWIB(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const o = {}; f.forEach((p) => { o[p.type] = p.value; });
  return { y: +o.year, m: +o.month, d: +o.day, h: o.hour === '24' ? '00' : o.hour, mi: o.minute };
}
function tgl(iso, jam) {
  if (!iso) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) { const p = iso.split('-'); return +p[2] + ' ' + BLN[+p[1] - 1] + ' ' + p[0]; }
  const p = bagianWIB(iso);
  if (!p) return String(iso);
  return p.d + ' ' + BLN[p.m - 1] + ' ' + p.y + (jam ? ', ' + p.h + ':' + p.mi + ' WIB' : '');
}
function bulanTahun(iso) {
  const s = String(iso || '');
  const m = /^(\d{4})-(\d{2})/.exec(s);
  return m ? BLN[+m[2] - 1] + ' ' + m[1] : '-';
}
function relatif(iso) {
  const d = new Date(iso); if (isNaN(d.getTime())) return '-';
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'baru saja';
  if (s < 3600) return Math.floor(s / 60) + ' menit lalu';
  if (s < 86400) return Math.floor(s / 3600) + ' jam lalu';
  if (s < 86400 * 7) return Math.floor(s / 86400) + ' hari lalu';
  return tgl(iso);
}
function ukuranBerkas(b) { b = Number(b) || 0; return b < 1024 * 1024 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
function inisial(nama) { return String(nama || '?').trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toUpperCase() || '?'; }
function pluralKosong(s, alt) { return s && String(s).trim() ? s : alt; }
function nomorTel(s) { return String(s || '').replace(/[^\d+]/g, ''); }
function linkWA(nomor, teks) {
  let n = nomorTel(nomor).replace(/^\+/, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  return 'https://wa.me/' + n + (teks ? '?text=' + encodeURIComponent(teks) : '');
}

// ---------- Video & gambar Drive ----------
function ytId(url) {
  const s = String(url || '');
  const m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{6,})/.exec(s);
  return m ? m[1] : '';
}
function driveThumb(id, w) { return id ? 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w' + (w || 800) : ''; }
function urlAman(u) { return /^https?:\/\//i.test(String(u || '')) ? u : ''; }

// ---------- Markdown ringan (aman: di-escape dulu) ----------
function mdInline(t) {
  return t
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}
function md(src) {
  const baris = esc(src || '').split('\n');
  let html = '', para = [], list = false;
  const tutupP = () => { if (para.length) { html += '<p>' + mdInline(para.join(' ')) + '</p>'; para = []; } };
  const tutupL = () => { if (list) { html += '</ul>'; list = false; } };
  baris.forEach((b) => {
    const t = b.trim();
    let m;
    if (!t) { tutupP(); tutupL(); return; }
    if ((m = /^(#{1,4})\s+(.*)$/.exec(t))) { tutupP(); tutupL(); html += '<h' + (m[1].length <= 2 ? 3 : 4) + '>' + mdInline(m[2]) + '</h' + (m[1].length <= 2 ? 3 : 4) + '>'; return; }
    if ((m = /^[-*•]\s+(.*)$/.exec(t))) { tutupP(); if (!list) { html += '<ul>'; list = true; } html += '<li>' + mdInline(m[1]) + '</li>'; return; }
    tutupL(); para.push(t);
  });
  tutupP(); tutupL();
  return html;
}

// ---------- Toast, modal, clipboard ----------
function toast(pesan, jenis, ms) {
  const el = document.createElement('div');
  const ik = { ok: 'check-circle', err: 'x-circle', info: 'info', warn: 'alert-triangle' }[jenis || 'info'];
  el.className = 'toast ' + (jenis || 'info');
  el.innerHTML = icon(ik) + '<div>' + esc(pesan) + '</div>';
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, ms || 4200);
}
function modal(html, opsi) {
  return new Promise((resolve) => {
    const bd = document.createElement('div');
    bd.className = 'modal-bd';
    bd.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' + html + '</div>';
    const tutup = (v) => { bd.remove(); document.removeEventListener('keydown', esc_); resolve(v); };
    const esc_ = (e) => { if (e.key === 'Escape') tutup(null); };
    document.addEventListener('keydown', esc_);
    bd.addEventListener('mousedown', (e) => { if (e.target === bd) tutup(null); });
    bd.addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      if (b.dataset.m === 'ok' && opsi && opsi.ambil) { const v = opsi.ambil(bd); if (v === false) return; return tutup(v); }
      tutup(b.dataset.m === 'ok' ? true : null);
    });
    document.body.appendChild(bd);
    const f = bd.querySelector('textarea,input'); if (f) f.focus();
  });
}
function konfirmasi(judul, isi, opsi) {
  opsi = opsi || {};
  return modal('<h3>' + esc(judul) + '</h3><p class="muted">' + isi + '</p><div class="act"><button class="btn btn-secondary" data-m="no">' + esc(opsi.batal || 'Batal') + '</button><button class="btn ' + (opsi.bahaya ? 'btn-danger' : 'btn-primary') + '" data-m="ok">' + esc(opsi.ok || 'Ya, lanjutkan') + '</button></div>');
}
function bukaLightbox(url, judul) {
  if (!url) return;
  const bd = document.createElement('div');
  bd.className = 'lightbox-bd';
  bd.innerHTML = `<div class="lightbox-box">
    <button class="lightbox-close" type="button" aria-label="Tutup">${icon('x')}</button>
    <img class="lightbox-img" src="${esc(url)}" alt="${esc(judul || 'Tangkapan Layar')}">
    ${judul ? `<div class="lightbox-cap">${icon('image')} ${esc(judul)}</div>` : ''}
  </div>`;
  const tutup = () => { bd.remove(); document.removeEventListener('keydown', esc_); };
  const esc_ = (e) => { if (e.key === 'Escape') tutup(); };
  document.addEventListener('keydown', esc_);
  bd.addEventListener('click', (e) => {
    if (e.target === bd || e.target.closest('.lightbox-close')) tutup();
  });
  document.body.appendChild(bd);
}
async function salin(teks, pesan) {
  try { await navigator.clipboard.writeText(teks); }
  catch (e) { const t = document.createElement('textarea'); t.value = teks; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (x) { /* abaikan */ } t.remove(); }
  toast(pesan || 'Disalin ke papan klip', 'ok', 2200);
}
function tombolBusy(btn, busy, teks) {
  if (!btn) return;
  if (busy) { btn.dataset.old = btn.innerHTML; btn.disabled = true; btn.innerHTML = icon('refresh', 'spin') + ' ' + esc(teks || 'Memproses...'); }
  else { btn.disabled = false; if (btn.dataset.old) btn.innerHTML = btn.dataset.old; }
}

// ---------- Berkas: baca, kompres, base64 ----------
const MIME_WEBP = (() => { try { return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0; } catch (e) { return false; } })();
function bacaSebagaiDataUrl(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error('Gagal membaca berkas.')); r.readAsDataURL(file); });
}
function muatGambar(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Berkas bukan gambar yang valid.')); i.src = src; });
}
function gantiEkstensi(nama, ext) { return String(nama || 'berkas').replace(/\.[^.]+$/, '') + '.' + ext; }
// Kompres gambar di browser supaya unggahan ringan.
async function siapkanGambar(file, opsi) {
  opsi = opsi || {};
  const maxSisi = opsi.maxSisi || 1600, kualitas = opsi.kualitas || 0.82;
  const url = await bacaSebagaiDataUrl(file);
  const img = await muatGambar(url);
  let w = img.naturalWidth, h = img.naturalHeight;
  const skala = Math.min(1, maxSisi / Math.max(w, h));
  w = Math.round(w * skala); h = Math.round(h * skala);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h);
  const mime = opsi.webp && MIME_WEBP ? 'image/webp' : 'image/jpeg';
  const dataUrl = c.toDataURL(mime, kualitas);
  const base64 = dataUrl.split(',')[1];
  return { nama: gantiEkstensi(file.name, mime === 'image/webp' ? 'webp' : 'jpg'), mime, base64, ukuran: Math.floor(base64.length * 3 / 4), dataUrl, lebar: w, tinggi: h };
}
async function siapkanBukti(file) {
  const batas = 5 * 1024 * 1024;
  if (file.type === 'application/pdf') {
    if (file.size > batas) throw new Error('Ukuran PDF maksimal 5 MB.');
    const u = await bacaSebagaiDataUrl(file);
    return { nama: file.name, mime: 'application/pdf', base64: u.split(',')[1], ukuran: file.size, dataUrl: '', pdf: true };
  }
  if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) throw new Error('Format harus JPG, PNG, atau PDF.');
  const g = await siapkanGambar(file, { maxSisi: 1600, kualitas: 0.82 });
  if (g.ukuran > batas) throw new Error('Ukuran gambar maksimal 5 MB.');
  return g;
}
function unduhBase64(nama, mime, base64) {
  const bin = atob(base64); const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([arr], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = nama; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function bindDropzone(zona, input, onFile) {
  zona.addEventListener('click', () => input.click());
  zona.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  ['dragenter', 'dragover'].forEach((ev) => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.remove('drag'); }));
  zona.addEventListener('drop', (e) => { const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) onFile(f); });
  input.addEventListener('change', () => { if (input.files && input.files[0]) onFile(input.files[0]); input.value = ''; });
}

// ---------- Komponen tampilan kecil ----------
const STATUS_PIL = {
  'Menunggu Verifikasi': ['pill-warn', 'Menunggu Verifikasi'], Disetujui: ['pill-ok', 'Disetujui'], Ditolak: ['pill-err', 'Ditolak'],
  Tersedia: ['pill-ok', 'Tersedia'], 'Segera Hadir': ['pill-soon', 'Segera Hadir'], 'Tidak Dijual': ['pill-mute', 'Diarsipkan'],
  Menunggu: ['pill-warn', 'Menunggu'], Disembunyikan: ['pill-mute', 'Disembunyikan']
};
function pil(status, teks) { const p = STATUS_PIL[status] || ['pill-mute', status]; return '<span class="pill ' + p[0] + '">' + esc(teks || p[1]) + '</span>'; }
function bintang(n, ukuran) {
  let s = '<span class="stars" aria-label="' + n + ' dari 5 bintang" style="font-size:' + (ukuran || 14) + 'px">';
  for (let i = 1; i <= 5; i++) s += '<span class="' + (i <= Math.round(n) ? '' : 'off') + '">' + icon('star') + '</span>';
  return s + '</span>';
}
function hashAngka(s) { let h = 0; String(s || '').split('').forEach((c) => { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return h; }
// Pratinjau aplikasi: gambar thumbnail bila ada, kalau tidak: jendela aplikasi ilustratif
function pratinjau(app, opsi) {
  opsi = opsi || {};
  const url = opsi.thumb !== undefined ? opsi.thumb : app.thumb;
  const h = hashAngka(app.id || app.nama);
  let inner;
  if (url) inner = '<img class="shot" loading="lazy" alt="Tampilan ' + esc(app.nama) + '" src="' + esc(driveThumb(url, opsi.lebar || 640)) + '" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'scr\',innerHTML:\'<div class=ln></div><div class=ln></div>\'}))">';
  else {
    let baris = '';
    const n = opsi.besar ? 7 : 4;
    for (let i = 0; i < n; i++) baris += '<div class="ln ' + (['a', '', 'b', ''][(h + i) % 4]) + '" style="width:' + (55 + ((h >> i) % 40)) + '%"></div>';
    inner = '<div class="scr">' + baris + '</div>';
  }
  return '<div class="pv ' + (opsi.besar ? 'big' : '') + '">' + inner + '</div>';
}
function inputWaktuSekarang() { return new Date().toISOString(); }

// ---------- Top Loading Bar (Indikator Transisi Navigasi Cepat) ----------
const TopBar = {
  el: null,
  timer: null,
  prog: 0,
  ensure() {
    if (!this.el) {
      let b = document.getElementById('top-loader');
      if (!b) {
        b = document.createElement('div');
        b.id = 'top-loader';
        document.body.appendChild(b);
      }
      this.el = b;
    }
    return this.el;
  },
  start() {
    const el = this.ensure();
    clearTimeout(this.timer);
    this.prog = 20;
    el.style.width = '20%';
    el.classList.add('loading');
    el.style.opacity = '1';
    this.timer = setTimeout(() => {
      this.prog = 65;
      el.style.width = '65%';
      this.timer = setTimeout(() => {
        this.prog = 85;
        el.style.width = '85%';
      }, 180);
    }, 80);
  },
  done() {
    const el = this.ensure();
    clearTimeout(this.timer);
    this.prog = 100;
    el.style.width = '100%';
    this.timer = setTimeout(() => {
      el.style.opacity = '0';
      this.timer = setTimeout(() => {
        el.classList.remove('loading');
        el.style.width = '0%';
        this.prog = 0;
      }, 200);
    }, 100);
  }
};
window.TopBar = TopBar;
