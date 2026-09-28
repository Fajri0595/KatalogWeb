/* ============================================================
   admin.js — shell admin, login, dashboard, verifikasi pesanan
   ============================================================ */
const Adm = { orders: null, apps: null, tes: null, setting: null, faq: null, dash: null, periode: 'bulan_ini', bukti: {}, tab: 'menunggu', q: '', hal: 1, halDash: 1, tabDash: 'semua', qDash: '', sel: '' };

// ---------- Shell ----------
const NAV_ADMIN = [
  { k: 'ringkasan', t: 'Ringkasan', i: 'dashboard', h: '#/admin' },
  { k: 'aplikasi', t: 'Kelola Katalog', i: 'grid', h: '#/admin/aplikasi' },
  { k: 'pesanan', t: 'Status Pesanan', i: 'file-text', h: '#/admin/pesanan', badge: 'antrean' },
  { k: 'testimoni', t: 'Moderasi Testimoni', i: 'message-square', h: '#/admin/testimoni', badge: 'testi' },
  { k: 'pengaturan', t: 'Pengaturan Sistem', i: 'sliders', h: '#/admin/pengaturan' }
];
function layoutAdmin(aktif, judul) {
  const root = $('#root');
  if (root.dataset.layout !== 'admin') {
    root.dataset.layout = 'admin';
    root.innerHTML = `<div class="adm" id="adm">
      <aside class="sb" id="sb"><div class="sb-brand"><img src="assets/logo.svg" alt=""><div><b id="sb-nama">Katalog Web</b><small>Konsol Administrasi</small></div></div>
        <div class="sb-lbl">Menu Utama</div>
        <nav>${NAV_ADMIN.map((n) => `<a href="${n.h}" data-k="${n.k}">${icon(n.i)}<span>${n.t}</span>${n.badge ? `<span class="badge-n hide" data-badge="${n.badge}">0</span>` : ''}</a>`).join('')}</nav>
        <div class="sb-foot"><a href="#/">${icon('arrow-left')} Kembali ke Publik</a><button id="keluar">${icon('log-out')} Keluar</button><small id="sb-email"></small></div></aside>
      <div class="adm-main"><header class="topbar"><button class="btn btn-ghost btn-icon tools-btn" id="sb-tog" aria-label="Menu">${icon('menu')}</button>
        <div class="crumbs">Area Kerja ${icon('chevron-right')} <b id="crumb">Panel Kontrol</b></div>
        <div class="sp"><a class="btn btn-secondary btn-sm" href="#/" target="_blank" rel="noopener noreferrer">${icon('external-link')} Pratinjau Toko</a><span class="avatar-a" title="Admin">${icon('user')}</span></div></header>
        <div class="adm-in" id="adm-main"></div></div></div>`;
    $('#sb-tog').addEventListener('click', () => $('#adm').classList.toggle('open'));
    $('#sb').addEventListener('click', (e) => { if (e.target.closest('a')) $('#adm').classList.remove('open'); });
    $('#keluar').addEventListener('click', keluarAdmin);
  }
  $('#sb-nama').textContent = (S.pengaturan.nama_toko || 'Katalog Web');
  $('#sb-email').textContent = 'Masuk sebagai: ' + Sesi.email();
  $$('.sb nav a').forEach((a) => a.classList.toggle('active', a.dataset.k === aktif));
  $('#crumb').textContent = judul || 'Panel Kontrol';
  const waf = $('#wa-float'); if (waf) waf.classList.add('hide');
  perbaruiBadge();
}
function perbaruiBadge() {
  const set_ = (k, n) => { const b = $('[data-badge="' + k + '"]'); if (b) { b.textContent = n; b.classList.toggle('hide', !n); } };
  if (Adm.orders) set_('antrean', Adm.orders.filter((o) => o.status === 'Menunggu Verifikasi').length);
  if (Adm.tes) set_('testi', Adm.tes.filter((t) => t.status === 'Menunggu').length);
}
async function keluarAdmin() {
  try { await API.admin('adminLogout'); } catch (e) { /* abaikan */ }
  Sesi.hapus(); Adm.orders = Adm.apps = Adm.tes = Adm.setting = Adm.faq = Adm.dash = null;
  toast('Anda telah keluar.', 'info');
  $('#root').dataset.layout = '';
  location.hash = '#/admin';
  if (location.hash === '#/admin') jalankan();
}
const ambil = async (aksi, data) => API.admin(aksi, data);
async function muatPesanan(paksa) { if (!Adm.orders || paksa) { Adm.orders = await ambil('adminGetOrders'); perbaruiBadge(); } return Adm.orders; }
async function muatTestimoni(paksa) { if (!Adm.tes || paksa) { Adm.tes = await ambil('adminGetTestimonials'); perbaruiBadge(); } return Adm.tes; }
async function muatAplikasi(paksa) { if (!Adm.apps || paksa) Adm.apps = await ambil('adminGetApps'); return Adm.apps; }
function unduhCsv(nama, baris) {
  const sel = (v) => '"' + String(v === undefined || v === null ? '' : v).replace(/"/g, '""') + '"';
  const csv = '\ufeff' + baris.map((r) => r.map(sel).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = nama; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function skelAdmin(n) {
  return `<div class="stats">${'<div class="card stat"><div class="skel" style="height:14px;width:50%"></div><div class="skel" style="height:34px;width:60%"></div><div class="skel" style="height:14px"></div></div>'.repeat(n || 4)}</div><div class="card card-p"><div class="skel" style="height:260px"></div></div>`;
}
function galatAdmin(el, e, ulang) {
  el.innerHTML = `<div class="card empty"><div class="em-ic">${icon('alert-triangle')}</div><h3>Data belum bisa dimuat</h3><p>${esc(e.message)}</p><button class="btn btn-primary" style="margin-top:16px" id="ulang">${icon('refresh')} Coba lagi</button></div>`;
  $('#ulang', el).addEventListener('click', ulang);
}

// ---------- Dispatcher ----------
async function pgAdmin(c) {
  if (!Sesi.ambil()) return renderMasuk(c);
  const bagian = c.path.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  const k = bagian[0] || 'ringkasan';
  const judul = { ringkasan: 'Panel Kontrol', aplikasi: 'Kelola Katalog', pesanan: 'Status Pesanan', testimoni: 'Moderasi Testimoni', pengaturan: 'Pengaturan Sistem' }[k];
  if (!judul) { location.replace('#/admin'); return; }
  layoutAdmin(k, bagian[1] ? (bagian[1] === 'baru' ? 'Tambah Aplikasi' : 'Edit Aplikasi') : judul);
  const el = $('#adm-main');
  const ctx = { el, query: c.query, batal: c.batal, bagian };
  try {
    if (k === 'ringkasan') await admRingkasan(ctx);
    else if (k === 'pesanan') await admPesanan(ctx);
    else if (k === 'aplikasi') await (bagian[1] ? admAplikasiForm(ctx) : admAplikasi(ctx));
    else if (k === 'testimoni') await admTestimoni(ctx);
    else if (k === 'pengaturan') await admPengaturan(ctx);
  } catch (e) { if (e.code === 'AUTH') return; console.error(e); if (!c.batal()) galatAdmin(el, e, () => jalankan()); }
}

// ---------- Login ----------
function renderMasuk(c) {
  const waf = $('#wa-float'); if (waf) waf.classList.add('hide');
  const root = $('#root'); root.dataset.layout = 'masuk';
  document.title = 'Masuk Admin — ' + (S.pengaturan.nama_toko || APP_CONFIG.NAMA_DEFAULT);
  root.innerHTML = `<div class="login-wrap"><div style="width:100%;max-width:440px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><a href="#/" class="t-sm" style="display:inline-flex;gap:6px;align-items:center;color:var(--muted)">${icon('arrow-left')} Kembali ke Katalog Publik</a></div>
    <div class="card login-card"><img class="login-logo" src="assets/logo.svg" alt="" style="display:block">
      <div style="text-align:center;margin-bottom:24px"><span class="pill pill-indigo nodot" style="margin-bottom:12px">${icon('shield')} Area Khusus Administrator</span><h1 class="h-lg" style="margin-top:8px">Masuk Portal Admin</h1><p class="muted" style="margin-top:6px">Masukkan email dan kata sandi untuk mengelola katalog, verifikasi pesanan, dan laporan.</p></div>
      <form id="flogin" novalidate><div id="lerr"></div>
        <div class="field"><label for="le">Email Administrator</label><div class="ig">${icon('at')}<input class="input" id="le" type="email" autocomplete="username" required></div></div>
        <div class="field"><label for="lp">Kata Sandi</label><div class="ig">${icon('lock')}<input class="input" id="lp" type="password" autocomplete="current-password" placeholder="Masukkan kata sandi admin..." required><button type="button" class="btn btn-ghost btn-icon end" id="lmata" aria-label="Tampilkan kata sandi">${icon('eye')}</button></div></div>
        <div class="note-i" style="margin-bottom:16px">${icon('clock')}<div>Sesi login berakhir otomatis setelah 2 jam tanpa aktivitas.</div></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit" id="lmasuk">Masuk ke Dashboard Admin ${icon('arrow-right')}</button></form></div></div></div>`;
  $('#lmata').addEventListener('click', () => { const p = $('#lp'); const t = p.type === 'password'; p.type = t ? 'text' : 'password'; $('#lmata').innerHTML = icon(t ? 'eye-off' : 'eye'); });
  $('#le').value = Sesi.email() || ''; $('#le').focus();
  $('#flogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#lmasuk'); tombolBusy(btn, true, 'Memeriksa...');
    try {
      const r = await API.post('adminLogin', { email: $('#le').value.trim(), sandi: $('#lp').value });
      Sesi.simpan(r.token, r.email);
      toast('Selamat datang kembali!', 'ok', 2500);
      $('#root').dataset.layout = '';
      if (location.hash === '#/admin') jalankan(); else location.hash = '#/admin';
    } catch (err) {
      tombolBusy(btn, false); $('#lp').value = '';
      const sisa = err.extra && err.extra.sisa;
      $('#lerr').innerHTML = `<div class="alert err" style="margin-bottom:16px">${icon('alert-circle')}<div><b>${err.code === 'TERKUNCI' ? 'Akses Dikunci Sementara' : 'Otentikasi Gagal'}</b><br>${esc(err.message)}${typeof sisa === 'number' && sisa > 0 ? ' Percobaan tersisa: <b>' + sisa + '</b> kali sebelum akses dikunci 15 menit.' : ''}</div></div>`;
      if (err.code === 'TERKUNCI') btn.disabled = true;
    }
  });
}

// ============================================================
// RINGKASAN (DASHBOARD)
// ============================================================
const PERIODE = [['bulan_ini', 'Bulan Ini'], ['bulan_lalu', 'Bulan Lalu'], ['30_hari', '30 Hari Terakhir'], ['6_bulan', '6 Bulan Terakhir'], ['semua', 'Semua Waktu']];
function barisPesananRingkas(o) {
  const tombol = o.status === 'Menunggu Verifikasi' ? `<a class="btn btn-accent btn-sm" href="#/admin/pesanan?kode=${encodeURIComponent(o.kode)}">Verifikasi</a>`
    : o.status === 'Ditolak' ? `<button class="btn btn-secondary btn-sm" data-alasan="${esc(o.kode)}">Alasan</button>`
      : `<a class="btn btn-secondary btn-sm" href="#/admin/pesanan?kode=${encodeURIComponent(o.kode)}">Detail</a>`;
  return `<tr><td><span class="code">${esc(o.kode)}</span></td><td><b>${esc(o.nama)}</b><div class="sub">${esc(o.email)}</div></td><td>${icon('package')} ${esc(o.aplikasi.length > 26 ? o.aplikasi.slice(0, 26) + '…' : o.aplikasi)}</td><td class="mono">${rupiah(o.jumlah)}</td><td>${pil(o.status)}</td><td class="sub">${esc(relatif(o.tanggal))}</td><td style="text-align:right">${tombol}</td></tr>`;
}
async function admRingkasan(c) {
  const el = c.el;
  if (!Adm.dash) el.innerHTML = skelAdmin(4);
  const [dash, orders, tes] = await Promise.all([
    Adm.dash ? Adm.dash : ambil('adminGetDashboard', { periode: Adm.periode }),
    muatPesanan(false),
    muatTestimoni(false)
  ]);
  if (c.batal()) return;
  Adm.dash = dash;
  const r = dash.ringkas;
  const deltaHtml = r.delta_persen === null ? '' : `<span class="delta ${r.delta_persen >= 0 ? 'up' : 'down'}">${r.delta_persen >= 0 ? '↗ +' : '↘ '}${r.delta_persen}%</span>`;
  const puncak = dash.deret.reduce((m, d) => (d.pendapatan > (m ? m.pendapatan : 0) ? d : m), null);
  const st = dash.status; const totalPes = st.Disetujui + st['Menunggu Verifikasi'] + st.Ditolak;
  el.innerHTML = `
    <div class="page-h"><div><div class="eyebrow">Sistem Pelaporan</div><h1 class="h-lg" style="margin-top:4px">Dashboard Ringkasan &amp; Laporan</h1><p>Pemantauan transaksi, moderasi testimoni klien, dan analitik katalog aplikasi.</p></div>
      <div class="acts"><select class="select" id="periode" style="width:auto;min-width:200px" aria-label="Periode laporan">${PERIODE.map((p) => `<option value="${p[0]}" ${p[0] === Adm.periode ? 'selected' : ''}>${p[0] === 'bulan_ini' ? dash.label : p[1]}</option>`).join('')}</select>
        <button class="btn btn-secondary" id="csv">${icon('download')} Export Laporan (CSV)</button><button class="btn btn-accent" id="segar">${icon('refresh')} Perbarui Data</button></div></div>
    <div class="stats">
      <div class="card stat"><div class="sh"><span class="lbl-mono">Antrean Validasi</span>${r.antrean ? '<span class="pill pill-err">Butuh Tindakan Segera</span>' : '<span class="pill pill-ok">Beres</span>'}</div><div class="sv">${r.antrean}<small>Pesanan</small></div><div class="sd">${r.antrean ? 'Bukti transfer baru diunggah dan menunggu konfirmasi Anda.' : 'Tidak ada pesanan yang menunggu verifikasi.'}</div><div class="sl">${r.antrean ? `<a href="#/admin/pesanan">Tinjau Sekarang ${icon('arrow-right')}</a>` : '<span></span>'}</div></div>
      <div class="card stat"><div class="sh"><span class="lbl-mono">Total Pendapatan</span>${deltaHtml}</div><div class="sv" style="font-size:26px">${rupiah(r.pendapatan)}</div><div class="sd">Akumulasi dari <b style="color:var(--ink)">${r.pesanan_sukses}</b> pesanan sukses selama periode ini.</div><div class="sl"><span class="muted">${r.pesanan_periode} pesanan masuk</span></div></div>
      <div class="card stat"><div class="sh"><span class="lbl-mono">Ulasan Klien</span>${r.testimoni_menunggu ? '<span class="pill pill-indigo">Perlu Dimoderasi</span>' : ''}</div><div class="sv">${r.testimoni_menunggu}<small>Testimoni</small></div><div class="sd">${r.testimoni_disetujui ? 'Rata-rata rating publik ' + r.rating_rata.toFixed(1) + ' dari 5 bintang.' : 'Belum ada testimoni yang tampil.'}</div><div class="sl"><a href="#/admin/testimoni">Buka Moderasi ${icon('arrow-right')}</a></div></div>
      <div class="card stat"><div class="sh"><span class="lbl-mono">Inventaris Katalog</span></div><div class="sv">${r.aplikasi_total}<small>Aplikasi</small></div><div class="sd"><span style="color:var(--ok-t)">●</span> ${r.aplikasi_aktif} Aktif &nbsp; <span style="color:var(--faint)">●</span> ${r.aplikasi_segera} Segera Hadir</div><div class="sl"><a href="#/admin/aplikasi">Kelola Aplikasi ${icon('arrow-right')}</a></div></div></div>
    ${r.email_gagal ? `<div class="alert warn" style="margin-bottom:24px">${icon('alert-triangle')}<div><b>${r.email_gagal} email keputusan gagal terkirim.</b> Buka <a href="#/admin/pesanan?tab=semua">Status Pesanan</a> lalu gunakan tombol Kirim Ulang pada pesanan bertanda "Gagal".</div></div>` : ''}
    <div class="dash-grid">
      <div class="card card-p"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><div class="lbl-mono">Analitik Transaksi</div><h2 class="h-md" style="margin-top:2px">Tren Penjualan &amp; Kunjungan Katalog</h2></div><div class="legend"><span><i style="background:#4F46E5"></i>Penjualan (IDR)</span><span><i style="background:#94A3B8"></i>Kunjungan</span></div></div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin:16px 0 8px;gap:12px;flex-wrap:wrap"><div><div class="hint">Akumulasi ${esc(dash.label)}</div><div style="font-size:30px;font-weight:700;letter-spacing:-.025em">${rupiah(r.pendapatan)} <span class="muted" style="font-size:14px;font-weight:500">/ ${r.pesanan_sukses} Transaksi</span></div></div><div style="text-align:right"><div class="hint">Tingkat Konversi</div><b class="mono">${r.konversi === null ? '-' : r.konversi + '%'}</b> <span class="muted t-sm">(${r.kunjungan} kunjungan)</span></div></div>
        <div class="chart-box">${grafikTren(dash.deret, dash.mode)}</div>
        ${puncak ? `<div class="insight">${icon('trending-up')}<div>Penjualan tertinggi tercatat pada <b>${esc(labelKunci(puncak.kunci, dash.mode))}</b> sebesar ${rupiah(puncak.pendapatan)}.</div></div>` : ''}</div>
      <div style="display:flex;flex-direction:column;gap:16px"><div class="card card-p"><div style="display:flex;justify-content:space-between;align-items:center"><h2 class="h-sm">Distribusi Status Pesanan</h2><span class="lbl-mono">N = ${totalPes}</span></div>${barStatus(st)}</div>
        <div class="card card-p" style="flex:1"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h2 class="h-sm">Aplikasi Terlaris</h2><span class="hint">Berdasarkan omzet</span></div>${barTerlaris(dash.terlaris)}</div></div></div>
    <div class="card"><div class="tbl-head"><div><div class="lbl-mono">Log Transaksi</div><h2 class="h-md" style="margin-top:2px">Ringkasan Pesanan Terbaru</h2></div><div style="display:flex;gap:8px"><div class="ig" style="min-width:240px">${icon('search')}<input class="input" id="qd" placeholder="Cari kode atau pembeli..." value="${esc(Adm.qDash)}"></div></div></div>
      <div style="padding:0 20px 16px" id="tabd"></div><div class="tbl-wrap" id="tbld"></div><div class="tbl-foot" id="fotd"></div></div>`;
  $('#periode').addEventListener('change', (e) => { Adm.periode = e.target.value; Adm.dash = null; jalankan(); });
  $('#segar').addEventListener('click', async () => {
    const b = $('#segar');
    tombolBusy(b, true, 'Memperbarui...');
    try {
      const [dash] = await Promise.all([
        ambil('adminGetDashboard', { periode: Adm.periode }),
        muatPesanan(true),
        muatTestimoni(true)
      ]);
      Adm.dash = dash;
      await admRingkasan(c);
      toast('Data dashboard diperbarui.', 'ok');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      tombolBusy(b, false);
    }
  });
  $('#csv').addEventListener('click', () => {
    const mulai = new Date(dash.rentang.mulai), akhir = new Date(dash.rentang.akhir);
    const data = orders.filter((o) => { const d = new Date(o.tanggal); return d >= mulai && d < akhir; });
    unduhCsv('laporan-pesanan-' + dash.periode + '.csv', [['Kode', 'Tanggal', 'Aplikasi', 'Versi', 'Nama', 'Email', 'WhatsApp', 'Nominal', 'Status', 'Tanggal Verifikasi', 'Status Email']].concat(data.map((o) => [o.kode, o.tanggal, o.aplikasi, o.versi, o.nama, o.email, o.wa, o.jumlah, o.status, o.tanggal_verifikasi, o.email_status])));
  });
  function tabelDash() {
    const q = Adm.qDash.trim().toLowerCase();
    const filt = orders.filter((o) => (Adm.tabDash === 'semua' || o.status === Adm.tabDash) && (!q || (o.kode + o.nama + o.email).toLowerCase().indexOf(q) >= 0));
    const per = 5, hal = Math.min(Adm.halDash, Math.max(1, Math.ceil(filt.length / per))); Adm.halDash = hal;
    const n = (s) => orders.filter((o) => o.status === s).length;
    $('#tabd').innerHTML = `<div class="tabs seg-t">${[['semua', 'Semua', orders.length], ['Menunggu Verifikasi', 'Menunggu Verifikasi', n('Menunggu Verifikasi')], ['Disetujui', 'Disetujui', n('Disetujui')], ['Ditolak', 'Ditolak', n('Ditolak')]].map((t) => `<button class="${Adm.tabDash === t[0] ? 'on' : ''}" data-td="${t[0]}">${t[1]} <span class="n ${t[0] === 'Menunggu Verifikasi' && t[2] ? 'hot' : ''}">${t[2]}</span></button>`).join('')}</div>`;
    $('#tbld').innerHTML = filt.length ? `<table class="tbl"><thead><tr><th>Kode Pesanan</th><th>Pembeli</th><th>Aplikasi</th><th>Nominal</th><th>Status Validasi</th><th>Waktu Masuk</th><th style="text-align:right">Aksi</th></tr></thead><tbody>${filt.slice((hal - 1) * per, hal * per).map(barisPesananRingkas).join('')}</tbody></table>` : `<div class="empty"><div class="em-ic">${icon('file-text')}</div><h3>Belum ada pesanan</h3><p>Pesanan yang masuk akan tampil di sini.</p></div>`;
    const tot = Math.max(1, Math.ceil(filt.length / per));
    $('#fotd').innerHTML = `<span>Menampilkan <b style="color:var(--ink)">${filt.length ? (hal - 1) * per + 1 : 0} - ${Math.min(filt.length, hal * per)}</b> dari <b style="color:var(--ink)">${filt.length}</b> transaksi</span><div class="pager" style="margin:0;padding:0;border:0"><div class="pg"><button data-hd="${hal - 1}" ${hal <= 1 ? 'disabled' : ''}>${icon('chevron-left')}</button>${Array.from({ length: tot }, (_, i) => `<button class="${i + 1 === hal ? 'on' : ''}" data-hd="${i + 1}">${i + 1}</button>`).join('')}<button data-hd="${hal + 1}" ${hal >= tot ? 'disabled' : ''}>${icon('chevron-right')}</button></div></div>`;
  }
  tabelDash();
  $('#qd').addEventListener('input', debounce((e) => { Adm.qDash = e.target.value; Adm.halDash = 1; tabelDash(); }, 200));
  on(el, 'click', '[data-td]', (e, t) => { Adm.tabDash = t.dataset.td; Adm.halDash = 1; tabelDash(); });
  on(el, 'click', '[data-hd]', (e, t) => { Adm.halDash = +t.dataset.hd; tabelDash(); });
  on(el, 'click', '[data-alasan]', (e, t) => { const o = orders.find((x) => x.kode === t.dataset.alasan); modal(`<h3>Alasan penolakan</h3><p class="mono muted" style="font-size:12px">${esc(o.kode)}</p><div class="alert err" style="margin-top:12px">${icon('alert-triangle')}<div>${esc(o.catatan || '-')}</div></div><div class="act"><button class="btn btn-primary" data-m="ok">Tutup</button></div>`); });
}

// ============================================================
// STATUS PESANAN & VERIFIKASI
// ============================================================
const ALASAN_CEPAT = ['Nominal Kurang', 'Bukti Buram', 'Mutasi Belum Masuk'];
function statusEmail(o) {
  if (o.status === 'Menunggu Verifikasi') return '<span class="muted t-sm">' + icon('clock') + ' Tertahan</span>';
  if (o.email_status === 'Terkirim') return '<span class="t-sm" style="color:var(--ok-t)">' + icon('check-circle') + ' Terkirim</span>';
  if (o.email_status === 'Gagal') return '<span class="t-sm" style="color:var(--err-t)">' + icon('alert-triangle') + ' Gagal</span>';
  return '<span class="muted t-sm">-</span>';
}
async function muatBukti(o) {
  const b = o.bukti;
  if (!b.id) throw new Error('Berkas tidak tersedia.');
  if (Adm.bukti[b.id]) return Adm.bukti[b.id];
  const d = await ambil('adminGetFile', { id: b.id });
  const bin = atob(d.base64); const arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([arr], { type: d.mime }));
  Adm.bukti[b.id] = { url, mime: d.mime };
  return Adm.bukti[b.id];
}
async function admPesanan(c) {
  const el = c.el;
  if (!Adm.orders) el.innerHTML = skelAdmin(1);
  const orders = await muatPesanan(false);
  if (c.batal()) return;
  if (c.query.kode) { Adm.sel = c.query.kode; const o = orders.find((x) => x.kode === c.query.kode); if (o) Adm.tab = o.status === 'Menunggu Verifikasi' ? 'menunggu' : o.status === 'Disetujui' ? 'disetujui' : 'ditolak'; }
  if (c.query.tab) Adm.tab = c.query.tab;
  Adm.hal = 1;
  const pending = () => orders.filter((o) => o.status === 'Menunggu Verifikasi').sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));
  const peta = { menunggu: 'Menunggu Verifikasi', disetujui: 'Disetujui', ditolak: 'Ditolak' };
  el.innerHTML = `<div class="page-h"><div><div class="eyebrow">Operasional Pesanan</div><h1 class="h-lg" style="margin-top:4px">Verifikasi Pembayaran &amp; Daftar Pesanan</h1><p>Tinjau struk transfer bank manual, validasi mutasi, dan picu pengiriman lisensi otomatis.</p></div><div class="acts"><button class="btn btn-secondary" id="csv">${icon('download')} Unduh Rekap CSV</button><button class="btn btn-secondary" id="segar">${icon('refresh')} Segarkan</button></div></div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:16px"><div id="tabs"></div><div class="ig" style="flex:1;min-width:240px;max-width:360px;margin-left:auto">${icon('search')}<input class="input mono" id="q" placeholder="Cari kode / nama / email..." value="${esc(Adm.q)}"></div></div>
    <div id="panel"></div>
    <div class="card" style="margin-top:24px"><div class="tbl-head"><div><h2 class="h-md">Daftar Seluruh Pesanan</h2><p class="muted t-sm" id="tot"></p></div></div><div class="tbl-wrap" id="tbl"></div><div class="tbl-foot" id="fot"></div></div>`;

  function daftarTab() {
    const q = Adm.q.trim().toLowerCase();
    return orders.filter((o) => (Adm.tab === 'semua' || o.status === peta[Adm.tab]) && (!q || (o.kode + o.nama + o.email + o.aplikasi).toLowerCase().indexOf(q) >= 0));
  }
  function gambarTab() {
    const n = (s) => orders.filter((o) => o.status === s).length;
    $('#tabs').innerHTML = `<div class="tabs seg-t">${[['menunggu', 'Menunggu Verifikasi', n('Menunggu Verifikasi'), 1], ['disetujui', 'Disetujui', n('Disetujui')], ['ditolak', 'Ditolak', n('Ditolak')], ['semua', 'Semua Pesanan', orders.length]].map((t) => `<button class="${Adm.tab === t[0] ? 'on' : ''}" data-tab="${t[0]}">${t[1]} <span class="n ${t[3] && t[2] ? 'hot' : ''}">${t[2]}</span></button>`).join('')}</div>`;
  }
  function gambarTabel() {
    const daftar = orders.filter((o) => { const q = Adm.q.trim().toLowerCase(); return !q || (o.kode + o.nama + o.email + o.aplikasi).toLowerCase().indexOf(q) >= 0; });
    const per = 8, tot = Math.max(1, Math.ceil(daftar.length / per)); Adm.hal = Math.min(Adm.hal, tot);
    $('#tot').textContent = 'Total ' + orders.length + ' transaksi tercatat di database.';
    $('#tbl').innerHTML = daftar.length ? `<table class="tbl"><thead><tr><th>Kode &amp; Tanggal</th><th>Pelanggan</th><th>Produk Aplikasi</th><th>Nominal</th><th>Status Pembayaran</th><th>Email</th><th>Bukti</th><th style="text-align:right">Tindakan</th></tr></thead><tbody>${daftar.slice((Adm.hal - 1) * per, Adm.hal * per).map((o) => `<tr class="${o.kode === Adm.sel ? 'sel' : ''}"><td><span class="code">${esc(o.kode)}</span><div class="sub">${esc(tgl(o.tanggal, true))}</div></td><td><b>${esc(o.nama)}</b><div class="sub">${esc(o.email)}</div></td><td>${esc(o.aplikasi.length > 30 ? o.aplikasi.slice(0, 30) + '…' : o.aplikasi)}<div class="sub">v${esc(o.versi)}</div></td><td class="mono">${rupiah(o.jumlah)}</td><td>${pil(o.status)}</td><td>${statusEmail(o)}</td><td><button class="btn btn-ghost btn-sm" data-pilih="${esc(o.kode)}">${icon('image')} Lihat Bukti</button></td><td style="text-align:right"><button class="btn ${o.kode === Adm.sel ? 'btn-accent' : 'btn-secondary'} btn-sm" data-pilih="${esc(o.kode)}">${o.kode === Adm.sel ? 'Sedang Ditinjau' : o.status === 'Menunggu Verifikasi' ? 'Periksa' : 'Detail'}</button></td></tr>`).join('')}</tbody></table>` : `<div class="empty"><div class="em-ic">${icon('file-text')}</div><h3>Pesanan tidak ditemukan</h3></div>`;
    $('#fot').innerHTML = `<span>Menampilkan <b style="color:var(--ink)">${daftar.length ? (Adm.hal - 1) * per + 1 : 0} - ${Math.min(daftar.length, Adm.hal * per)}</b> dari <b style="color:var(--ink)">${daftar.length}</b> total pesanan</span><div class="pager" style="margin:0;padding:0;border:0"><div class="pg"><button data-h="${Adm.hal - 1}" ${Adm.hal <= 1 ? 'disabled' : ''}>${icon('chevron-left')}</button>${Array.from({ length: tot }, (_, i) => `<button class="${i + 1 === Adm.hal ? 'on' : ''}" data-h="${i + 1}">${i + 1}</button>`).join('')}<button data-h="${Adm.hal + 1}" ${Adm.hal >= tot ? 'disabled' : ''}>${icon('chevron-right')}</button></div></div>`;
  }
  async function gambarPanel() {
    const daftar = daftarTab();
    if (!daftar.find((o) => o.kode === Adm.sel)) Adm.sel = daftar[0] ? daftar[0].kode : '';
    const o = orders.find((x) => x.kode === Adm.sel);
    const panel = $('#panel');
    if (!o) { panel.innerHTML = `<div class="card empty"><div class="em-ic">${icon('check-circle')}</div><h3>${Adm.tab === 'menunggu' ? 'Tidak ada pesanan yang menunggu verifikasi' : 'Tidak ada pesanan pada tab ini'}</h3><p>Pesanan baru akan muncul otomatis di sini.</p></div>`; return; }
    const menunggu = o.status === 'Menunggu Verifikasi';
    const antre = pending(); const idx = antre.findIndex((x) => x.kode === o.kode);
    const wa = o.wa ? `<a class="btn btn-ghost btn-sm" href="${esc(linkWA(o.wa, 'Halo ' + o.nama + ', terkait pesanan ' + o.kode))}" target="_blank" rel="noopener noreferrer">${icon('message-circle')} Hubungi via WA</a>` : '';
    panel.innerHTML = `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:16px 20px;border-bottom:1px solid var(--line)">
        <div style="display:flex;align-items:center;gap:10px"><span class="pill ${menunggu ? 'pill-warn' : o.status === 'Disetujui' ? 'pill-ok' : 'pill-err'} nodot" style="height:10px;width:10px;padding:0"></span><b class="h-sm">${menunggu ? 'Panel Verifikasi Cepat (Aktif)' : 'Detail Pesanan'}</b>${menunggu && idx >= 0 ? `<span class="muted t-sm">Urutan ${idx + 1} dari ${antre.length} Antrean</span>` : ''}</div>
        <div style="display:flex;align-items:center;gap:8px"><span class="muted t-sm">Diajukan ${esc(relatif(o.bukti.tanggal || o.tanggal))}</span>${menunggu && antre.length > 1 ? `<button class="btn btn-secondary btn-sm btn-icon" data-nav="-1" aria-label="Sebelumnya">${icon('chevron-left')}</button><button class="btn btn-secondary btn-sm btn-icon" data-nav="1" aria-label="Berikutnya">${icon('chevron-right')}</button>` : ''}</div></div>
      <div class="verify"><div style="min-width:0;display:flex;flex-direction:column;gap:16px">
        <div class="row c3" style="background:var(--alt);padding:14px;border-radius:12px"><div><div class="lbl-mono">Kode Pesanan</div><div class="mono" style="font-weight:600;margin-top:2px">${esc(o.kode)} <button class="btn btn-ghost btn-sm btn-icon" data-salin="${esc(o.kode)}" aria-label="Salin">${icon('copy')}</button></div></div><div><div class="lbl-mono">Waktu Unggah</div><div style="margin-top:2px;font-weight:500">${esc(tgl(o.bukti.tanggal || o.tanggal, true))}</div></div><div><div class="lbl-mono">Kanal Bayar</div><div style="margin-top:2px;font-weight:500;color:var(--indigo)">Manual Transfer</div></div></div>
        <div class="cust"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;flex-wrap:wrap"><div><b class="h-sm">${esc(o.nama)}</b><div class="muted t-sm" style="margin-top:2px">${icon('mail')} ${esc(o.email)}${o.wa ? ' • ' + icon('message-circle') + ' ' + esc(o.wa) : ''}</div></div>${wa}</div>
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--line-2)"><div style="display:flex;gap:10px;align-items:center;min-width:0"><span class="avatar" style="border-radius:8px">${icon('package')}</span><div style="min-width:0"><b class="t-sm">${esc(o.aplikasi)}</b><div class="hint mono">v${esc(o.versi)}</div></div></div><div style="text-align:right"><div class="mono" style="font-size:20px;font-weight:600">${rupiah(o.jumlah)}</div>${o.kode_kupon || o.diskon ? `<span class="pill pill-ok nodot" style="height:18px;font-size:10px;padding:0 6px">${icon('tag')} Kupon: ${esc(o.kode_kupon || 'Promo')} (-${rupiah(o.diskon)})</span>` : '<div class="hint">Nominal pesanan</div>'}</div></div></div>
        <div><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap"><span class="lbl-mono">Bukti Transfer (unggahan pembeli)</span><span class="vtools"><button class="btn btn-secondary btn-sm" id="zoom">${icon('zoom-in')} Toggle Zoom</button><a class="btn btn-secondary btn-sm hide" id="penuh" target="_blank" rel="noopener noreferrer">${icon('maximize')} Buka Penuh</a></span></div>
          <div class="viewer" id="viewer"><span class="muted" style="color:#94A3B8">${icon('refresh', 'spin')} Memuat bukti...</span></div>
          <div class="hint mono" style="margin-top:6px">${esc(o.bukti.nama)} • ${ukuranBerkas(o.bukti.ukuran)}${o.bukti.sebelumnya ? ' • ulang (sebelumnya: ' + esc(o.bukti.sebelumnya) + ')' : ''}</div></div></div>
        <div class="side-panel"><div style="display:flex;justify-content:space-between;align-items:center"><span class="lbl-mono">Status Saat Ini</span>${pil(o.status)}</div>
          ${menunggu ? `<div class="alert info" style="background:#fff">${icon('mail')}<div><b>Template Email #2 Otomatis Siap</b><br>Saat disetujui, sistem mengirim tanda terima PDF, link akses privat, dan tutorial ke <b class="mono">${esc(o.email)}</b> seketika.</div></div>
            <div class="field" style="margin:0"><label for="cat">Catatan Admin (opsional, disimpan ke riwayat)</label><input class="input" id="cat" maxlength="500" placeholder="Catatan internal..."></div>
            <button class="btn btn-success btn-lg btn-block" id="setuju">${icon('check-circle')} Setujui Pembayaran &amp; Kirim Akses</button><p class="hint" style="text-align:center">Akses langsung aktif &amp; token lisensi dibuat otomatis.</p>
            <div class="or-line">atau tolak</div>
            <div><b class="h-sm">Alasan Penolakan (Bila Ditolak)</b><div class="chips-r" style="margin:8px 0">${ALASAN_CEPAT.map((a) => `<button class="chip-s" type="button" data-alasan-cepat="${a}">${a}</button>`).join('')}</div><textarea class="textarea" id="alasan" rows="3" maxlength="500" placeholder="Tuliskan catatan detail untuk pembeli via notifikasi email..."></textarea></div>
            <button class="btn btn-danger-o btn-block" id="tolak">${icon('x-circle')} Tolak Pembayaran &amp; Kirim Instruksi Ulang</button>`
        : `<div class="kv" style="padding:6px 0"><span>Diputuskan</span><span>${esc(tgl(o.tanggal_verifikasi, true))}</span></div><div class="kv" style="padding:6px 0"><span>Oleh</span><span>${esc(o.diverifikasi_oleh || '-')}</span></div><div class="kv" style="padding:6px 0"><span>Status email</span><span>${statusEmail(o)}</span></div>
            ${o.catatan ? `<div class="alert ${o.status === 'Ditolak' ? 'err' : 'info'}" style="background:#fff">${icon('info')}<div><b>Catatan</b><br>${esc(o.catatan)}</div></div>` : ''}
            <button class="btn btn-secondary btn-block" id="kirim-ulang">${icon('mail')} Kirim Ulang Email ke Pembeli</button>`}
          <div class="hint" style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid var(--line-2);padding-top:10px"><span>Pemeriksa: ${esc(Sesi.email())}</span></div></div></div></div>`;
    // muat bukti
    muatBukti(o).then((b) => {
      if (Adm.sel !== o.kode) return;
      const v = $('#viewer'); if (!v) return;
      v.innerHTML = b.mime === 'application/pdf' ? `<iframe src="${b.url}" title="Bukti PDF"></iframe>` : `<img alt="Bukti transfer ${esc(o.kode)}" src="${b.url}">`;
      const p = $('#penuh'); p.href = b.url; p.classList.remove('hide');
    }).catch((e) => { const v = $('#viewer'); if (v) v.innerHTML = `<span style="color:#FCA5A5;padding:16px;text-align:center">${esc(e.message)}</span>`; });
    const z = $('#zoom'); if (z) z.addEventListener('click', () => $('#viewer').classList.toggle('zoom'));
    const kr = $('#kirim-ulang'); if (kr) kr.addEventListener('click', async () => { tombolBusy(kr, true, 'Mengirim...'); try { const r = await ambil('adminResendEmail', { kode: o.kode }); toast(r.pesan, 'ok'); await segarkan(); } catch (e) { toast(e.message, 'err', 6000); tombolBusy(kr, false); } });
    const sj = $('#setuju');
    if (sj) {
      sj.addEventListener('click', async () => {
        const ok = await konfirmasi('Setujui pembayaran ini?', 'Pesanan <b>' + esc(o.kode) + '</b> senilai <b>' + rupiah(o.jumlah) + '</b> akan disetujui dan email akses dikirim ke <b>' + esc(o.email) + '</b>. Tindakan ini tidak dapat dibatalkan.', { ok: 'Ya, Setujui & Kirim' });
        if (!ok) return;
        tombolBusy(sj, true, 'Menyetujui & mengirim email...');
        try { const r = await ambil('adminApproveOrder', { kode: o.kode, catatan: $('#cat').value }); toast(r.pesan, r.email_status === 'Terkirim' ? 'ok' : 'warn', 6000); await segarkan(true); } catch (e) { toast(e.message, 'err', 7000); tombolBusy(sj, false); }
      });
      on(panel, 'click', '[data-alasan-cepat]', (e, t) => { const a = $('#alasan'); a.value = (a.value ? a.value + ' ' : '') + t.dataset.alasanCepat + '.'; a.focus(); });
      $('#tolak').addEventListener('click', async (e) => {
        const alasan = $('#alasan').value.trim();
        if (alasan.length < 5) { toast('Tulis alasan penolakan agar pembeli tahu apa yang harus diperbaiki.', 'warn'); $('#alasan').focus(); return; }
        const ok = await konfirmasi('Tolak pembayaran ini?', 'Pembeli akan menerima email berisi alasan dan instruksi mengunggah ulang bukti transfer.', { ok: 'Ya, Tolak', bahaya: true });
        if (!ok) return;
        const b = e.currentTarget; tombolBusy(b, true, 'Menolak...');
        try { const r = await ambil('adminRejectOrder', { kode: o.kode, alasan }); toast(r.pesan, r.email_status === 'Terkirim' ? 'ok' : 'warn', 6000); await segarkan(true); } catch (x) { toast(x.message, 'err', 7000); tombolBusy(b, false); }
      });
    }
  }
  async function segarkan(lanjutAntre) {
    const lama = Adm.sel;
    await muatPesanan(true);
    orders.length = 0; Adm.orders.forEach((x) => orders.push(x));
    if (lanjutAntre) { const p = pending(); Adm.sel = p[0] ? p[0].kode : lama; if (!p[0]) Adm.tab = 'semua'; }
    gambarTab(); gambarTabel(); await gambarPanel();
  }
  gambarTab(); gambarTabel(); gambarPanel();
  $('#segar').addEventListener('click', () => segarkan());
  $('#csv').addEventListener('click', () => unduhCsv('rekap-pesanan.csv', [['Kode', 'Tanggal', 'Aplikasi', 'Versi', 'Nama', 'Email', 'WhatsApp', 'Nominal', 'Status', 'Catatan', 'Tanggal Verifikasi', 'Status Email']].concat(orders.map((o) => [o.kode, o.tanggal, o.aplikasi, o.versi, o.nama, o.email, o.wa, o.jumlah, o.status, o.catatan, o.tanggal_verifikasi, o.email_status]))));
  $('#q').addEventListener('input', debounce((e) => { Adm.q = e.target.value; Adm.hal = 1; gambarTab(); gambarTabel(); gambarPanel(); }, 250));
  on(el, 'click', '[data-tab]', (e, t) => { Adm.tab = t.dataset.tab; Adm.hal = 1; Adm.sel = ''; gambarTab(); gambarPanel().then(gambarTabel); });
  on(el, 'click', '[data-pilih]', (e, t) => { Adm.sel = t.dataset.pilih; const o = orders.find((x) => x.kode === Adm.sel); if (o && Adm.tab !== 'semua') Adm.tab = o.status === 'Menunggu Verifikasi' ? 'menunggu' : o.status === 'Disetujui' ? 'disetujui' : 'ditolak'; gambarTab(); gambarTabel(); gambarPanel(); $('#panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  on(el, 'click', '[data-h]', (e, t) => { Adm.hal = +t.dataset.h; gambarTabel(); });
  on(el, 'click', '[data-nav]', (e, t) => { const p = pending(); const i = p.findIndex((x) => x.kode === Adm.sel); const n = p[(i + +t.dataset.nav + p.length) % p.length]; if (n) { Adm.sel = n.kode; gambarTabel(); gambarPanel(); } });
  on(el, 'click', '[data-salin]', (e, t) => salin(t.dataset.salin));
}
