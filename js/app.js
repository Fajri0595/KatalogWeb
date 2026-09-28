/* ============================================================
   app.js — router (hash) & bootstrap
   Rute memakai hash (#/...) supaya berfungsi di GitHub Pages
   tanpa pengaturan server tambahan.
   ============================================================ */
const RUTE = [
  { p: '/', n: 'katalog', f: pgKatalog },
  { p: '/aplikasi/:id', n: 'katalog', f: pgDetail },
  { p: '/pesan/:id', n: 'katalog', f: pgPesan },
  { p: '/berhasil', n: 'katalog', f: pgBerhasil },
  { p: '/status', n: 'status', f: pgStatus },
  { p: '/tanda-terima', n: 'status', f: pgTandaTerima },
  { p: '/testimoni', n: 'testimoni', f: pgTestimoni },
  { p: '/bantuan', n: 'bantuan', f: pgBantuan }
];
let tokenRender = 0;

function parseHash() {
  const h = (location.hash || '').replace(/^#/, '') || '/';
  const i = h.indexOf('?');
  const path = (i >= 0 ? h.slice(0, i) : h) || '/';
  const query = {};
  new URLSearchParams(i >= 0 ? h.slice(i + 1) : '').forEach((v, k) => { query[k] = v; });
  return { path: path.length > 1 ? path.replace(/\/+$/, '') : path, query };
}
function cocokRute(path) {
  for (const r of RUTE) {
    const nama = [];
    const re = new RegExp('^' + r.p.replace(/:([a-zA-Z]+)/g, (m, k) => { nama.push(k); return '([^/]+)'; }) + '$');
    const m = re.exec(path);
    if (m) { const params = {}; nama.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); }); return { r, params }; }
  }
  return null;
}

function bersihkanCachePublik() {
  try { localStorage.setItem('kaw_last_update', String(Date.now())); } catch (e) {}
  ss('kaw_boot', null);
  S.siap = false;
  S.detail = {};
  S.faq = null;
}

async function muatBootstrap() {
  let lastUpdate = '0';
  try { lastUpdate = localStorage.getItem('kaw_last_update') || '0'; } catch (e) {}
  const c = ss('kaw_boot');
  if (S.siap && c && c.u === lastUpdate) return;
  if (c && c.u === lastUpdate && Date.now() - c.t < 60 * 1000) {
    S.pengaturan = c.d.pengaturan || {};
    if (!S.pengaturan.whatsapp || /0000-0000|1234567890|contoh/i.test(S.pengaturan.whatsapp)) {
      S.pengaturan.whatsapp = (window.APP_CONFIG && APP_CONFIG.WHATSAPP_DEFAULT) || '085655860383';
    }
    S.apps = c.d.aplikasi;
    S.siap = true;
    return;
  }
  const d = await API.get('getBootstrap');
  S.pengaturan = d.pengaturan || {};
  if (!S.pengaturan.whatsapp || /0000-0000|1234567890|contoh/i.test(S.pengaturan.whatsapp)) {
    S.pengaturan.whatsapp = (window.APP_CONFIG && APP_CONFIG.WHATSAPP_DEFAULT) || '085655860383';
  }
  S.apps = d.aplikasi || [];
  S.siap = true;
  ss('kaw_boot', { t: Date.now(), u: lastUpdate, d });
}

function skelHalaman() {
  return `<div class="container" style="padding-top:48px"><div class="skel" style="height:40px;width:50%;margin:0 auto 16px"></div><div class="skel" style="height:20px;width:65%;margin:0 auto 32px"></div>
    <div class="grid-cards" style="margin-top:48px">${'<div class="card" style="padding:16px"><div class="skel" style="aspect-ratio:16/10"></div><div class="skel" style="height:14px;width:40%;margin-top:16px"></div><div class="skel" style="height:20px;margin-top:10px"></div><div class="skel" style="height:14px;margin-top:10px"></div></div>'.repeat(3)}</div></div>`;
}

async function jalankan() {
  const id = ++tokenRender;
  const batal = () => id !== tokenRender;
  const { path, query } = parseHash();
  window.scrollTo(0, 0);
  document.body.classList.remove('has-buybar');

  if (path === '/admin' || path.indexOf('/admin/') === 0) {
    document.title = 'Admin — ' + (S.pengaturan.nama_toko || APP_CONFIG.NAMA_DEFAULT);
    await pgAdmin({ path, query, batal });
    const admMain = $('#adm-main');
    if (admMain) {
      admMain.classList.remove('page-enter');
      void admMain.offsetWidth;
      admMain.classList.add('page-enter');
    }
    return;
  }
  const hit = cocokRute(path);
  if (!hit) { location.replace('#/'); return; }
  layoutPublik(hit.r.n);
  const el = $('#page');
  document.title = S.pengaturan.nama_toko || APP_CONFIG.NAMA_DEFAULT;
  if (!S.siap) {
    el.innerHTML = skelHalaman();
    try { await muatBootstrap(); }
    catch (e) { if (!batal()) galat(el, e, () => jalankan()); return; }
    if (batal()) return;
    layoutPublik(hit.r.n);
    document.title = S.pengaturan.nama_toko || APP_CONFIG.NAMA_DEFAULT;
  }
  try {
    await hit.r.f({ el, params: hit.params, query, batal });
    el.classList.remove('page-enter');
    void el.offsetWidth;
    el.classList.add('page-enter');
  }
  catch (e) { console.error(e); if (!batal()) galat(el, e, () => jalankan()); }
}

window.addEventListener('hashchange', jalankan);
window.addEventListener('unhandledrejection', (e) => { console.error(e.reason); });
document.addEventListener('DOMContentLoaded', jalankan);
