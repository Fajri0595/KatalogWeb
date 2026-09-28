/* ============================================================
   public.js — semua halaman untuk pengunjung/pembeli
   ============================================================ */
const S = { pengaturan: {}, apps: [], detail: {}, faq: null, siap: false };
const set = (k, cad) => (S.pengaturan && S.pengaturan[k] ? S.pengaturan[k] : cad || '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function ss(k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || 'null'); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

// ---------- Layout publik ----------
function layoutPublik(aktif) {
  const root = $('#root');
  if (root.dataset.layout !== 'publik') {
    root.dataset.layout = 'publik';
    root.innerHTML = `
      <header class="nav"><div class="container nav-in">
        <button class="btn btn-ghost btn-icon burger" id="burger" aria-label="Menu">${icon('menu')}</button>
        <a class="brand" href="#/"><img src="assets/logo.svg" alt=""><span id="brand-nama"></span></a>
        <nav class="nav-links" id="navlinks">
          <a href="#/" data-nav="katalog">Katalog</a>
          <a href="#/status" data-nav="status">Cek Status Pesanan</a>
          <a href="#/testimoni" data-nav="testimoni">Kirim Testimoni</a>
          <a href="#/bantuan" data-nav="bantuan">Bantuan &amp; FAQ</a>
        </nav>
        <div class="nav-act"><a class="btn btn-secondary btn-icon" href="#/admin" title="Area Admin" aria-label="Area Admin">${icon('user')}</a></div>
      </div></header>
      <main id="page"></main>
      <footer class="footer" id="footer"></footer>`;
    $('#burger').addEventListener('click', () => $('#navlinks').classList.toggle('open'));
    $('#navlinks').addEventListener('click', () => $('#navlinks').classList.remove('open'));
  }
  $('#brand-nama').textContent = set('nama_toko', APP_CONFIG.NAMA_DEFAULT);
  $$('.nav-links a').forEach((a) => a.classList.toggle('active', a.dataset.nav === aktif));
  const email = set('email_admin');
  $('#footer').innerHTML = `<div class="container">
    <div class="foot-grid">
      <div><a class="brand" href="#/"><img src="assets/logo.svg" alt="">${esc(set('nama_toko', APP_CONFIG.NAMA_DEFAULT))}</a>
        <p class="muted" style="margin-top:12px;max-width:340px">${esc(set('tagline'))}</p></div>
      <div><h5>Tautan Cepat</h5><ul><li><a href="#/">Katalog</a></li><li><a href="#/bantuan">Panduan &amp; FAQ</a></li><li><a href="#/status">Cek Status</a></li><li><a href="#/testimoni">Kirim Testimoni</a></li></ul></div>
      <div><h5>Hubungi Kami</h5><p class="muted">Kontak Developer:</p>${email ? `<a class="mono" style="font-size:13px" href="mailto:${esc(email)}">${esc(email)}</a>` : ''}</div>
    </div>
    <div class="foot-bot"><span>© ${new Date().getFullYear()} ${esc(set('nama_toko', APP_CONFIG.NAMA_DEFAULT))}. Hak cipta dilindungi.</span><span class="mono" style="font-size:12px">${esc(set('kota'))}</span></div></div>`;

  const waNo = set('whatsapp');
  let waEl = $('#wa-float');
  if (waNo) {
    const waLink = linkWA(waNo, 'Halo Admin, saya sedang melihat katalog aplikasi web di situs Anda dan ingin bertanya.');
    if (!waEl) {
      waEl = document.createElement('a');
      waEl.className = 'wa-float';
      waEl.id = 'wa-float';
      waEl.target = '_blank';
      waEl.rel = 'noopener noreferrer';
      waEl.setAttribute('aria-label', 'Chat WhatsApp');
      waEl.innerHTML = '<span class="wa-float-pulse"></span>' + icon('whatsapp', 'wa-float-icon') + '<span>Tanya Kami</span>';
      document.body.appendChild(waEl);
    }
    waEl.href = waLink;
    waEl.classList.remove('hide');
  } else if (waEl) {
    waEl.classList.add('hide');
  }
}

function galat(el, err, ulang) {
  const konfig = err && err.code === 'CONFIG';
  el.innerHTML = `<div class="container"><div class="card center-card" style="text-align:center">
    <div class="empty" style="padding:8px"><div class="em-ic">${icon(konfig ? 'wrench' : 'alert-triangle')}</div>
    <h3>${konfig ? 'Aplikasi belum dikonfigurasi' : 'Data belum bisa dimuat'}</h3>
    <p>${esc(err && err.message ? err.message : 'Terjadi kesalahan.')}</p>
    ${ulang ? '<button class="btn btn-primary" style="margin-top:16px" id="ulang">' + icon('refresh') + ' Coba lagi</button>' : ''}</div></div></div>`;
  if (ulang) $('#ulang', el).addEventListener('click', ulang);
}
function pilihanPill(status) { return status === 'Segera Hadir' ? pil('Segera Hadir') : pil('Tersedia'); }

// ============================================================
// KATALOG
// ============================================================
const FK = { q: '', kat: 'Semua', urut: 'populer', tampil: 'grid', hal: 1 };
const PER_HAL = 6;

function urutkan(list) {
  const a = list.slice();
  if (FK.urut === 'terbaru') a.sort((x, y) => String(y.tanggal_rilis).localeCompare(String(x.tanggal_rilis)));
  else if (FK.urut === 'termurah') a.sort((x, y) => x.harga - y.harga);
  else if (FK.urut === 'termahal') a.sort((x, y) => y.harga - x.harga);
  else if (FK.urut === 'nama') a.sort((x, y) => x.nama.localeCompare(y.nama));
  return a;
}
function saringApps() {
  const q = FK.q.trim().toLowerCase();
  return urutkan(S.apps.filter((a) => (FK.kat === 'Semua' || a.kategori === FK.kat) &&
    (!q || (a.nama + ' ' + a.deskripsi_singkat + ' ' + a.kategori + ' ' + a.teknologi.join(' ')).toLowerCase().indexOf(q) >= 0)));
}
function kartuApp(a) {
  const tersedia = a.status === 'Tersedia';
  const diskon = a.harga_coret && a.harga_coret > a.harga ? Math.round((1 - a.harga / a.harga_coret) * 100) : 0;
  return `<article class="card pcard hoverable">
    <a class="pv-wrap" href="#/aplikasi/${esc(a.id)}" aria-label="Lihat ${esc(a.nama)}">
      ${diskon ? `<span class="badge-discount">HEMAT ${diskon}%</span>` : ''}
      ${pratinjau(a)}
    </a>
    <div class="body">
      <div class="cat-row"><span class="cat">${esc(a.kategori)}</span>${diskon ? `<span class="pill-hemat">Hemat ${rupiah(a.harga_coret - a.harga)}</span>` : ''}</div>
      <h3>${esc(a.nama)}</h3>
      <p class="desc">${esc(a.deskripsi_singkat)}</p>
      <div class="pcard-price-row">
        <div class="price">${rupiah(a.harga)}</div>
        ${a.harga_coret ? `<s class="price-strikethrough">${rupiah(a.harga_coret)}</s>` : ''}
      </div>
      <div class="foot">
        <div class="foot-info">${pilihanPill(a.status)}</div>
        <a class="btn ${tersedia ? 'btn-primary' : 'btn-secondary'} btn-sm" href="#/aplikasi/${esc(a.id)}">${tersedia ? 'Lihat Detail' : 'Pratinjau'}</a>
      </div>
    </div></article>`;
}
function gambarKatalog() {
  const semua = saringApps();
  const total = semua.length;
  const hal = Math.min(FK.hal, Math.max(1, Math.ceil(total / PER_HAL)));
  FK.hal = hal;
  const potong = semua.slice((hal - 1) * PER_HAL, hal * PER_HAL);
  const kats = ['Semua'].concat(Array.from(new Set(S.apps.map((a) => a.kategori))));
  $('#chips').innerHTML = kats.map((k) => {
    const n = k === 'Semua' ? S.apps.length : S.apps.filter((a) => a.kategori === k).length;
    return `<button class="chip ${FK.kat === k ? 'active' : ''}" data-kat="${esc(k)}">${esc(k)} <span class="n">${n}</span></button>`;
  }).join('');
  const grid = $('#grid');
  grid.className = 'grid-cards' + (FK.tampil === 'list' ? ' list' : '');
  grid.innerHTML = potong.length ? potong.map(kartuApp).join('') :
    `<div class="card empty" style="grid-column:1/-1"><div class="em-ic">${icon('search')}</div><h3>Aplikasi tidak ditemukan</h3><p>Coba kata kunci lain atau pilih kategori Semua untuk menampilkan seluruh katalog.</p><button class="btn btn-secondary" style="margin-top:16px" id="reset">Reset Filter</button></div>`;
  const halTotal = Math.max(1, Math.ceil(total / PER_HAL));
  const awal = total ? (hal - 1) * PER_HAL + 1 : 0, akhir = Math.min(total, hal * PER_HAL);
  let nomor = '';
  for (let i = 1; i <= halTotal; i++) nomor += `<button class="${i === hal ? 'on' : ''}" data-hal="${i}">${i}</button>`;
  $('#pager').innerHTML = total ? `<span class="muted t-sm">Menampilkan <b style="color:var(--ink)">${awal} - ${akhir}</b> dari <b style="color:var(--ink)">${total}</b> aplikasi</span>
    <div class="pg"><button data-hal="${hal - 1}" ${hal <= 1 ? 'disabled' : ''} aria-label="Sebelumnya">${icon('chevron-left')}</button>${nomor}<button data-hal="${hal + 1}" ${hal >= halTotal ? 'disabled' : ''} aria-label="Berikutnya">${icon('chevron-right')}</button></div>` : '';
  $$('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.v === FK.tampil));
}
function pgKatalog(c) {
  let lencana = set('hero_lencana', '');
  if (/katalog\s*resmi/i.test(lencana)) {
    lencana = '';
  }
  const judul = set('hero_judul', APP_CONFIG.NAMA_DEFAULT);
  const SUBJUDUL_KUSTOM = 'Temukan website siap pakai untuk kebutuhan Anda. Koleksi aplikasi web pilihan yang praktis, modern, dan mudah digunakan. Dapatkan **source code lengkap, tutorial penggunaan, serta dukungan yang jelas**. Pilih website yang sesuai, pesan dengan mudah, dan mulai gunakan untuk kebutuhan bisnis, pendidikan, maupun proyek pribadi.';
  let subjudul = set('hero_subjudul');
  if (!subjudul || /^koleksi aplikasi/i.test(subjudul.trim())) {
    subjudul = SUBJUDUL_KUSTOM;
  }
  const t2 = set('hero_trust_2', 'Full Source Code & Database');
  const t3 = set('hero_trust_3', 'Video Tutorial & Panduan Setup');

  c.el.innerHTML = `
    <section class="hero"><div class="container">
      ${lencana ? `<div class="eyebrow-pill"><i></i><span>${esc(lencana)}</span></div>` : ''}
      <h1 class="h-xl">${esc(judul)}</h1>
      ${subjudul ? `<p class="sub">${mdInline(subjudul)}</p>` : ''}
      <div class="trust">
        <span>${icon('shield-check')} Transfer Bank Diverifikasi Admin</span>
        ${t2 ? `<span>${icon('check-circle')} ${esc(t2)}</span>` : ''}
        ${t3 ? `<span>${icon('zap')} ${esc(t3)}</span>` : ''}
      </div>
    </div></section>
    <div class="container">
      <div class="filterbar"><div id="chips" class="chips-wrap"></div>
        <div class="sp">
          <form class="searchmini" id="fcari" role="search"><span class="si">${icon('search')}</span><input class="input" id="q" type="search" placeholder="Cari aplikasi..." value="${esc(FK.q)}" aria-label="Cari aplikasi"></form>
          <select class="select" id="urut" aria-label="Urutkan">
            <option value="populer">Terpopuler</option><option value="terbaru">Terbaru</option><option value="termurah">Harga Terendah</option><option value="termahal">Harga Tertinggi</option><option value="nama">Nama A–Z</option></select>
          <div class="seg"><button data-v="grid" aria-label="Tampilan kotak">${icon('grid')}</button><button data-v="list" aria-label="Tampilan daftar">${icon('list')}</button></div></div></div>
      <div id="grid" class="grid-cards"></div>
      <div class="pager" id="pager"></div>
    </div>`;
  $('#urut').value = FK.urut;
  const q = $('#q');
  q.addEventListener('input', debounce(() => { FK.q = q.value; FK.hal = 1; gambarKatalog(); }, 200));
  $('#fcari').addEventListener('submit', (e) => { e.preventDefault(); FK.q = q.value; FK.hal = 1; gambarKatalog(); $('#grid').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('#urut').addEventListener('change', (e) => { FK.urut = e.target.value; FK.hal = 1; gambarKatalog(); });
  on(c.el, 'click', '[data-kat]', (e, t) => { FK.kat = t.dataset.kat; FK.hal = 1; gambarKatalog(); });
  on(c.el, 'click', '.seg button', (e, t) => { FK.tampil = t.dataset.v; gambarKatalog(); });
  on(c.el, 'click', '[data-hal]', (e, t) => { FK.hal = +t.dataset.hal; gambarKatalog(); $('#grid').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  on(c.el, 'click', '#reset', () => { FK.q = ''; FK.kat = 'Semua'; $('#q').value = ''; gambarKatalog(); });
  gambarKatalog();
  if (!ss('kaw_tv_katalog')) { ss('kaw_tv_katalog', 1); API.post('trackView', { id: '_KATALOG' }).catch(() => {}); }
}

// ============================================================
// DETAIL APLIKASI
// ============================================================
function kartuVideo(url, judul) {
  const id = ytId(url);
  if (!url) return '';
  if (!id) return `<a class="btn btn-secondary" href="${esc(urlAman(url))}" target="_blank" rel="noopener noreferrer">${icon('video')} ${esc(judul)} ${icon('external-link')}</a>`;
  return `<div class="vid" data-yt="${esc(id)}"><button class="vbtn" type="button" aria-label="Putar video: ${esc(judul)}"><span class="play">${icon('play')}</span><span class="cap-v">${esc(judul)}</span></button></div>`;
}
function bindVideo(el) {
  on(el, 'click', '[data-yt] .vbtn', (e, t) => {
    const w = t.closest('[data-yt]');
    w.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(w.dataset.yt)}?autoplay=1&rel=0" title="Video" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  });
}
const IKON_FITUR = ['scan', 'layers', 'database', 'file-text', 'zap', 'shield-check', 'bar-chart', 'code'];
async function pgDetail(c) {
  const id = c.params.id;
  c.el.innerHTML = `<div class="container"><div class="crumb"><div class="skel" style="width:240px;height:16px"></div></div>
    <div class="det"><div><div class="skel" style="aspect-ratio:16/10;border-radius:12px"></div></div><div class="skel" style="height:460px;border-radius:12px"></div></div></div>`;
  let d = S.detail[id];
  try { if (!d) { d = await API.get('getApp', { id }); S.detail[id] = d; } }
  catch (e) {
    if (c.batal()) return;
    c.el.innerHTML = `<div class="container"><div class="card empty" style="margin-top:48px"><div class="em-ic">${icon('search')}</div><h3>Aplikasi tidak ditemukan</h3><p>${esc(e.message)}</p><a class="btn btn-primary" style="margin-top:16px" href="#/">${icon('arrow-left')} Kembali ke Katalog</a></div></div>`;
    return;
  }
  if (c.batal()) return;
  document.title = d.nama + ' — ' + set('nama_toko', APP_CONFIG.NAMA_DEFAULT);
  const tersedia = d.status === 'Tersedia';
  const tiles = [];
  if (d.thumb) tiles.push({ id: d.thumb, label: 'Tampilan Utama' });
  (d.galeri || []).forEach((g, i) => tiles.push({ id: g.id, label: g.label || 'Foto ' + (i + 1) }));
  const alamat = d.link_demo ? d.link_demo.replace(/^https?:\/\//, '').slice(0, 40) : null;
  const waNo = set('whatsapp');
  const tombolWA = waNo ? `
    <a class="btn btn-wa-outline btn-lg btn-block" style="margin-top:10px" href="${esc(linkWA(waNo, `Halo Admin, saya tertarik dengan aplikasi "${d.nama}" (v${d.versi || '1.0'}). Mau tanya beberapa hal sebelum memesan:\n${location.href}`))}" target="_blank" rel="noopener noreferrer">
      ${icon('whatsapp')} Tanya / Konsultasi via WA
    </a>
  ` : '';
  const tombolPesan = tersedia
    ? `<a class="btn btn-primary btn-lg btn-block" href="#/pesan/${esc(d.id)}">${icon('cart')} Pesan Sekarang (Tanpa Akun)</a>`
    : `<button class="btn btn-secondary btn-lg btn-block" disabled>Segera Hadir</button>`;
  c.el.innerHTML = `<div class="container">
    <nav class="crumb" aria-label="Breadcrumb"><a href="#/">${icon('arrow-left')} Katalog</a><span>/</span><b>${esc(d.nama)}</b></nav>
    <div class="det">
      <div>
        <div id="main-pv" style="position:relative;cursor:zoom-in" title="Klik untuk melihat tangkapan layar layar penuh">${pratinjau(d, { besar: true, thumb: tiles[0] ? tiles[0].id : '', alamat: alamat || undefined, lebar: 1100 })}</div>
        ${tiles.length > 1 ? `<div class="gal-tabs">${tiles.map((t, i) => `<button class="${i === 0 ? 'on' : ''}" data-tile="${i}"><img loading="lazy" alt="" src="${esc(driveThumb(t.id, 240))}">${esc(t.label)}</button>`).join('')}</div>` : ''}
        ${d.video_penggunaan ? `<div style="margin-top:16px"><div class="sec-title" style="margin-bottom:12px">${icon('video')} Video Cara Pakai</div>${kartuVideo(d.video_penggunaan, 'Video Cara Pakai (Demo Singkat)')}</div>` : ''}
      </div>
      <aside class="det-side"><div class="card card-p">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px">${pilihanPill(d.status)}<span class="lbl-mono">ID: ${esc(d.id)}</span></div>
        <h1 class="h-lg" style="margin-bottom:8px">${esc(d.nama)}</h1>
        <p class="muted" style="margin-bottom:16px">${esc(d.deskripsi_singkat)}</p>
        <div class="meta3"><div><div class="k">Versi</div><div class="v mono">v${esc(d.versi || '-')}</div></div><div><div class="k">Rilis</div><div class="v">${esc(bulanTahun(d.tanggal_rilis))}</div></div><div><div class="k">Lisensi</div><div class="v">${esc(d.lisensi || '-')}</div></div></div>
        ${d.teknologi.length ? `<div style="margin:16px 0 0"><div class="lbl-mono" style="margin-bottom:8px">Teknologi</div><div style="display:flex;flex-wrap:wrap;gap:6px">${d.teknologi.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>` : ''}
        <div style="margin:20px 0 4px"><span class="price" style="font-size:36px;line-height:40px;letter-spacing:-.025em">${rupiah(d.harga)}</span> ${d.harga_coret ? `<s class="muted mono" style="font-size:13px;margin-left:6px">${rupiah(d.harga_coret)}</s>` : ''}</div>
        <div class="hint" style="margin-bottom:16px">sekali bayar • lisensi selamanya</div>
        ${tombolPesan}
        ${tombolWA}
        ${d.link_demo ? `<div style="text-align:center;margin-top:12px"><a class="link-btn t-sm" href="${esc(urlAman(d.link_demo))}" target="_blank" rel="noopener noreferrer">${icon('eye')} Lihat Demo Publik ${icon('external-link')}</a></div>` : ''}
        <div class="note-i" style="margin-top:16px">${icon('shield-check')}<div>Transfer manual diverifikasi oleh admin dalam ${esc(set('sla_verifikasi', '1×24 jam'))}. Link akses privat dikirim langsung ke email Anda setelah pembayaran disetujui.</div></div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;font-size:12px;color:var(--muted)"><span>${icon('check-circle')} Tanpa perlu akun</span><span>${icon('check-circle')} Akses via email</span></div>
      </div></aside>
    </div>
    <div class="det-body">
      <div>
        ${d.deskripsi_lengkap ? `<section style="margin-bottom:40px"><div class="eyebrow">Tentang Aplikasi</div><h2 class="h-lg" style="margin:4px 0 16px">Deskripsi Lengkap</h2><div class="prose">${md(d.deskripsi_lengkap)}</div></section>` : ''}
        ${d.fitur.length ? `<section style="margin-bottom:40px"><div class="eyebrow">Spesifikasi Fungsional</div><h2 class="h-lg" style="margin:4px 0 16px">Fitur Utama &amp; Keunggulan</h2>
          <div class="row c2">${d.fitur.map((f, i) => `<div class="feat"><div class="fic">${icon(IKON_FITUR[i % IKON_FITUR.length])}</div><h4>${esc(f.judul)}</h4><p class="muted t-sm">${esc(f.deskripsi)}</p></div>`).join('')}</div></section>` : ''}
        ${(d.video_instalasi || d.langkah.length) ? `<section><div class="eyebrow">Self-Deployment Guide</div><h2 class="h-lg" style="margin:4px 0 8px">Panduan &amp; Tutorial Instalasi</h2><p class="muted" style="margin-bottom:16px">Langkah praktis menautkan aplikasi ke akun Anda.</p>
          ${d.video_instalasi ? kartuVideo(d.video_instalasi, 'Panduan Lengkap Setup dari Nol') : ''}
          ${d.langkah.length ? `<div class="steps">${d.langkah.map((l, i) => `<div class="step"><span class="no">${String(i + 1).padStart(2, '0')}</span><div><b>${esc(l.judul)}</b><p class="muted t-sm" style="margin-top:2px">${esc(l.deskripsi)}</p></div>${l.durasi ? `<span class="tm">${esc(l.durasi)}</span>` : ''}</div>`).join('')}</div>` : ''}</section>` : ''}
      </div>
      <aside style="display:flex;flex-direction:column;gap:16px">
        <div class="card card-p"><div class="eyebrow" style="margin-bottom:8px">Ulasan Terverifikasi</div>
          ${rating.jumlah ? `<div class="rating-big"><b>${rating.rata.toFixed(1)}</b>${bintang(rating.rata, 18)}</div><p class="muted t-sm" style="margin-top:4px">Berdasarkan ${rating.jumlah} ulasan pembeli terverifikasi</p>` : `<p class="muted">Belum ada testimoni untuk aplikasi ini.</p>`}
          ${(d.testimoni || []).map((t) => `<div class="rev"><div class="who"><span class="avatar">${t.foto ? `<img alt="" loading="lazy" src="${esc(driveThumb(t.foto, 96))}" onerror="this.remove()">` : esc(inisial(t.nama))}</span><div style="flex:1;min-width:0"><b class="t-sm">${esc(t.nama)}</b>${t.peran ? `<div class="hint">${esc(t.peran)}</div>` : ''}</div><span class="pill pill-ok nodot" style="height:20px;font-size:10px">${icon('check')} Terverifikasi</span></div>${bintang(t.rating, 13)}<p class="t-sm" style="color:var(--text-2)">“${esc(t.isi)}”</p></div>`).join('')}
        </div>
        ${d.persyaratan.length ? `<div class="card card-p"><div class="sec-title">${icon('sliders')} Persyaratan Sistem</div><ul class="checklist">${d.persyaratan.map((p) => `<li>${icon('check-circle')}<span>${esc(p)}</span></li>`).join('')}</ul></div>` : ''}
      </aside>
    </div></div>
    <div class="buy-bar"><div><div class="price">${rupiah(d.harga)}</div><div class="hint">sekali bayar</div></div>${tersedia ? `<a class="btn btn-primary" href="#/pesan/${esc(d.id)}">Pesan Sekarang</a>` : '<button class="btn btn-secondary" disabled>Segera Hadir</button>'}</div>`;
  document.body.classList.add('has-buybar');
  bindVideo(c.el);
  let aktifTile = 0;
  on(c.el, 'click', '[data-tile]', (e, t) => {
    aktifTile = +t.dataset.tile;
    const it = tiles[aktifTile];
    $$('.gal-tabs button', c.el).forEach((b) => b.classList.toggle('on', b === t));
    $('#main-pv').innerHTML = pratinjau(d, { besar: true, thumb: it.id, alamat: alamat || undefined, lebar: 1100 });
  });
  on(c.el, 'click', '#main-pv', () => {
    const it = tiles[aktifTile] || tiles[0];
    if (it && it.id) bukaLightbox(driveThumb(it.id, 1600), d.nama + (it.label ? ' — ' + it.label : ''));
  });
  if (!ss('kaw_tv_' + id)) { ss('kaw_tv_' + id, 1); API.post('trackView', { id }).catch(() => {}); }
}

// ============================================================
// FORM PEMESANAN
// ============================================================
function pgPesan(c) {
  const a = S.apps.find((x) => x.id === c.params.id);
  if (!a) { c.el.innerHTML = `<div class="container"><div class="card empty" style="margin-top:48px"><div class="em-ic">${icon('search')}</div><h3>Aplikasi tidak ditemukan</h3><a class="btn btn-primary" style="margin-top:16px" href="#/">Kembali ke Katalog</a></div></div>`; return; }
  if (a.status !== 'Tersedia') { c.el.innerHTML = `<div class="container"><div class="card empty" style="margin-top:48px"><div class="em-ic">${icon('clock')}</div><h3>Aplikasi ini belum dapat dipesan</h3><p>${esc(a.nama)} berstatus Segera Hadir.</p><a class="btn btn-primary" style="margin-top:16px" href="#/aplikasi/${esc(a.id)}">Kembali ke Detail</a></div></div>`; return; }
  document.title = 'Pesan ' + a.nama + ' — ' + set('nama_toko', APP_CONFIG.NAMA_DEFAULT);
  const bankNo = set('bank_nomor'), bankNm = set('bank_nama');
  const st = { bukti: null, kupon: null, diskon: 0, total: a.harga };
  c.el.innerHTML = `<div class="container">
    <div class="stepper" id="stepper"></div>
    <form class="ord" id="fpesan" novalidate>
      <div style="display:flex;flex-direction:column;gap:24px;min-width:0">
        <section class="card card-p">
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px"><div><div class="sec-title"><span class="dot"></span>Data Pembeli (Tanpa Perlu Akun)</div><p class="muted t-sm" style="margin-top:4px">Pastikan alamat email Anda aktif untuk menerima tanda terima dan link akses aplikasi.</p></div><span class="pill pill-mute nodot">${icon('lock')} Akses Tamu</span></div>
          <div class="field"><label for="nama">Nama Lengkap <span class="req">*</span></label><input class="input" id="nama" autocomplete="name" maxlength="100" placeholder="Nama sesuai identitas"><div class="hint">Akan dicantumkan pada tanda terima dan kepemilikan lisensi.</div><div class="err">${icon('alert-circle')}<span>Nama lengkap minimal 2 karakter.</span></div></div>
          <div class="field"><label for="email">Alamat Email Aktif <span class="req">*</span></label><div class="ig"><input class="input" id="email" type="email" autocomplete="email" maxlength="200" placeholder="nama@email.com"><span class="valid-ic hide" id="emok">${icon('check-circle')}</span></div><div class="hint">${icon('info')} Link akses privat dikirim ke alamat ini setelah verifikasi selesai.</div><div class="err">${icon('alert-circle')}<span>Format email tidak valid.</span></div></div>
          <div class="field" style="margin-bottom:0"><label for="wa">Nomor WhatsApp <span class="opt">(opsional)</span></label><input class="input" id="wa" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="0812-3456-7890"><div class="hint">Digunakan jika admin perlu konfirmasi darurat mengenai pesanan Anda.</div><div class="err">${icon('alert-circle')}<span>Format nomor tidak valid.</span></div></div>
          <input type="text" name="website" id="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0" aria-hidden="true">
        </section>
        <section class="card card-p">
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px"><div class="sec-title"><span class="dot"></span>Informasi Rekening Tujuan Transfer</div><span class="pill pill-indigo nodot">Manual Transfer ${esc(set('sla_verifikasi', '1×24 jam'))}</span></div>
          <div class="bank-card-visual">
            <div class="bank-card-top">
              <div class="bank-card-chip"></div>
              <div class="bank-card-bankname">${icon('landmark')} ${esc(bankNm || 'BANK TRANSFER')}</div>
            </div>
            <div class="bank-card-number-row">
              <div>
                <div class="bank-card-holder-label">Nomor Rekening Tujuan Transfer</div>
                <div class="bank-card-acc-no">${esc(bankNo)}</div>
              </div>
              <button class="btn btn-secondary btn-sm" type="button" id="salin-rek" style="background:#fff;color:var(--ink);font-weight:600">${icon('copy')} Salin No. Rek</button>
            </div>
            <div class="bank-card-bottom">
              <div>
                <div class="bank-card-holder-label">Atas Nama Pemilik Rekening</div>
                <div class="bank-card-holder-val">${esc(set('bank_atas_nama'))}${set('bank_cabang') ? ' · ' + esc(set('bank_cabang')) : ''}</div>
              </div>
              <span class="pill pill-ok nodot" style="background:rgba(16,185,129,0.2);color:#A7F3D0;border-color:rgba(167,243,208,0.4)">${icon('shield-check')} Terverifikasi</span>
            </div>
          </div>
          <div class="nominal"><div><div class="nl">${icon('credit-card')} Nominal tepat yang harus ditransfer</div><div class="muted t-sm" style="margin-top:2px;max-width:420px">${esc(set('catatan_transfer'))}</div></div><div class="amt" id="transfer-amt">${rupiah(a.harga)}</div></div>
          ${set('whatsapp') ? `
            <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.06);padding:10px 14px;border-radius:8px">
              <span class="t-sm" style="color:#CBD5E1;display:inline-flex;align-items:center;gap:6px">${icon('whatsapp')} Butuh bantuan saat transfer?</span>
              <a class="btn btn-sm btn-wa" href="${esc(linkWA(set('whatsapp'), `Halo Admin, saya sedang memesan "${a.nama}". Ingin konfirmasi mengenai pembayaran transfer...`))}" target="_blank" rel="noopener noreferrer">Chat Admin</a>
            </div>
          ` : ''}
        </section>
        <section class="card card-p">
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px"><div class="sec-title"><span class="dot"></span>Unggah Bukti Transfer <span class="req">*</span></div><span class="pill pill-mute nodot" id="bukti-st">Belum ada berkas</span></div>
          <div class="dropzone" id="dz" tabindex="0" role="button" aria-label="Pilih berkas bukti transfer"><div class="dz-ic">${icon('upload-cloud')}</div><div>Seret &amp; lepas berkas bukti transfer di sini, atau <u>Telusuri Berkas</u></div><div class="hint">Mendukung format JPG, PNG, atau PDF (ukuran maksimal 5 MB)</div></div>
          <input type="file" id="berkas" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.pdf" class="hide">
          <div id="berkas-info"></div><div class="field has-error" style="margin:8px 0 0"><div class="err" id="bukti-err">${icon('alert-circle')}<span></span></div></div>
        </section>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><a class="btn btn-ghost" href="#/aplikasi/${esc(a.id)}">${icon('arrow-left')} Kembali</a><button class="btn btn-primary btn-lg" type="submit" id="kirim">Kirim Pesanan &amp; Bukti Transfer ${icon('arrow-right')}</button></div>
      </div>
      <aside class="ord-side">
        <div class="card card-p"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><div class="h-sm">Ringkasan Pesanan</div><span class="lbl-mono">ID: ORD-TEMP</span></div>
          <div class="mini-app"><div class="mt">${pratinjau(a, { lebar: 200 })}</div><div style="min-width:0"><div class="mono" style="font-size:11px;color:var(--indigo)">v${esc(a.versi || '-')} • Web App</div><div class="h-sm" style="margin:2px 0">${esc(a.nama)}</div><div class="mono muted" style="font-size:11px">Lisensi ${esc(a.lisensi || 'Full Access')}</div></div></div>
          <div style="margin-top:16px">
            <div class="sumrow"><span class="muted">Harga Lisensi</span><span class="mono">${rupiah(a.harga)}</span></div>
            <div id="sum-discount"></div>
            <div class="sumrow"><span class="muted">Biaya Verifikasi Sistem</span><span class="mono" style="color:var(--ok-t)">Rp 0 (Gratis)</span></div>
          </div>
          <div class="total-box"><div><div class="lbl-mono">Total Pembayaran</div></div><div class="amt" id="total-amt">${rupiah(a.harga)}</div></div>
          <div class="coupon-box">
            <label class="lbl-mono" style="margin-bottom:6px;display:block">${icon('tag')} Punya Kode Promo?</label>
            <div id="coupon-area"></div>
            <div id="coupon-msg" class="coupon-err hide"></div>
          </div>
          <div class="note-i" style="margin-top:16px;background:var(--alt);color:var(--text-2)">${icon('shield-check')}<div>Pesanan diproses tanpa perlu membuat akun. Simpan <b>Kode Pesanan</b> yang Anda dapatkan setelah menekan tombol kirim.</div></div>
        </div>
        <div class="card card-p-sm" style="display:flex;gap:12px;align-items:flex-start"><span class="avatar" style="background:var(--ok-bg);color:var(--ok)">${icon('shield-check')}</span><div><b class="t-sm">${esc(set('garansi_order_judul'))}</b><p class="muted t-sm" style="margin-top:2px">${esc(set('garansi_order_teks'))}</p></div></div>
      </aside>
    </form></div>`;

  const f = { nama: $('#nama'), email: $('#email'), wa: $('#wa') };
  const salahWA = (v) => v && !/^[+0-9][0-9\s\-()]{6,18}$/.test(v);
  const cek = {
    nama: () => f.nama.value.trim().length >= 2,
    email: () => EMAIL_RE.test(f.email.value.trim()),
    wa: () => !salahWA(f.wa.value.trim())
  };
  const tandai = (k, ok) => f[k].closest('.field').classList.toggle('has-error', !ok);
  function stepper() {
    const s1 = cek.nama() && cek.email();
    const kls = !s1 ? ['now', '', ''] : !st.bukti ? ['done', 'now', ''] : ['done', 'done', 'now'];
    const nm = [['LANGKAH 1', 'Data Pembeli'], ['LANGKAH 2', 'Transfer Bank'], ['LANGKAH 3', 'Unggah Bukti']];
    $('#stepper').innerHTML = nm.map((n, i) => `<div class="st ${kls[i]}"><span class="sc">${kls[i] === 'done' ? icon('check') : i + 1}</span><div><small>${n[0]}</small><b>${n[1]}</b></div></div>${i < 2 ? `<div class="ln ${kls[i] === 'done' ? 'done' : ''}"></div>` : ''}`).join('');
  }
  ['nama', 'email', 'wa'].forEach((k) => {
    f[k].addEventListener('input', () => { if (f[k].closest('.field').classList.contains('has-error')) tandai(k, cek[k]()); if (k === 'email') $('#emok').classList.toggle('hide', !cek.email()); stepper(); });
    f[k].addEventListener('blur', () => { if (f[k].value || k !== 'wa') tandai(k, cek[k]()); });
  });
  $('#salin-rek').addEventListener('click', () => {
    salin(bankNo.replace(/[\s-]/g, ''), 'Nomor rekening disalin ke papan klip');
    const btn = $('#salin-rek');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = icon('check') + ' Tersalin!';
      btn.style.background = '#ECFDF5';
      btn.style.color = '#047857';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '#fff';
        btn.style.color = 'var(--ink)';
      }, 2000);
    }
  });
  const buktiErr = (m) => { const e = $('#bukti-err'); e.querySelector('span').textContent = m || ''; e.style.display = m ? 'flex' : 'none'; };
  buktiErr('');
  async function pilihBerkas(file) {
    buktiErr('');
    try {
      $('#bukti-st').textContent = 'Memproses berkas...';
      st.bukti = await siapkanBukti(file);
    } catch (e) {
      st.bukti = null;
      $('#berkas-info').innerHTML = '';
      $('#dz').classList.remove('hide');
      $('#bukti-st').textContent = 'Belum ada berkas';
      buktiErr(e.message);
      stepper();
      return;
    }
    const b = st.bukti;
    $('#bukti-st').innerHTML = '<span style="color:var(--ok-t)">' + icon('check-circle') + ' 1 berkas siap</span>';
    $('#dz').classList.add('hide');
    $('#berkas-info').innerHTML = `
      <div class="receipt-preview-card">
        <div class="receipt-preview-media">
          <span class="receipt-preview-badge">${b.pdf ? 'DOKUMEN PDF' : 'STRUK BUKTI TRANSFER'}</span>
          ${b.pdf ? `
            <div class="receipt-preview-pdf">
              <div class="pdf-ic">${icon('file-text')}</div>
              <div style="font-weight:600;font-size:15px">${esc(b.nama)}</div>
              <div class="muted mono" style="font-size:12px">${ukuranBerkas(b.ukuran)}</div>
            </div>
          ` : `
            <img id="prv-img" src="${b.dataUrl}" alt="Bukti Transfer" title="Klik untuk memperbesar layar penuh">
          `}
        </div>
        <div class="receipt-preview-foot">
          <div class="receipt-preview-info">
            <b class="t-sm" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(b.nama)}</b>
            <span class="muted t-sm mono">${ukuranBerkas(b.ukuran)} • ${icon('check-circle')} Siap Dikirim</span>
          </div>
          <div class="receipt-preview-actions">
            ${!b.pdf ? `<button class="btn btn-secondary btn-sm" type="button" id="zoom-b">${icon('maximize')} Perbesar</button>` : ''}
            <button class="btn btn-danger-o btn-sm" type="button" id="hapus-b">${icon('trash')} Ganti Berkas</button>
          </div>
        </div>
      </div>
      <div class="progress"><i style="width:100%"></i></div>
    `;

    if (!b.pdf) {
      const zoomImg = () => bukaLightbox(b.dataUrl, 'Pratinjau Bukti Transfer: ' + b.nama);
      const prvEl = $('#prv-img');
      const zBtn = $('#zoom-b');
      if (prvEl) prvEl.addEventListener('click', zoomImg);
      if (zBtn) zBtn.addEventListener('click', zoomImg);
    }

    $('#hapus-b').addEventListener('click', () => {
      st.bukti = null;
      $('#berkas-info').innerHTML = '';
      $('#dz').classList.remove('hide');
      $('#bukti-st').textContent = 'Belum ada berkas';
      stepper();
    });
    stepper();
  }
  bindDropzone($('#dz'), $('#berkas'), pilihBerkas);
  stepper();

  const kuponToko = ambilDaftarKupon(S.pengaturan);
  function renderKupon() {
    const area = $('#coupon-area', c.el);
    const msg = $('#coupon-msg', c.el);
    const sDisc = $('#sum-discount', c.el);
    const totEl = $('#total-amt', c.el);
    const tfEl = $('#transfer-amt', c.el);
    if (!area) return;

    if (!st.kupon) {
      area.innerHTML = `
        <div class="coupon-input-group">
          <input class="input mono" id="kd-kupon" placeholder="Contoh: DISKON10" maxlength="25" style="text-transform:uppercase">
          <button class="btn btn-secondary btn-sm" type="button" id="btn-kupon">Terapkan</button>
        </div>
      `;
      if (msg) { msg.classList.add('hide'); msg.innerHTML = ''; }
      if (sDisc) sDisc.innerHTML = '';
      if (totEl) totEl.textContent = rupiah(a.harga);
      if (tfEl) tfEl.textContent = rupiah(a.harga);

      const btn = $('#btn-kupon', area);
      const inp = $('#kd-kupon', area);
      if (btn && inp) {
        const applyFn = () => {
          const raw = inp.value.trim().toUpperCase();
          if (!raw) {
            msg.innerHTML = icon('alert-circle') + ' Masukkan kode kupon promo.';
            msg.classList.remove('hide');
            return;
          }
          const item = kuponToko.find((k) => k.kode === raw && k.aktif !== false);
          if (!item) {
            msg.innerHTML = icon('alert-circle') + ' Kode promo tidak valid atau telah berakhir.';
            msg.classList.remove('hide');
            return;
          }
          if (item.min && a.harga < item.min) {
            msg.innerHTML = icon('alert-circle') + ` Kupon berlaku untuk minimal belanja ${rupiah(item.min)}.`;
            msg.classList.remove('hide');
            return;
          }
          let pot = 0;
          if (item.tipe === 'persen') {
            pot = Math.round(a.harga * (item.nilai / 100));
            if (item.maks && pot > item.maks) pot = item.maks;
          } else {
            pot = item.nilai;
          }
          pot = Math.min(a.harga, pot);
          st.kupon = item;
          st.diskon = pot;
          st.total = Math.max(0, a.harga - pot);
          renderKupon();
          toast(`Kupon ${item.kode} berhasil dipasang! Hemat ${rupiah(pot)}.`, 'ok');
        };
        btn.addEventListener('click', applyFn);
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyFn(); } });
      }
    } else {
      area.innerHTML = `
        <div class="coupon-applied">
          <div class="coupon-applied-info">
            <span class="pill pill-ok nodot" style="height:22px;padding:0 8px;font-size:11px">${icon('tag')} <b class="mono">${esc(st.kupon.kode)}</b></span>
            <span class="t-sm" style="color:var(--ok-t);font-weight:600">Hemat ${rupiah(st.diskon)}</span>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" id="btn-hapus-kupon" style="padding:0 8px">${icon('trash')} Hapus</button>
        </div>
      `;
      if (msg) { msg.classList.add('hide'); msg.innerHTML = ''; }
      if (sDisc) sDisc.innerHTML = `<div class="sumrow discount"><span>Diskon Promo (${esc(st.kupon.kode)})</span><span class="mono">-${rupiah(st.diskon)}</span></div>`;
      if (totEl) totEl.textContent = rupiah(st.total);
      if (tfEl) tfEl.textContent = rupiah(st.total);

      const hps = $('#btn-hapus-kupon', area);
      if (hps) {
        hps.addEventListener('click', () => {
          st.kupon = null;
          st.diskon = 0;
          st.total = a.harga;
          renderKupon();
          toast('Kupon dihapus.', 'info');
        });
      }
    }
  }
  renderKupon();

  $('#fpesan').addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = { nama: cek.nama(), email: cek.email(), wa: cek.wa() };
    Object.keys(ok).forEach((k) => tandai(k, ok[k]));
    if (!st.bukti) buktiErr('Unggah bukti transfer terlebih dahulu.');
    if (!(ok.nama && ok.email && ok.wa && st.bukti)) { toast('Lengkapi data yang ditandai merah.', 'warn'); const g = $('.has-error', c.el); if (g) g.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    const btn = $('#kirim'); tombolBusy(btn, true, 'Mengirim pesanan...');
    try {
      const payload = {
        id_aplikasi: a.id, nama: f.nama.value.trim(), email: f.email.value.trim(), wa: f.wa.value.trim(), website: $('#website').value,
        bukti: { nama: st.bukti.nama, mime: st.bukti.mime, base64: st.bukti.base64 },
        kode_kupon: st.kupon ? st.kupon.kode : '',
        diskon: st.diskon || 0,
        total_bayar: st.total
      };
      const r = await API.post('createOrder', payload, { timeout: 120000 });
      r.kode_kupon = st.kupon ? st.kupon.kode : '';
      r.diskon = st.diskon || 0;
      r.total_bayar = st.total;
      ss('kaw_order', r); ss('kaw_verif', { kode: r.kode, email: r.email });
      location.hash = '#/berhasil';
    } catch (err) { tombolBusy(btn, false); toast(err.message, 'err', 6500); }
  });
}

// ============================================================
// PESANAN BERHASIL
// ============================================================
function pgBerhasil(c) {
  const o = ss('kaw_order');
  if (!o) { location.hash = '#/'; return; }
  const totalAkhir = o.total_bayar !== undefined ? o.total_bayar : o.jumlah;
  c.el.innerHTML = `<div class="container"><div class="card center-card" style="text-align:center">
    <div class="big-check">${icon('check')}</div>
    <div style="margin-bottom:12px">${pil('Menunggu Verifikasi')}</div>
    <h1 class="h-lg">Pesanan Berhasil Dibuat!</h1>
    <p class="muted" style="margin-top:8px">Terima kasih, <b style="color:var(--ink)">${esc(o.nama)}</b>! Bukti transfer Anda telah kami terima. Admin akan memverifikasi pembayaran Anda dalam waktu maksimal ${esc(set('sla_verifikasi', '1×24 jam'))}.</p>
    <div class="refbox"><div class="lbl-mono">Nomor Referensi / Kode Pesanan</div><div class="code">${esc(o.kode)}<button class="btn btn-secondary btn-sm" id="salin">${icon('copy')} Salin Kode</button></div><p class="hint" style="margin-top:8px">Simpan kode pesanan ini untuk mengecek status pesanan atau mengirim testimoni nanti.</p></div>
    <div style="text-align:left"><div class="kv"><span>Aplikasi</span><span>${esc(o.aplikasi)} <span class="mono" style="color:var(--indigo)">(v${esc(o.versi)})</span></span></div>
      <div class="kv"><span>Email Pembeli</span><span class="mono">${esc(o.email)}</span></div>
      <div class="kv"><span>Total Pembayaran</span><span>${rupiah(totalAkhir)} <span class="muted">(Transfer Bank)</span></span></div>
      ${o.diskon ? `<div class="kv"><span>Diskon Promo (${esc(o.kode_kupon)})</span><span class="mono" style="color:var(--ok-t)">-${rupiah(o.diskon)}</span></div>` : ''}
      <div class="kv"><span>Berkas Terunggah</span><span class="mono" style="font-size:13px;overflow-wrap:anywhere">${esc(o.nama_file)} <span class="muted">(${ukuranBerkas(o.ukuran)})</span></span></div>
      <div class="kv"><span>Tanggal Pesanan</span><span>${esc(tgl(o.tanggal, true))}</span></div></div>
    <div class="note-i" style="text-align:left;margin:20px 0">${icon('mail')}<div><b>Instruksi Pengiriman Berkas</b><br>Setelah pembayaran disetujui, kami mengirim email resmi berisi tanda terima (PDF), tautan akses privat aplikasi, serta video tutorial instalasi. Cek juga folder spam.</div></div>
    <a class="btn btn-primary btn-lg btn-block" href="#/status?kode=${encodeURIComponent(o.kode)}">Cek Status Pesanan Saya ${icon('arrow-right')}</a>
    <p style="margin-top:16px"><a href="#/">${icon('arrow-left')} Kembali ke Katalog</a></p></div>
    ${set('email_admin') ? `<p class="muted t-sm" style="text-align:center">Butuh bantuan mendesak? Hubungi <a href="mailto:${esc(set('email_admin'))}">${esc(set('email_admin'))}</a></p>` : ''}</div>`;
  $('#salin').addEventListener('click', () => salin(o.kode, 'Kode pesanan disalin'));
}

// ============================================================
// CEK STATUS PESANAN
// ============================================================
function langkahStatus(r) {
  const s = r.status, w = r.waktu || {};
  return [
    { j: 'Pesanan Dibuat', w: tgl(w.dibuat, true), d: 'Checkout sistem berhasil', k: 'done' },
    s === 'Ditolak' ? { j: 'Pembayaran Ditolak', w: 'Lihat catatan verifikator', d: '', k: 'bad' }
      : { j: 'Pembayaran Diverifikasi', w: w.diverifikasi ? tgl(w.diverifikasi, true) : 'Menunggu admin', d: 'Admin memvalidasi mutasi bank', k: s === 'Disetujui' ? 'done' : 'wait' },
    { j: 'Akses Terkirim', w: w.akses_terkirim ? tgl(w.akses_terkirim, true) : (s === 'Disetujui' && r.email_status === 'Gagal' ? 'Email tertunda' : '-'), d: 'Link akses & tutorial ke email', k: w.akses_terkirim ? 'done' : 'wait' }
  ];
}
function hasilStatus(r) {
  const langkah = langkahStatus(r);
  const banner = r.status === 'Disetujui'
    ? `<div class="banner ok"><div class="bic">${icon('mail')}</div><div class="bt"><b>${r.waktu.akses_terkirim ? 'Akses Telah Terkirim' : 'Pembayaran Disetujui'}</b>${r.waktu.akses_terkirim ? 'Link akses privat aplikasi dan tutorial instalasi telah dikirimkan ke <b class="mono">' + esc(r.email) + '</b>.' : 'Email akses sedang diproses. Jika belum diterima, hubungi kami dengan menyebut kode pesanan Anda.'}</div>
        <div class="ba"><button class="btn btn-secondary btn-sm" id="unduh-pdf">${icon('download')} Unduh Tanda Terima (PDF)</button><a class="btn btn-secondary btn-sm" href="#/tanda-terima?kode=${encodeURIComponent(r.kode)}">${icon('file-text')} Lihat Tanda Terima</a>${r.sudah_testimoni ? '' : `<a class="btn btn-accent btn-sm" href="#/testimoni?kode=${encodeURIComponent(r.kode)}">Tulis Testimoni Sekarang ${icon('arrow-right')}</a>`}</div></div>`
    : r.status === 'Ditolak'
      ? `<div class="banner bad"><div class="bic">${icon('alert-triangle')}</div><div class="bt"><b>Catatan Verifikator</b>${esc(r.catatan_admin || 'Bukti transfer tidak dapat diverifikasi.')}</div><div class="ba"><button class="btn btn-primary btn-sm" id="buka-ulang">${icon('upload-cloud')} Unggah Ulang Bukti</button></div></div>
         <div id="ulang-box" class="hide" style="margin-top:12px"><div class="dropzone" id="dz2" tabindex="0" role="button"><div class="dz-ic">${icon('upload-cloud')}</div><div>Seret berkas bukti baru atau <u>Telusuri</u></div><div class="hint">JPG, PNG, atau PDF (maks. 5 MB)</div></div><input type="file" id="berkas2" accept="image/jpeg,image/png,image/webp,application/pdf" class="hide"><div id="info2"></div><div style="margin-top:12px;text-align:right"><button class="btn btn-primary" id="kirim-ulang" disabled>Kirim Bukti Baru</button></div></div>
         ${r.berkas.sebelumnya ? `<p class="mono muted" style="font-size:12px;margin-top:12px">${icon('file-text')} Berkas sebelumnya: ${esc(r.berkas.sebelumnya)}</p>` : ''}`
      : `<div class="banner wait"><div class="bic">${icon('clock')}</div><div class="bt"><b>Sedang Diperiksa Admin</b>Bukti transfer Anda sudah kami terima. Verifikasi memerlukan waktu maksimal ${esc(set('sla_verifikasi', '1×24 jam'))}. Halaman ini dapat dibuka kembali kapan saja.</div></div>`;
  return `<div class="card card-p" style="margin-top:24px">
    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start"><div><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span class="mono" style="font-size:24px;font-weight:600">${esc(r.kode)}</span><span class="pill pill-indigo nodot">Paket Lisensi ${esc(r.lisensi || 'Tunggal')}</span></div><div class="t-lg" style="margin-top:6px">${esc(r.aplikasi)} <span class="mono muted">(v${esc(r.versi)})</span></div></div>${pil(r.status)}</div>
    <div class="tracker" style="margin:24px 0 16px">${langkah.map((l) => `<div class="tk ${l.k}"><span class="tc">${l.k === 'done' ? icon('check') : l.k === 'bad' ? icon('x') : icon('clock')}</span><div><b>${esc(l.j)}</b><small>${esc(l.w)}</small><div class="hint">${esc(l.d)}</div></div></div>`).join('')}</div>
    ${banner}
    <h3 class="h-sm" style="margin:24px 0 12px">Rincian Transaksi</h3>
    <div class="row c3" style="background:var(--alt);padding:16px;border-radius:12px"><div><div class="lbl-mono">Total Pembayaran</div><div class="mono" style="font-size:20px;font-weight:600;margin-top:4px">${rupiah(r.jumlah)}</div><div class="hint mono">${r.status === 'Disetujui' ? 'Lunas (Netto)' : 'Belum diverifikasi'}</div></div>
      <div><div class="lbl-mono">Metode Pembayaran</div><div style="margin-top:6px;font-weight:500">${icon('landmark')} Transfer ${esc(r.bank_nama)}</div><div class="hint mono">No. Rek: ${esc(r.bank_nomor)}</div></div>
      <div><div class="lbl-mono">Berkas Bukti Transfer</div><div class="mono" style="margin-top:6px;font-size:12px;color:var(--indigo);overflow-wrap:anywhere">${icon('image')} ${esc(r.berkas.nama)}</div><div class="hint">Terunggah ${esc(tgl(r.berkas.tanggal))}</div></div></div></div>`;
}
function pgStatus(c) {
  const v = ss('kaw_verif') || {};
  const kode0 = c.query.kode || v.kode || '';
  const email0 = kode0 && v.kode === kode0 ? v.email : '';
  c.el.innerHTML = `<div class="container" style="max-width:960px"><div style="text-align:center;padding:48px 0 32px"><span class="pill pill-indigo" style="margin-bottom:16px">Pelacakan real-time</span><h1 class="h-lg" style="font-size:32px">Cek Status Pesanan</h1><p class="muted" style="max-width:560px;margin:8px auto 0">Masukkan kode pesanan dan alamat email yang Anda gunakan saat memesan untuk melihat status verifikasi pembayaran serta akses aplikasi.</p></div>
    <form class="card card-p" id="fstat" style="max-width:640px;margin:0 auto" novalidate>
      <div class="row c2"><div class="field"><label for="k">Kode Pesanan <span class="req">*</span></label><div class="ig">${icon('hash')}<input class="input mono" id="k" placeholder="ORD-20260924-001" autocomplete="off" value="${esc(kode0)}" maxlength="40"></div></div>
        <div class="field"><label for="e">Alamat Email Pembeli <span class="req">*</span></label><div class="ig">${icon('mail')}<input class="input" id="e" type="email" placeholder="nama@email.com" autocomplete="email" value="${esc(email0)}" maxlength="200"></div></div></div>
      <button class="btn btn-primary btn-block" type="submit" id="cek">${icon('search')} Cek Status Pesanan</button></form>
    <div id="hasil"></div>
    <div class="section" style="margin-top:48px"><h2 class="h-md">Alur Status Pesanan</h2><p class="muted" style="margin-bottom:16px">Panduan siklus hidup pesanan aplikasi Anda.</p>
      <div class="row c3">
        <div class="phase"><div class="ph"><span>Fase 1</span>${pil('Menunggu Verifikasi', 'Menunggu')}</div><h4 class="h-sm">Pengecekan Rekening</h4><p class="muted t-sm" style="margin-top:6px">Admin mencocokkan mutasi bank dengan bukti bayar yang diunggah pembeli (maks. ${esc(set('sla_verifikasi', '1×24 jam'))}).</p></div>
        <div class="phase"><div class="ph"><span>Fase 2 (Selesai)</span>${pil('Disetujui')}</div><h4 class="h-sm">Distribusi Akses</h4><p class="muted t-sm" style="margin-top:6px">Tautan akses privat beserta tanda terima dikirimkan langsung ke email pembeli.</p></div>
        <div class="phase"><div class="ph"><span>Revisi</span>${pil('Ditolak')}</div><h4 class="h-sm">Unggah Koreksi Bukti</h4><p class="muted t-sm" style="margin-top:6px">Jika nominal selisih atau bukti buram, Anda dapat mengunggah ulang bukti tanpa membuat pesanan baru.</p></div></div>
      <div class="card card-p-sm" style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;background:var(--alt);box-shadow:none"><span class="muted">${icon('help-circle')} Belum menerima email setelah disetujui lebih dari 10 menit?</span><a href="#/bantuan" class="link-btn">Hubungi Tim Dukungan ${icon('arrow-right')}</a></div></div></div>`;
  const form = $('#fstat');
  async function periksa() {
    const kode = $('#k').value.trim(), email = $('#e').value.trim();
    if (!kode || !EMAIL_RE.test(email)) { toast('Isi kode pesanan dan email dengan benar.', 'warn'); return; }
    const btn = $('#cek'); tombolBusy(btn, true, 'Memeriksa...');
    $('#hasil').innerHTML = '<div class="card card-p" style="margin-top:24px"><div class="skel" style="height:24px;width:40%"></div><div class="skel" style="height:90px;margin-top:16px"></div><div class="skel" style="height:60px;margin-top:16px"></div></div>';
    try {
      const r = await API.post('checkOrder', { kode, email });
      if (c.batal()) return;
      ss('kaw_verif', { kode: r.kode, email });
      $('#hasil').innerHTML = hasilStatus(r);
      ikatStatus(r, email);
    } catch (e) { $('#hasil').innerHTML = `<div class="alert err" style="margin-top:24px;max-width:640px;margin-left:auto;margin-right:auto">${icon('alert-circle')}<div>${esc(e.message)}</div></div>`; }
    finally { tombolBusy(btn, false); }
  }
  function ikatStatus(r, email) {
    const pdf = $('#unduh-pdf');
    if (pdf) pdf.addEventListener('click', async () => {
      tombolBusy(pdf, true, 'Menyiapkan PDF...');
      try { const d = await API.post('getReceiptPdf', { kode: r.kode, email }); unduhBase64(d.nama, d.mime, d.base64); } catch (e) { toast(e.message, 'err'); } finally { tombolBusy(pdf, false); }
    });
    const buka = $('#buka-ulang');
    if (buka) {
      let bukti = null;
      buka.addEventListener('click', () => $('#ulang-box').classList.toggle('hide'));
      bindDropzone($('#dz2'), $('#berkas2'), async (file) => {
        try { bukti = await siapkanBukti(file); $('#info2').innerHTML = `<div class="filerow"><div class="fi">${bukti.pdf ? icon('file-text') : `<img alt="" src="${bukti.dataUrl}">`}</div><div style="min-width:0"><div class="fn">${esc(bukti.nama)}</div><div class="fm">${ukuranBerkas(bukti.ukuran)} • siap dikirim</div></div></div>`; $('#kirim-ulang').disabled = false; }
        catch (e) { toast(e.message, 'err'); }
      });
      $('#kirim-ulang').addEventListener('click', async (ev) => {
        tombolBusy(ev.currentTarget, true, 'Mengirim...');
        try { await API.post('resubmitProof', { kode: r.kode, email, bukti: { nama: bukti.nama, mime: bukti.mime, base64: bukti.base64 } }, { timeout: 120000 }); toast('Bukti baru terkirim dan menunggu verifikasi.', 'ok'); periksa(); }
        catch (e) { toast(e.message, 'err'); tombolBusy(ev.currentTarget, false); }
      });
    }
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); periksa(); });
  if (kode0 && email0) periksa();
}

// ============================================================
// TANDA TERIMA
// ============================================================
async function pgTandaTerima(c) {
  const v = ss('kaw_verif') || {};
  const kode = c.query.kode || v.kode || '', email = v.kode === kode ? v.email : '';
  if (!kode || !email) {
    c.el.innerHTML = `<div class="container"><div class="card center-card"><h1 class="h-md">Buka Tanda Terima</h1><p class="muted" style="margin:8px 0 16px">Masukkan kode pesanan dan email Anda untuk membuka tanda terima.</p><form id="fr" novalidate><div class="field"><label>Kode Pesanan</label><input class="input mono" id="k" value="${esc(kode)}"></div><div class="field"><label>Email</label><input class="input" id="e" type="email"></div><button class="btn btn-primary btn-block" type="submit">Buka Tanda Terima</button></form></div></div>`;
    $('#fr').addEventListener('submit', (e) => { e.preventDefault(); ss('kaw_verif', { kode: $('#k').value.trim(), email: $('#e').value.trim() }); pgTandaTerima({ el: c.el, query: { kode: $('#k').value.trim() }, batal: c.batal }); });
    return;
  }
  c.el.innerHTML = '<div class="container"><div class="receipt"><div class="skel" style="height:40px;width:50%"></div><div class="skel" style="height:200px;margin-top:24px"></div></div></div>';
  let r;
  try { r = await API.post('getReceipt', { kode, email }); }
  catch (e) { if (c.batal()) return; c.el.innerHTML = `<div class="container"><div class="card center-card" style="text-align:center"><div class="empty"><div class="em-ic">${icon('file-text')}</div><h3>Tanda terima belum tersedia</h3><p>${esc(e.message)}</p><a class="btn btn-primary" style="margin-top:16px" href="#/status?kode=${encodeURIComponent(kode)}">Kembali ke Status Pesanan</a></div></div></div>`; return; }
  if (c.batal()) return;
  const k = r.kredensial;
  c.el.innerHTML = `<div class="toolbar-r"><div class="container in"><a class="btn btn-ghost btn-sm" href="#/status?kode=${encodeURIComponent(kode)}">${icon('arrow-left')} Kembali ke Status Pesanan</a><span style="flex:1"></span>
      <button class="btn btn-secondary btn-sm" id="cetak">${icon('printer')} Cetak Dokumen</button><button class="btn btn-secondary btn-sm" id="pdf">${icon('download')} Unduh PDF</button>${k.link_akses ? `<a class="btn btn-accent btn-sm" href="${esc(urlAman(k.link_akses))}" target="_blank" rel="noopener noreferrer">${icon('external-link')} Buka Tautan Akses</a>` : ''}</div></div>
    <div class="container"><article class="receipt">
      <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-bottom:20px;border-bottom:1px solid var(--line)">
        <div style="display:flex;gap:12px;align-items:center"><img src="assets/logo.svg" width="48" height="48" alt="" style="border-radius:12px"><div><div class="h-sm">${esc(r.toko.nama)}</div><div class="muted t-sm">${esc(r.toko.kota)}${r.toko.email ? ' • ' + esc(r.toko.email) : ''}</div></div></div>
        <div style="text-align:right"><div class="eyebrow">Tanda Terima Pembayaran Resmi</div><div class="h-md mono" style="margin:4px 0">${esc(r.nomor_invoice)}</div><span class="pill pill-ok">LUNAS / VERIFIED</span></div></div>
      <div class="row c2" style="margin:20px 0"><div style="background:var(--alt);padding:16px;border-radius:12px"><div class="lbl-mono">Diterbitkan Untuk</div><div class="h-sm" style="margin:6px 0 2px">${esc(r.pembeli.nama)}</div><div class="muted t-sm">${icon('mail')} ${esc(r.pembeli.email)}</div><div class="hint" style="margin-top:12px">ID Referensi Pesanan:</div><div class="mono" style="color:var(--indigo);font-size:13px">${esc(r.kode)}</div></div>
        <div style="background:var(--alt);padding:16px;border-radius:12px"><div class="lbl-mono">Detail Transaksi</div><div class="kv" style="padding:6px 0;border:0"><span>Tanggal Pesan</span><span class="mono" style="font-size:12px">${esc(tgl(r.tanggal_pesan, true))}</span></div><div class="kv" style="padding:6px 0;border:0"><span>Tanggal Verifikasi</span><span class="mono" style="font-size:12px">${esc(tgl(r.tanggal_verifikasi, true))}</span></div><div class="kv" style="padding:6px 0;border:0"><span>Metode Bayar</span><span>${esc(r.metode)}</span></div><div class="hint" style="text-align:right">${esc(r.rekening)}</div></div></div>
      <div class="tbl-wrap"><table><thead><tr><th>No</th><th>Deskripsi Aplikasi &amp; Paket</th><th>Versi</th><th>Jenis Lisensi</th><th style="text-align:right">Total</th></tr></thead><tbody><tr><td class="mono">01</td><td><b>${esc(r.item.nama)}</b><div class="muted t-sm">${esc(r.item.deskripsi)}</div></td><td><span class="tag">v${esc(r.item.versi)}</span></td><td>${esc(r.item.lisensi)}</td><td class="mono" style="text-align:right">${rupiah(r.item.total)}</td></tr></tbody></table></div>
      <div style="display:flex;justify-content:flex-end;margin-top:16px"><div style="min-width:280px;background:var(--alt);padding:16px;border-radius:12px"><div class="sumrow"><span class="muted">Subtotal Produk:</span><span class="mono">${rupiah(r.subtotal)}</span></div><div class="sumrow"><span class="muted">Biaya Administrasi:</span><span class="mono">${rupiah(r.biaya_admin)}</span></div><div class="sumrow" style="margin-top:8px;padding-top:12px;border-top:1px solid var(--line-2);font-weight:600"><span>Total Lunas:</span><span class="mono" style="color:var(--indigo);font-size:18px">${rupiah(r.total)}</span></div></div></div>
      <div class="cred"><div class="sec-title">${icon('key')} Kredensial &amp; Akses Anda</div><p class="muted t-sm" style="margin-top:4px">Akses eksklusif untuk pembeli terverifikasi. Simpan informasi ini dan jangan dibagikan kepada orang lain.</p>
        ${k.link_akses ? `<div class="cred-row"><div><div class="hint">Tautan Akses Utama:</div><div class="cv">${esc(k.link_akses)}</div></div><button class="btn btn-secondary btn-sm" data-salin="${esc(k.link_akses)}">${icon('copy')} Salin Tautan</button></div>` : ''}
        ${k.video_instalasi ? `<div class="cred-row"><div><div class="hint">Video Panduan Setup &amp; Deployment:</div><div class="cv">${esc(k.video_instalasi)}</div></div><a class="btn btn-secondary btn-sm" href="${esc(urlAman(k.video_instalasi))}" target="_blank" rel="noopener noreferrer">${icon('play')} Putar Video</a></div>` : ''}
        ${k.token ? `<div class="cred-row dark"><div><div style="font-size:12px;opacity:.7">Token Lisensi Aktif:</div><div class="cv">${esc(k.token)}</div></div><button class="btn btn-secondary btn-sm" data-salin="${esc(k.token)}">${icon('copy')} Salin Token</button></div>` : ''}</div>
      <p class="muted t-sm" style="margin-top:24px">Dokumen ini diterbitkan otomatis oleh sistem ${esc(r.toko.nama)} dan sah tanpa tanda tangan basah.</p>
    </article></div>`;
  $('#cetak').addEventListener('click', () => window.print());
  $('#pdf').addEventListener('click', async (e) => { const b = e.currentTarget; tombolBusy(b, true, 'Menyiapkan...'); try { const d = await API.post('getReceiptPdf', { kode, email }); unduhBase64(d.nama, d.mime, d.base64); } catch (x) { toast(x.message, 'err'); } finally { tombolBusy(b, false); } });
  on(c.el, 'click', '[data-salin]', (e, t) => salin(t.dataset.salin));
}

// ============================================================
// KIRIM TESTIMONI
// ============================================================
const LABEL_RATING = ['Pilih rating Anda', 'Kurang Memuaskan', 'Cukup', 'Baik', 'Memuaskan', 'Sangat Memuaskan & Direkomendasikan'];
function pgTestimoni(c) {
  const v = ss('kaw_verif') || {};
  const st = { ok: false, rating: 0, foto: null, order: null };
  const kode0 = c.query.kode || v.kode || '', email0 = v.kode === kode0 ? v.email : '';
  c.el.innerHTML = `<div class="container" style="padding-top:32px">
    <div class="eyebrow">${icon('message-square')} Formulir Pengalaman Pengguna</div>
    <h1 class="h-lg" style="font-size:32px;margin:4px 0 4px">Kirim Testimoni &amp; Ulasan Klien</h1>
    <p class="muted" style="margin-bottom:24px">Bagikan evaluasi jujur performa aplikasi untuk membangun kredibilitas komunitas pengguna.</p>
    <div id="sukses"></div>
    <div class="two">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card card-p" id="kiri"></div>
        <div class="card card-p"><div class="h-sm">Transparansi Moderasi</div><p class="muted t-sm" style="margin-top:4px">Seluruh ulasan diproses secara objektif untuk memastikan kepuasan pengguna akhir.</p><div class="stat-mini"><div><b>100%</b><small>Pembeli Terverifikasi</small></div><div><b>Manual</b><small>Moderasi Admin</small></div></div></div>
      </div>
      <form class="card card-p" id="ftes" novalidate><fieldset id="fs" disabled style="border:0;padding:0;margin:0;min-width:0;opacity:.55">
        <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:4px"><h2 class="h-lg">Tulis Ulasan &amp; Pengalaman Anda</h2><span class="hint">* Wajib diisi</span></div>
        <p class="muted" style="margin-bottom:20px">Ulasan nyata Anda membantu calon pembeli memahami kualitas dan stabilitas sistem kami.</p>
        <div style="padding:16px;background:var(--alt);border-radius:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px"><div><div class="lbl-mono">Penilaian Keseluruhan *</div><div id="lr" style="font-weight:500;margin-top:4px">${LABEL_RATING[0]}</div></div><div class="stars-in" id="sin" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-r="${n}" aria-label="${n} bintang">${icon('star')}</button>`).join('')}</div></div>
        <div class="row c2"><div class="field"><label for="nt">Nama Tampil Publik <span class="req">*</span></label><input class="input" id="nt" maxlength="80"><div class="hint">Boleh memakai nama panggilan, inisial, atau nama unit usaha.</div></div><div class="field"><label for="pr">Peran / Tipe Bisnis <span class="opt">(Opsional)</span></label><input class="input" id="pr" maxlength="100" placeholder="Contoh: Pemilik Toko Sembako"></div></div>
        <div class="field"><label for="is">Ulasan Pengalaman Penggunaan <span class="req">*</span><span class="opt mono" id="cn">0 / 500 karakter</span></label><textarea class="textarea" id="is" maxlength="500" rows="5" placeholder="Ceritakan pengalaman Anda: kemudahan instalasi, fitur yang paling membantu, dan dampaknya untuk usaha Anda."></textarea><div class="hint">Minimal 40 karakter.</div><div class="err" id="is-err">${icon('alert-circle')}<span></span></div></div>
        <div class="field"><label>Unggah Foto Profil / Usaha <span class="opt">(Opsional)</span></label><div id="foto-box"><button class="btn btn-secondary btn-sm" type="button" id="pilih-foto">${icon('image')} Pilih File</button><span class="hint" style="margin-left:8px">JPG, PNG, WEBP • Maksimal 2 MB</span></div><input type="file" id="foto" accept="image/jpeg,image/png,image/webp" class="hide"></div>
        <div class="note-i" style="margin-bottom:16px">${icon('info')}<div>Testimoni Anda akan dimoderasi dan diverifikasi oleh tim admin sebelum ditampilkan di halaman katalog publik untuk menjamin keaslian komunitas.</div></div>
        <label class="check" style="margin-bottom:20px"><input type="checkbox" id="konf"><span>Saya mengonfirmasi bahwa ulasan ini adalah pengalaman nyata penggunaan aplikasi dan data yang diberikan adalah akurat serta dapat dipertanggungjawabkan.</span></label>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span class="hint">${icon('shield')} Privasi Anda terlindungi</span><button class="btn btn-primary btn-lg" type="submit" id="kirim">Kirim Testimoni untuk Dimoderasi ${icon('arrow-right')}</button></div>
      </fieldset></form></div>
    <div class="card card-p" style="margin-top:24px;display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap"><div style="display:flex;gap:16px;align-items:center"><span class="avatar" style="width:48px;height:48px;border-radius:12px;background:var(--indigo-50)">${icon('code')}</span><div><div class="h-sm">Butuh Kustomisasi Khusus untuk Aplikasi Ini?</div><p class="muted t-sm">Tim pengembang siap membantu modifikasi alur kerja, integrasi API, atau webhook.</p></div></div>${set('email_admin') ? `<a class="btn btn-secondary" href="mailto:${esc(set('email_admin'))}">Hubungi Tim Teknis ${icon('external-link')}</a>` : ''}</div></div>`;

  function kiri() {
    const o = st.order;
    $('#kiri').innerHTML = o ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span class="lbl-mono">Status Kepemilikan</span><span class="pill pill-ok">Terverifikasi Disetujui</span></div>
        <div class="field"><span class="lbl">Nomor Referensi Pesanan</span><div class="ig">${icon('check-circle')}<input class="input mono" readonly value="${esc(o.kode)}"><span class="end" style="top:12px;right:12px;color:var(--muted)">${icon('lock')}</span></div></div>
        <div class="field"><span class="lbl">Identitas Pembeli</span><div class="ig">${icon('mail')}<input class="input" readonly value="${esc(o.email)}"></div></div>
        <div class="field"><span class="lbl">Piranti Lunak Terkait</span><div class="mini-app"><span class="avatar" style="border-radius:8px">${icon('package')}</span><div><b>${esc(o.aplikasi)}</b><div class="hint mono">v${esc(o.versi)} • Lisensi ${esc(o.lisensi || 'Komersial')}</div></div></div></div>
        <button class="btn btn-ghost btn-block" type="button" id="ganti">${icon('refresh')} Ganti Kode Pesanan</button>
        <div class="note-i" style="margin-top:12px;background:var(--alt);color:var(--text-2)">${icon('shield-check')}<div>Hanya pesanan yang sudah diverifikasi dan berstatus <b>Disetujui</b> yang dapat memberikan ulasan demi menjaga keaslian data.</div></div>`
      : `<div class="h-sm" style="margin-bottom:4px">Verifikasi Kepemilikan</div><p class="muted t-sm" style="margin-bottom:16px">Masukkan identitas pesanan yang terdaftar untuk membuka formulir ulasan.</p>
        <div class="field"><label for="k">Kode Pesanan (Order Reference)</label><div class="ig">${icon('hash')}<input class="input mono" id="k" value="${esc(kode0)}" placeholder="ORD-20260924-001" maxlength="40"></div><div class="hint">Tercantum pada email konfirmasi dan halaman status pesanan.</div></div>
        <div class="field"><label for="e">Email Pembeli Terdaftar</label><div class="ig">${icon('mail')}<input class="input" id="e" type="email" value="${esc(email0)}" maxlength="200"></div></div>
        <div id="verr"></div><button class="btn btn-primary btn-block" type="button" id="verif">Verifikasi Pesanan</button>`;
    $('#fs').disabled = !o; $('#fs').style.opacity = o ? 1 : 0.55;
    const g = $('#ganti'); if (g) g.addEventListener('click', () => { st.ok = false; st.order = null; kiri(); });
    const vb = $('#verif'); if (vb) vb.addEventListener('click', verifikasi);
    if (o && !$('#nt').value) $('#nt').value = o.nama;
  }
  async function verifikasi() {
    const kode = $('#k').value.trim(), email = $('#e').value.trim();
    $('#verr').innerHTML = '';
    if (!kode || !EMAIL_RE.test(email)) { $('#verr').innerHTML = `<div class="alert err" style="margin-bottom:12px">${icon('alert-circle')}<div>Isi kode pesanan dan email dengan benar.</div></div>`; return; }
    const b = $('#verif'); tombolBusy(b, true, 'Memverifikasi...');
    try {
      const r = await API.post('checkOrder', { kode, email });
      if (r.status !== 'Disetujui') throw new ApiError('Testimoni hanya dapat dikirim untuk pesanan yang sudah disetujui. Status pesanan Anda saat ini: ' + r.status + '.');
      if (r.sudah_testimoni) throw new ApiError('Pesanan ini sudah memiliki testimoni. Terima kasih!');
      st.order = { kode: r.kode, email, aplikasi: r.aplikasi, versi: r.versi, lisensi: r.lisensi, nama: r.nama };
      ss('kaw_verif', { kode: r.kode, email }); kiri();
    } catch (e) { tombolBusy(b, false); $('#verr').innerHTML = `<div class="alert err" style="margin-bottom:12px">${icon('alert-circle')}<div>${esc(e.message)}</div></div>`; }
  }
  kiri();
  if (kode0 && email0) verifikasi();
  on($('#sin'), 'click', 'button', (e, t) => { st.rating = +t.dataset.r; $$('#sin button').forEach((b) => b.classList.toggle('on', +b.dataset.r <= st.rating)); $('#lr').textContent = st.rating + '.0 / 5.0 — ' + LABEL_RATING[st.rating]; });
  $('#is').addEventListener('input', (e) => { $('#cn').textContent = e.target.value.length + ' / 500 karakter'; });
  $('#pilih-foto').addEventListener('click', () => $('#foto').click());
  $('#foto').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      st.foto = await siapkanGambar(file, { maxSisi: 800, kualitas: 0.8, webp: true });
      if (st.foto.ukuran > 2 * 1024 * 1024) { st.foto = null; throw new Error('Ukuran foto maksimal 2 MB.'); }
      $('#foto-box').innerHTML = `<div class="filerow" style="margin:0"><div class="fi"><img alt="" src="${st.foto.dataUrl}"></div><div style="min-width:0;flex:1"><div class="fn">${esc(st.foto.nama)}</div><div class="fm muted">${ukuranBerkas(st.foto.ukuran)}</div></div><button class="btn btn-ghost btn-sm" type="button" id="hf">${icon('trash')}</button></div>`;
      $('#hf').addEventListener('click', () => { st.foto = null; $('#foto-box').innerHTML = `<button class="btn btn-secondary btn-sm" type="button" id="pilih-foto2">${icon('image')} Pilih File</button>`; $('#pilih-foto2').addEventListener('click', () => $('#foto').click()); });
    } catch (x) { toast(x.message, 'err'); }
  });
  $('#ftes').addEventListener('submit', async (e) => {
    e.preventDefault();
    const isi = $('#is').value.trim(), nama = $('#nt').value.trim();
    const galatIsi = isi.length < 40 ? 'Ulasan minimal 40 karakter (sekarang ' + isi.length + ').' : '';
    $('#is').closest('.field').classList.toggle('has-error', !!galatIsi); $('#is-err span').textContent = galatIsi;
    if (!st.rating) return toast('Pilih rating bintang terlebih dahulu.', 'warn');
    if (nama.length < 2) return toast('Isi nama tampil publik.', 'warn');
    if (galatIsi) return;
    if (!$('#konf').checked) return toast('Centang pernyataan keaslian ulasan.', 'warn');
    const btn = $('#kirim'); tombolBusy(btn, true, 'Mengirim...');
    try {
      await API.post('submitTestimonial', { kode: st.order.kode, email: st.order.email, nama_tampil: nama, peran: $('#pr').value.trim(), isi, rating: st.rating, konfirmasi: true, foto: st.foto ? { nama: st.foto.nama, mime: st.foto.mime, base64: st.foto.base64 } : null }, { timeout: 90000 });
      $('#sukses').innerHTML = `<div class="alert ok" style="margin-bottom:24px;padding:16px">${icon('check-circle')}<div><b>Terima kasih! Ulasan Anda telah diterima.</b><br>Testimoni sedang dalam antrean verifikasi admin sebelum dipublikasikan ke katalog.</div></div>`;
      $('#ftes').classList.add('hide'); $('#kiri').innerHTML = `<div class="empty" style="padding:16px"><div class="em-ic" style="background:var(--ok-bg);color:var(--ok)">${icon('check')}</div><h3>Testimoni terkirim</h3><a class="btn btn-secondary" style="margin-top:12px" href="#/">Kembali ke Katalog</a></div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { tombolBusy(btn, false); toast(err.message, 'err', 6000); }
  });
}

// ============================================================
// BANTUAN & FAQ
// ============================================================
async function pgBantuan(c) {
  let faq;
  try { faq = S.faq || await API.get('getFaq'); S.faq = faq; } catch (e) { faq = []; }
  if (c.batal()) return;
  const cats = Array.from(new Set(faq.map((f) => f.kategori)));
  const F = { q: '', cat: 'Semua' };
  const wa = set('whatsapp'), email = set('email_admin');
  const IK = ['book', 'landmark', 'wrench', 'message-circle'];
  c.el.innerHTML = `<section class="help-hero"><div class="container"><span class="pill pill-indigo" style="margin-bottom:16px">Dokumentasi &amp; dukungan teknis</span><h1 class="h-xl" style="max-width:720px;margin:0 auto 12px">Pusat Bantuan &amp; Pertanyaan Umum (FAQ)</h1><p class="muted t-lg" style="max-width:600px;margin:0 auto 24px">Temukan jawaban seputar cara pemesanan, lisensi aplikasi, tutorial instalasi, dan bantuan teknis developer.</p>
      <div class="searchbar" style="max-width:560px"><div class="ig">${icon('search')}<input class="input" id="hq" type="search" placeholder="Cari topik bantuan (misal: lisensi, cara instal, verifikasi)..." aria-label="Cari bantuan"></div></div></div></section>
    <div class="container" style="padding-top:24px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:20px"><div><div class="eyebrow">Panduan Pengguna</div><h2 class="h-lg">Alur Cepat Pemesanan &amp; Pembelian</h2></div><p class="muted t-sm" style="max-width:340px">Tiga tahapan sederhana dan transparan untuk memperoleh lisensi tanpa perlu registrasi akun berbelit.</p></div>
      <div class="help-steps">
        <div class="card hs"><span class="hic">${icon('cart')}</span><div class="no">01</div><h3 class="h-sm">Pilih &amp; Beli</h3><p class="muted t-sm" style="margin:6px 0 12px">Telusuri aplikasi di katalog, isi formulir tanpa perlu membuat akun. Data Anda langsung diproses untuk pembuatan akses lisensi unik.</p><a href="#/" class="t-sm link-btn">Langsung ke katalog ${icon('arrow-right')}</a></div>
        <div class="card hs"><span class="hic">${icon('landmark')}</span><div class="no">02</div><h3 class="h-sm">Transfer &amp; Unggah</h3><p class="muted t-sm" style="margin:6px 0 12px">Transfer ke rekening resmi ${esc(set('bank_nama'))} dan unggah bukti transfer langsung pada formulir pemesanan.</p><span class="t-sm" style="color:var(--indigo)">${icon('check-circle')} Rekening resmi</span></div>
        <div class="card hs"><span class="hic">${icon('mail')}</span><div class="no">03</div><h3 class="h-sm">Terima Akses</h3><p class="muted t-sm" style="margin:6px 0 12px">Admin memverifikasi maksimal ${esc(set('sla_verifikasi', '1×24 jam'))}, tautan privat dan tutorial langsung masuk ke email Anda.</p><span class="t-sm" style="color:var(--indigo)">${icon('zap')} Maks ${esc(set('sla_verifikasi', '1×24 jam'))}</span></div></div>
      <div class="help-grid" style="margin-top:48px">
        <div><div class="card card-p"><div class="lbl-mono">Daftar Kategori</div><div class="h-sm" style="margin-top:4px">Navigasi Pertanyaan</div><p class="muted t-sm">Pilih klaster pertanyaan untuk lompat langsung ke topik yang Anda butuhkan.</p><div class="topnav" id="topnav"></div></div>
          <div class="card card-p" style="margin-top:16px;background:var(--alt);box-shadow:none"><div class="sec-title">${icon('help-circle')} Masih Ada Keraguan?</div><p class="muted t-sm" style="margin:8px 0 12px">Anda bisa mendiskusikan kustomisasi modul tambahan atau integrasi khusus bersama developer.</p>${email ? `<a class="btn btn-secondary btn-block" href="mailto:${esc(email)}">Kirim Surel Konsultasi</a>` : ''}</div></div>
        <div id="faq"></div></div>
      <div class="card help-contact" style="margin-top:48px"><div><span class="pill pill-ok nodot">Dukungan Pengembang Langsung</span><h2 class="h-xl" style="font-size:32px;line-height:38px;margin:12px 0 8px">Hubungi Developer</h2><p class="muted" style="margin-bottom:20px">Butuh bantuan spesifik mengenai pesanan Anda, kendala teknis saat deployment, atau konsultasi lisensi komersial? Kami siap membantu.</p>
          <div class="row c2">${email ? `<div class="contact-tile"><span class="ct-ic">${icon('mail')}</span><div><div class="hint">Email Resmi</div><a class="mono t-sm" href="mailto:${esc(email)}">${esc(email)}</a></div></div>` : ''}${wa ? `<div class="contact-tile"><span class="ct-ic">${icon('message-circle')}</span><div><div class="hint">WhatsApp Support</div><a class="mono t-sm" href="${esc(linkWA(wa, 'Halo, saya butuh bantuan mengenai pesanan saya.'))}" target="_blank" rel="noopener noreferrer">${esc(wa)}</a></div></div>` : ''}</div>
          <div class="contact-tile" style="margin-top:12px">${icon('clock')}<span class="t-sm">Jam Operasional Layanan: <b>${esc(set('jam_layanan'))}</b></span></div></div>
        <div><div class="lbl-mono" style="margin-bottom:12px">Tautan Cepat Navigasi</div><div style="display:flex;flex-direction:column;gap:12px"><a class="quick" href="#/status"><span class="qi">${icon('file-text')}</span><div style="flex:1"><b>Cek Status Pesanan</b><div class="hint">Lacak status verifikasi pembayaran Anda</div></div>${icon('arrow-right')}</a><a class="quick" href="#/"><span class="qi g">${icon('grid')}</span><div style="flex:1"><b>Kembali ke Katalog</b><div class="hint">Jelajahi seluruh aplikasi web siap pakai</div></div>${icon('arrow-right')}</a></div></div></div>
      <div class="row c2" style="margin-top:32px;align-items:stretch">
        <div class="card card-p"><div class="eyebrow">Garansi Kode</div><h3 class="h-md" style="margin:4px 0 8px">${esc(set('garansi_judul'))}</h3><p class="muted t-sm">${esc(set('garansi_teks'))}</p><div class="row c3" style="margin-top:16px">${[1, 2, 3].map((i) => { const p = set('garansi_stat_' + i).split('|'); return `<div style="padding:12px;background:var(--alt);border-radius:8px;text-align:center"><b class="mono" style="color:var(--indigo)">${esc(p[0] || '')}</b><div class="hint">${esc(p[1] || '')}</div></div>`; }).join('')}</div></div>
        <div class="card card-p" style="display:flex;flex-direction:column;justify-content:center"><div class="eyebrow">Beri Tanggapan</div><h3 class="h-md" style="margin:4px 0 8px">Puas dengan Aplikasi Kami?</h3><p class="muted t-sm" style="margin-bottom:16px">Bantu pengembang lain menemukan solusi yang tepat dengan membagikan pengalaman penggunaan aplikasi di katalog kami.</p><div><a class="btn btn-accent" href="#/testimoni">${icon('message-square')} Kirim Testimoni Pengguna</a></div></div></div></div>`;
  function gambar() {
    const q = F.q.trim().toLowerCase();
    const daftar = faq.filter((f) => (F.cat === 'Semua' || f.kategori === F.cat) && (!q || (f.pertanyaan + ' ' + f.jawaban).toLowerCase().indexOf(q) >= 0));
    $('#topnav').innerHTML = ['Semua'].concat(cats).map((k) => `<button data-cat="${esc(k)}" class="${F.cat === k ? 'on' : ''}"><span>${icon(k === 'Semua' ? 'grid' : IK[cats.indexOf(k) % IK.length])} ${k === 'Semua' ? 'Semua Topik' : esc(k)}</span><span class="n">${k === 'Semua' ? faq.length : faq.filter((f) => f.kategori === k).length}</span></button>`).join('');
    if (!daftar.length) { $('#faq').innerHTML = `<div class="card empty"><div class="em-ic">${icon('search')}</div><h3>Topik tidak ditemukan</h3><p>Coba kata kunci lain, atau hubungi developer langsung.</p></div>`; return; }
    let html = '', kat = null;
    daftar.forEach((f, i) => {
      if (f.kategori !== kat) { kat = f.kategori; html += `<div class="faq-cat">${icon(IK[Math.max(0, cats.indexOf(kat)) % IK.length])} ${esc(kat)}</div>`; }
      html += `<div class="acc ${i === 0 && !q ? 'open' : ''}"><button type="button" aria-expanded="false"><span>${esc(f.pertanyaan)}</span>${icon('chevron-down')}</button><div class="ans">${esc(f.jawaban)}</div></div>`;
    });
    $('#faq').innerHTML = html;
  }
  gambar();
  $('#hq').addEventListener('input', debounce((e) => { F.q = e.target.value; gambar(); }, 200));
  on(c.el, 'click', '[data-cat]', (e, t) => { F.cat = t.dataset.cat; gambar(); });
  on(c.el, 'click', '.acc > button', (e, t) => { const a = t.closest('.acc'); a.classList.toggle('open'); t.setAttribute('aria-expanded', a.classList.contains('open')); });
}
