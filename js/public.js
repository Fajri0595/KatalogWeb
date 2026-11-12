/* ============================================================
   public.js - semua halaman untuk pengunjung/pembeli
   ============================================================ */
const S = { pengaturan: {}, apps: [], detail: {}, faq: null, siap: false };
const set = (k, cad) => {
  const raw = S.pengaturan && S.pengaturan[k];
  const v = typeof raw === 'string' ? raw.replace(/\u2014/g, '-') : raw;
  if (k === 'whatsapp') {
    const waDef = (window.APP_CONFIG && APP_CONFIG.WHATSAPP_DEFAULT) || '085655860383';
    if (!v || /0000-0000|1234567890|contoh/i.test(v)) return waDef;
    return v;
  }
  return (v !== undefined && v !== '') ? v : (cad !== undefined ? cad : '');
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function ss(k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || 'null'); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

// ---------- Layout publik ----------
function layoutPublik(aktif) {
  const root = $('#root');
  if (root.dataset.layout !== 'publik') {
    root.dataset.layout = 'publik';
    root.innerHTML = `
      <header class="nav"><div class="container nav-in">
        <button class="btn btn-ghost btn-icon burger" id="burger" type="button" aria-label="Buka menu navigasi">${icon('menu')}</button>
        <a class="brand" href="#/"><img src="assets/logo.svg" alt="Logo Katalog Web" width="32" height="32"><span id="brand-nama"></span></a>
        <nav class="nav-links" id="navlinks" aria-label="Navigasi utama">
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
  const waKontak = set('whatsapp');
  $('#footer').innerHTML = `<div class="container">
    <div class="foot-grid">
      <div><a class="brand" href="#/"><img src="assets/logo.svg" alt="Logo Katalog Web" width="32" height="32">${esc(set('nama_toko', APP_CONFIG.NAMA_DEFAULT))}</a>
        <p class="muted" style="margin-top:12px;max-width:340px">${esc(set('tagline'))}</p></div>
      <div><h2 class="foot-heading">Tautan Cepat</h2><ul><li><a href="#/">Katalog</a></li><li><a href="#/bantuan">Panduan &amp; FAQ</a></li><li><a href="#/status">Cek Status</a></li><li><a href="#/testimoni">Kirim Testimoni</a></li></ul></div>
      <div><h2 class="foot-heading">Hubungi Kami</h2><p class="muted" style="margin-bottom:6px">Kontak Developer:</p>
        ${email ? `<div style="margin-bottom:6px"><a class="mono" style="font-size:13px" href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
        ${waKontak ? `<div><a class="mono" style="font-size:13px;display:inline-flex;align-items:center;gap:6px;color:var(--ok-t);font-weight:600" href="${esc(linkWA(waKontak, 'Halo Admin, saya ingin bertanya seputar katalog aplikasi...'))}" target="_blank" rel="noopener noreferrer">${icon('whatsapp')} ${esc(waKontak)}</a></div>` : ''}
      </div>
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
      waEl.setAttribute('aria-label', 'Chat WhatsApp Admin');
      waEl.innerHTML = icon('whatsapp', 'wa-float-icon') + '<span>Tanya Kami</span>';
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
    <h2>${konfig ? 'Aplikasi belum dikonfigurasi' : 'Data belum bisa dimuat'}</h2>
    <p style="margin-top:6px">${esc(err && err.message ? err.message : 'Terjadi kesalahan.')}</p>
    ${ulang ? '<button class="btn btn-primary" type="button" style="margin-top:16px" id="ulang">' + icon('refresh') + ' Coba lagi</button>' : ''}</div></div></div>`;
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
  if (FK.urut === 'terbaru') a.sort((x, y) => String(y.tanggal_rilis || '').localeCompare(String(x.tanggal_rilis || '')));
  else if (FK.urut === 'termurah') a.sort((x, y) => (Number(x.harga) || 0) - (Number(y.harga) || 0));
  else if (FK.urut === 'termahal') a.sort((x, y) => (Number(y.harga) || 0) - (Number(x.harga) || 0));
  else if (FK.urut === 'nama') a.sort((x, y) => String(x.nama || '').localeCompare(String(y.nama || '')));
  return a;
}
function saringApps() {
  const q = FK.q.trim().toLowerCase();
  return urutkan(S.apps.filter((a) => {
    const tek = Array.isArray(a.teknologi) ? a.teknologi.join(' ') : String(a.teknologi || '');
    return (FK.kat === 'Semua' || a.kategori === FK.kat) &&
      (!q || (a.nama + ' ' + (a.deskripsi_singkat || '') + ' ' + (a.kategori || '') + ' ' + tek).toLowerCase().indexOf(q) >= 0);
  }));
}
function kartuApp(a) {
  const tersedia = a.status === 'Tersedia';
  const diskon = a.harga_coret && a.harga_coret > a.harga ? Math.round((1 - a.harga / a.harga_coret) * 100) : 0;
  const tekArr = Array.isArray(a.teknologi) ? a.teknologi : (typeof a.teknologi === 'string' ? a.teknologi.split(',').map((s) => s.trim()).filter(Boolean) : []);
  const tekUtama = tekArr[0] || a.kategori || 'Web App';
  return `<article class="card pcard hoverable">
    <a class="pv-wrap" href="#/aplikasi/${esc(a.id)}" aria-label="Lihat detail ${esc(a.nama)}">
      ${pratinjau(a)}
    </a>
    <div class="body">
      <div class="cat-row"><span class="cat">${esc(a.kategori || 'Aplikasi Web')}</span>${diskon ? `<span class="pill-hemat">Hemat ${diskon}% (${rupiah(a.harga_coret - a.harga)})</span>` : ''}</div>
      <h2><a href="#/aplikasi/${esc(a.id)}" style="color:inherit;text-decoration:none">${esc(a.nama)}</a></h2>
      <p class="desc">${esc(a.deskripsi_singkat)}</p>
      <div class="spec-strip" aria-label="Spesifikasi singkat">
        <span><b>v${esc(a.versi || '1.0')}</b></span>
        <span>${esc(a.lisensi || 'Full Source')}</span>
        <span>${esc(tekUtama)}</span>
      </div>
      <div class="pcard-price-row">
        <div class="price">${rupiah(a.harga)}</div>
        ${a.harga_coret ? `<s class="price-strikethrough">${rupiah(a.harga_coret)}</s>` : ''}
      </div>
      <div class="foot">
        <div class="foot-info">${pilihanPill(a.status)}</div>
        <a class="btn ${tersedia ? 'btn-primary' : 'btn-secondary'} btn-sm" href="#/aplikasi/${esc(a.id)}">${tersedia ? 'Lihat Spesifikasi' : 'Detail Pratinjau'}</a>
      </div>
    </div></article>`;
}
function praMuatApp(id) {
  if (id && !S.detail[id]) {
    API.get('getApp', { id }).then((d) => { S.detail[id] = d; }).catch(() => {});
  }
}

function gambarKatalog(hanyaGrid) {
  const semua = saringApps();
  const total = semua.length;
  const hal = Math.min(FK.hal, Math.max(1, Math.ceil(total / PER_HAL)));
  FK.hal = hal;
  const potong = semua.slice((hal - 1) * PER_HAL, hal * PER_HAL);

  if (!hanyaGrid) {
    const kats = ['Semua'].concat(Array.from(new Set(S.apps.map((a) => a.kategori).filter(Boolean))));
    $('#chips').innerHTML = kats.map((k) => {
      const n = k === 'Semua' ? S.apps.length : S.apps.filter((a) => a.kategori === k).length;
      return `<button type="button" class="chip ${FK.kat === k ? 'active' : ''}" data-kat="${esc(k)}">${esc(k)} <span class="n">${n}</span></button>`;
    }).join('');
  } else {
    $$('#chips button').forEach((b) => b.classList.toggle('active', b.dataset.kat === FK.kat));
  }

  const grid = $('#grid');
  grid.className = 'grid-cards' + (FK.tampil === 'list' ? ' list' : '');
  grid.innerHTML = potong.length ? potong.map(kartuApp).join('') :
    `<div class="card empty" style="grid-column:1/-1"><div class="em-ic">${icon('search')}</div><h2>Aplikasi tidak ditemukan</h2><p style="margin-top:4px">Coba kata kunci lain atau pilih kategori Semua untuk menampilkan seluruh katalog.</p><button class="btn btn-secondary" type="button" style="margin-top:16px" id="reset">Reset Filter</button></div>`;

  const halTotal = Math.max(1, Math.ceil(total / PER_HAL));
  const awal = total ? (hal - 1) * PER_HAL + 1 : 0, akhir = Math.min(total, hal * PER_HAL);
  let nomor = '';
  for (let i = 1; i <= halTotal; i++) nomor += `<button type="button" class="${i === hal ? 'on' : ''}" data-hal="${i}" aria-label="Halaman ${i}">${i}</button>`;
  $('#pager').innerHTML = total ? `<span class="muted t-sm">Menampilkan <b style="color:var(--ink)">${awal} - ${akhir}</b> dari <b style="color:var(--ink)">${total}</b> aplikasi</span>
    <div class="pg"><button type="button" data-hal="${hal - 1}" ${hal <= 1 ? 'disabled' : ''} aria-label="Halaman sebelumnya">${icon('chevron-left')}</button>${nomor}<button type="button" data-hal="${hal + 1}" ${hal >= halTotal ? 'disabled' : ''} aria-label="Halaman berikutnya">${icon('chevron-right')}</button></div>` : '';
  $$('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.v === FK.tampil));
}

function pgKatalog(c) {
  const lencana = set('hero_lencana', '');
  const judul = set('hero_judul', APP_CONFIG.NAMA_DEFAULT);
  const subjudul = set('hero_subjudul', 'Koleksi aplikasi web siap pakai dengan source code penuh, skema database, dan dokumentasi instalasi mandiri.');
  const t1 = set('hero_trust_1', 'Transfer Bank Diverifikasi Admin');
  const t2 = set('hero_trust_2', 'Full Source Code & Database');
  const t3 = set('hero_trust_3', 'Video Tutorial & Panduan Setup');

  c.el.innerHTML = `
    <section class="hero"><div class="container">
      <div class="hero-grid">
        <div class="hero-main">
          ${lencana ? `<div class="eyebrow">${esc(lencana)}</div>` : ''}
          <h1 class="h-xl">${esc(judul)}</h1>
          ${subjudul ? `<p class="sub">${mdInline(subjudul)}</p>` : ''}
          <div class="trust-list">
            ${t1 ? `<span>${icon('shield-check')} ${esc(t1)}</span>` : ''}
            ${t2 ? `<span>${icon('code')} ${esc(t2)}</span>` : ''}
            ${t3 ? `<span>${icon('video')} ${esc(t3)}</span>` : ''}
          </div>
        </div>
        <div class="hero-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <span class="lbl-mono">Pencarian Katalog</span>
            <span class="lbl-mono">${S.apps.length} produk terdaftar</span>
          </div>
          <form class="searchbar" id="fcari" role="search">
            <label class="sr" for="q">Cari aplikasi berdasarkan nama, kategori, atau teknologi</label>
            <div class="ig">${icon('search')}<input class="input" id="q" type="search" placeholder="Cari nama aplikasi, kategori, stack..." value="${esc(FK.q)}"></div>
            <button class="btn btn-primary btn-sm" type="submit">Cari</button>
          </form>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:180px">
              <label class="lbl-mono" for="urut">Urutkan:</label>
              <select class="select" id="urut" style="height:34px;font-size:13px;flex:1">
                <option value="populer">Terpopuler</option>
                <option value="terbaru">Terbaru</option>
                <option value="termurah">Harga Terendah</option>
                <option value="termahal">Harga Tertinggi</option>
                <option value="nama">Nama A-Z</option>
              </select>
            </div>
            <div class="seg" role="group" aria-label="Mode tampilan">
              <button type="button" data-v="grid" aria-label="Tampilan kotak">${icon('grid')}</button>
              <button type="button" data-v="list" aria-label="Tampilan daftar">${icon('list')}</button>
            </div>
          </div>
        </div>
      </div>
    </div></section>
    <div class="container">
      <div class="filterbar">
        <div id="chips" class="chips-wrap" role="group" aria-label="Filter kategori"></div>
      </div>
      <div id="grid" class="grid-cards"></div>
      <div class="pager" id="pager"></div>
    </div>`;
  $('#urut').value = FK.urut;
  const q = $('#q');
  q.addEventListener('input', debounce(() => { FK.q = q.value; FK.hal = 1; gambarKatalog(); }, 200));
  $('#fcari').addEventListener('submit', (e) => { e.preventDefault(); FK.q = q.value; FK.hal = 1; gambarKatalog(); $('#grid').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('#urut').addEventListener('change', (e) => { FK.urut = e.target.value; FK.hal = 1; gambarKatalog(); });
  on(c.el, 'click', '[data-kat]', (e, t) => { FK.kat = t.dataset.kat; FK.hal = 1; gambarKatalog(true); });
  on(c.el, 'pointerenter', '.pcard', (e, t) => {
    const link = t.querySelector('a[href^="#/aplikasi/"]');
    if (link) {
      const m = link.getAttribute('href').match(/#\/aplikasi\/([^?]+)/);
      if (m && m[1]) praMuatApp(m[1]);
    }
  });
  on(c.el, 'click', '.seg button', (e, t) => { FK.tampil = t.dataset.v; gambarKatalog(); });
  on(c.el, 'click', '[data-hal]', (e, t) => { FK.hal = +t.dataset.hal; gambarKatalog(true); $('#grid').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
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
    w.innerHTML = `<iframe width="800" height="450" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(w.dataset.yt)}?autoplay=1&rel=0" title="Video panduan aplikasi" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  });
}

async function pgDetail(c) {
  const id = c.params.id;
  c.el.innerHTML = `<div class="container"><div class="crumb"><div class="skel" style="width:240px;height:16px"></div></div>
    <div class="det"><div><div class="skel" style="aspect-ratio:16/9;border-radius:12px"></div></div><div class="skel" style="height:460px;border-radius:12px"></div></div></div>`;
  let d = S.detail[id];
  try { if (!d) { d = await API.get('getApp', { id }); S.detail[id] = d; } }
  catch (e) {
    if (c.batal()) return;
    c.el.innerHTML = `<div class="container"><div class="card empty" style="margin-top:48px"><div class="em-ic">${icon('search')}</div><h1>Aplikasi tidak ditemukan</h1><p style="margin-top:4px">${esc(e.message)}</p><a class="btn btn-primary" style="margin-top:16px" href="#/">${icon('arrow-left')} Kembali ke Katalog</a></div></div>`;
    return;
  }
  if (c.batal()) return;
  document.title = esc(d.nama) + ' | ' + set('nama_toko', APP_CONFIG.NAMA_DEFAULT);
  const tersedia = d.status === 'Tersedia';
  const tiles = [];
  const mainThumb = d.thumb || d.thumbnail_url;
  if (mainThumb) tiles.push({ id: mainThumb, label: 'Tampilan Utama' });
  (d.galeri || []).forEach((g, i) => tiles.push({ id: g.id, label: g.label || 'Foto ' + (i + 1) }));
  const alamat = (d.link_demo || d.demo_url) ? (d.link_demo || d.demo_url).replace(/^https?:\/\//, '').slice(0, 40) : null;
  const waNo = set('whatsapp');
  const tombolWA = waNo ? `
    <a class="btn btn-wa-outline btn-lg btn-block" style="margin-top:10px" href="${esc(linkWA(waNo, `Halo Admin, saya tertarik dengan aplikasi "${d.nama}" (v${d.versi || '1.0'}). Mau tanya beberapa hal sebelum memesan:\n${location.href}`))}" target="_blank" rel="noopener noreferrer">
      ${icon('whatsapp')} Tanya / Konsultasi via WA
    </a>
  ` : '';
  const tombolPesan = tersedia
    ? `<a class="btn btn-primary btn-lg btn-block" href="#/pesan/${esc(d.id)}">${icon('cart')} Pesan Lisensi (Tanpa Akun)</a>`
    : `<button class="btn btn-secondary btn-lg btn-block" type="button" disabled>Segera Hadir</button>`;
  const testiList = Array.isArray(d.testimoni) ? d.testimoni : [];
  const ratingJml = testiList.length;
  const ratingRata = ratingJml
    ? (testiList.reduce((acc, t) => acc + (Number(t.rating) || 5), 0) / ratingJml)
    : (typeof d.rating === 'number' ? d.rating : (Number(d.rating) || 0));
  const rating = { jumlah: ratingJml, rata: ratingRata };

  const teknoList = Array.isArray(d.teknologi)
    ? d.teknologi
    : (typeof d.teknologi === 'string'
      ? d.teknologi.split(',').map((s) => s.trim()).filter(Boolean)
      : []);

  const fiturList = Array.isArray(d.fitur) ? d.fitur : [];
  const langkahList = Array.isArray(d.langkah) ? d.langkah : [];

  const syaratList = Array.isArray(d.persyaratan)
    ? d.persyaratan
    : (typeof d.persyaratan === 'string'
      ? d.persyaratan.split('\n').map((s) => s.trim()).filter(Boolean)
      : []);

  const linkDemo = d.link_demo || d.demo_url;

  c.el.innerHTML = `<div class="container">
    <nav class="crumb" aria-label="Breadcrumb"><a href="#/">${icon('arrow-left')} Katalog</a><span>/</span><b>${esc(d.nama)}</b></nav>
    <div class="det">
      <div>
        <button type="button" class="pv-zoom-btn" id="main-pv" aria-label="Perbesar tangkapan layar ${esc(d.nama)}">${pratinjau(d, { besar: true, prioritas: true, thumb: tiles[0] ? tiles[0].id : '', alamat: alamat || undefined, lebar: 1100 })}</button>
        ${tiles.length > 1 ? `<div class="gal-tabs" role="group" aria-label="Galeri tangkapan layar">${tiles.map((t, i) => `<button type="button" class="${i === 0 ? 'on' : ''}" data-tile="${i}"><img loading="lazy" width="120" height="68" alt="Pratinjau ${esc(t.label)}" src="${esc(driveThumb(t.id, 240))}">${esc(t.label)}</button>`).join('')}</div>` : ''}
        ${d.video_penggunaan ? `<div style="margin-top:20px"><h2 class="sec-title" style="margin-bottom:12px">${icon('video')} Video Cara Pakai</h2>${kartuVideo(d.video_penggunaan, 'Video Cara Pakai (Demo Singkat)')}</div>` : ''}
      </div>
      <aside class="det-side"><div class="card card-p">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px">${pilihanPill(d.status)}<span class="lbl-mono">SKU: ${esc(d.id)}</span></div>
        <h1 class="h-lg" style="margin-bottom:8px">${esc(d.nama)}</h1>
        <p class="muted" style="margin-bottom:16px">${esc(d.deskripsi_singkat)}</p>
        <div class="spec-strip" style="margin-bottom:16px" aria-label="Spesifikasi rilis">
          <div><span class="lbl-mono" style="display:block">Versi</span><b>v${esc(d.versi || '1.0')}</b></div>
          <div><span class="lbl-mono" style="display:block">Rilis</span><b>${esc(bulanTahun(d.tanggal_rilis))}</b></div>
          <div><span class="lbl-mono" style="display:block">Lisensi</span><b>${esc(d.lisensi || 'Full Source')}</b></div>
        </div>
        ${teknoList.length ? `<div style="margin:12px 0 0"><div class="lbl-mono" style="margin-bottom:8px">Stack Teknologi</div><div style="display:flex;flex-wrap:wrap;gap:6px">${teknoList.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>` : ''}
        <div style="margin:20px 0 4px"><span class="price" style="font-size:32px;line-height:38px;letter-spacing:-.02em">${rupiah(d.harga)}</span> ${d.harga_coret ? `<s class="muted mono" style="font-size:13px;margin-left:6px">${rupiah(d.harga_coret)}</s>` : ''}</div>
        <div class="hint" style="margin-bottom:16px">Sekali bayar · Source code penuh · Tanpa biaya bulanan</div>
        ${tombolPesan}
        ${tombolWA}
        ${linkDemo ? `<div style="text-align:center;margin-top:12px"><a class="link-btn t-sm" href="${esc(urlAman(linkDemo))}" target="_blank" rel="noopener noreferrer">${icon('eye')} Buka Demo Interaktif ${icon('external-link')}</a></div>` : ''}
        <div class="note-i" style="margin-top:16px">${icon('shield-check')}<div>Transfer manual diverifikasi admin dalam ${esc(set('sla_verifikasi', '1×24 jam'))}. Tautan unduh source code dikirim langsung ke email Anda.</div></div>
      </div></aside>
    </div>
    <div class="det-body">
      <div>
        ${d.deskripsi_lengkap ? `<section style="margin-bottom:36px"><div class="eyebrow">Ringkasan Arsitektur</div><h2 class="h-lg" style="margin:4px 0 14px">Deskripsi Lengkap</h2><div class="prose">${md(d.deskripsi_lengkap)}</div></section>` : ''}
        ${fiturList.length ? `<section style="margin-bottom:36px"><div class="eyebrow">Spesifikasi Fungsional</div><h2 class="h-lg" style="margin:4px 0 14px">Modul &amp; Fitur Utama</h2>
          <div class="row c2">${fiturList.map((f, i) => `<div class="feat"><span class="feat-idx">MODUL ${String(i + 1).padStart(2, '0')}</span><h3>${esc(f.judul)}</h3><p class="muted t-sm">${esc(f.deskripsi)}</p></div>`).join('')}</div></section>` : ''}
        ${(d.video_instalasi || langkahList.length) ? `<section><div class="eyebrow">Panduan Instalasi Mandiri</div><h2 class="h-lg" style="margin:4px 0 8px">Tahapan Deployment</h2><p class="muted" style="margin-bottom:16px">Urutan langkah teknis menautkan aplikasi ke lingkungan server atau akun Anda.</p>
          ${d.video_instalasi ? kartuVideo(d.video_instalasi, 'Panduan Lengkap Setup dari Nol') : ''}
          ${langkahList.length ? `<div class="steps">${langkahList.map((l, i) => `<div class="step"><span class="no">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(l.judul)}</h3><p class="muted t-sm" style="margin-top:2px">${esc(l.deskripsi)}</p></div>${l.durasi ? `<span class="tm">${esc(l.durasi)}</span>` : ''}</div>`).join('')}</div>` : ''}</section>` : ''}
      </div>
      <aside style="display:flex;flex-direction:column;gap:16px">
        <div class="card card-p"><h2 class="sec-title" style="margin-bottom:10px"><span class="dot"></span>Ulasan Pembeli Terverifikasi</h2>
          ${rating.jumlah ? `<div class="rating-big"><b>${rating.rata.toFixed(1)}</b>${bintang(rating.rata, 18)}</div><p class="muted t-sm" style="margin-top:4px">Berdasarkan ${rating.jumlah} ulasan pembeli terverifikasi</p>` : `<p class="muted t-sm">Belum ada testimoni untuk aplikasi ini.</p>`}
          ${testiList.map((t) => `<div class="rev"><div class="who"><span class="avatar">${t.foto ? `<img alt="Foto ${esc(t.nama)}" width="32" height="32" loading="lazy" src="${esc(driveThumb(t.foto, 96))}" onerror="this.remove()">` : esc(inisial(t.nama))}</span><div style="flex:1;min-width:0"><b class="t-sm">${esc(t.nama)}</b>${t.peran ? `<div class="hint">${esc(t.peran)}</div>` : ''}</div><span class="pill pill-ok nodot" style="height:20px;font-size:10px">${icon('check')} Terverifikasi</span></div>${bintang(t.rating, 13)}<p class="t-sm" style="color:var(--text-2)">"${esc(t.isi)}"</p></div>`).join('')}
        </div>
        ${syaratList.length ? `<div class="card card-p"><h2 class="sec-title"><span class="dot"></span>Persyaratan Sistem</h2><ul class="checklist">${syaratList.map((p) => `<li>${icon('check-circle')}<span>${esc(p)}</span></li>`).join('')}</ul></div>` : ''}
      </aside>
    </div></div>
    <div class="buy-bar"><div><div class="price">${rupiah(d.harga)}</div><div class="hint">sekali bayar</div></div>${tersedia ? `<a class="btn btn-primary" href="#/pesan/${esc(d.id)}">Pesan Lisensi</a>` : '<button class="btn btn-secondary" type="button" disabled>Segera Hadir</button>'}</div>`;
  document.body.classList.add('has-buybar');
  bindVideo(c.el);
  let aktifTile = 0;
  on(c.el, 'click', '[data-tile]', (e, t) => {
    aktifTile = +t.dataset.tile;
    const it = tiles[aktifTile];
    $$('.gal-tabs button', c.el).forEach((b) => b.classList.toggle('on', b === t));
    $('#main-pv').innerHTML = pratinjau(d, { besar: true, prioritas: true, thumb: it.id, alamat: alamat || undefined, lebar: 1100 });
  });
  on(c.el, 'click', '#main-pv', () => {
    const it = tiles[aktifTile] || tiles[0];
    if (it && it.id) bukaLightbox(driveThumb(it.id, 1600), d.nama + (it.label ? ' : ' + it.label : ''));
    else toast('Pratinjau gambar belum tersedia untuk aplikasi ini.', 'info');
  });
  if (!ss('kaw_tv_' + id)) { ss('kaw_tv_' + id, 1); API.post('trackView', { id }).catch(() => {}); }
}

// ============================================================
// FORM PEMESANAN
// ============================================================
function pgPesan(c) {
  const a = S.apps.find((x) => x.id === c.params.id);
  if (!a) { c.el.innerHTML = `<div class="container"><div class="card empty" style="margin-top:48px"><div class="em-ic">${icon('search')}</div><h1>Aplikasi tidak ditemukan</h1><a class="btn btn-primary" style="margin-top:16px" href="#/">Kembali ke Katalog</a></div></div>`; return; }
  if (a.status !== 'Tersedia') { c.el.innerHTML = `<div class="container"><div class="card empty" style="margin-top:48px"><div class="em-ic">${icon('clock')}</div><h1>Aplikasi ini belum dapat dipesan</h1><p style="margin-top:4px">${esc(a.nama)} berstatus Segera Hadir.</p><a class="btn btn-primary" style="margin-top:16px" href="#/aplikasi/${esc(a.id)}">Kembali ke Detail</a></div></div>`; return; }
  document.title = 'Pesan ' + esc(a.nama) + ' | ' + set('nama_toko', APP_CONFIG.NAMA_DEFAULT);
  const bankNo = set('bank_nomor', '-'), bankNm = set('bank_nama', 'Bank Transfer');
  const st = { bukti: null, kupon: null, diskon: 0, total: a.harga };
  c.el.innerHTML = `<div class="container">
    <div style="padding-top:24px"><h1 class="h-lg">Pemesanan Lisensi: ${esc(a.nama)}</h1><p class="muted t-sm" style="margin-top:4px">Selesaikan data penerima lisensi, transfer sesuai nominal, dan unggah bukti pembayaran.</p></div>
    <div class="stepper" id="stepper" aria-label="Tahap pemesanan"></div>
    <form class="ord" id="fpesan" novalidate>
      <div style="display:flex;flex-direction:column;gap:24px;min-width:0">
        <section class="card card-p">
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px"><div><h2 class="sec-title"><span class="dot"></span>1. Data Penerima Lisensi</h2><p class="muted t-sm" style="margin-top:4px">Pastikan alamat email aktif untuk pengiriman tanda terima resmi dan tautan unduh source code.</p></div><span class="pill pill-mute nodot">${icon('lock')} Tanpa Akun</span></div>
          <div class="field"><label for="nama">Nama Lengkap <span class="req">*</span></label><input class="input" id="nama" autocomplete="name" maxlength="100" placeholder="Nama sesuai identitas"><div class="hint">Dicantumkan pada dokumen tanda terima dan sertifikat lisensi.</div><div class="err">${icon('alert-circle')}<span>Nama lengkap minimal 2 karakter.</span></div></div>
          <div class="field"><label for="email">Alamat Email Aktif <span class="req">*</span></label><div class="ig"><input class="input" id="email" type="email" autocomplete="email" maxlength="200" placeholder="nama@email.com"><span class="valid-ic hide" id="emok">${icon('check-circle')}</span></div><div class="hint">${icon('info')} Tautan akses privat dikirim ke alamat ini setelah verifikasi selesai.</div><div class="err">${icon('alert-circle')}<span>Format email tidak valid.</span></div></div>
          <div class="field" style="margin-bottom:0"><label for="wa">Nomor WhatsApp <span class="opt">(opsional)</span></label><input class="input" id="wa" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="0812-3456-7890"><div class="hint">Digunakan jika admin perlu konfirmasi mengenai pesanan Anda.</div><div class="err">${icon('alert-circle')}<span>Format nomor tidak valid.</span></div></div>
          <input type="text" name="website" id="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0" aria-hidden="true">
        </section>
        <section class="card card-p">
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px"><h2 class="sec-title"><span class="dot"></span>2. Rekening Tujuan Transfer</h2><span class="pill pill-indigo nodot">Verifikasi Maks. ${esc(set('sla_verifikasi', '1×24 jam'))}</span></div>
          <div class="bank-spec">
            <div class="bank-spec-head">
              <span class="bank-spec-name">${icon('landmark')} ${esc(bankNm)}</span>
              <span class="pill pill-ok nodot">${icon('shield-check')} Rekening Resmi</span>
            </div>
            <div class="bank-spec-body">
              <div class="bank-spec-num-row">
                <div>
                  <div class="lbl-mono">Nomor Rekening Tujuan</div>
                  <div class="bank-spec-acc">${esc(bankNo)}</div>
                </div>
                <button class="btn btn-secondary btn-sm" type="button" id="salin-rek">${icon('copy')} Salin Nomor</button>
              </div>
              <div class="bank-spec-meta">
                <div><span class="muted">Atas Nama:</span> <b>${esc(set('bank_atas_nama', '-'))}</b></div>
                ${set('bank_cabang') ? `<div class="mono t-sm muted">Cabang/Kode: ${esc(set('bank_cabang'))}</div>` : ''}
              </div>
            </div>
          </div>
          <div class="nominal"><div><div class="nl">${icon('credit-card')} Nominal yang harus ditransfer</div><div class="muted t-sm" style="margin-top:2px;max-width:420px">${esc(set('catatan_transfer', 'Transfer sesuai nominal agar verifikasi mutasi berjalan cepat.'))}</div></div><div class="amt" id="transfer-amt">${rupiah(a.harga)}</div></div>
          ${set('whatsapp') ? `
            <div class="help-inline-bar">
              <span class="t-sm" style="display:inline-flex;align-items:center;gap:6px;font-weight:500">${icon('whatsapp')} Butuh bantuan atau konfirmasi saat transfer?</span>
              <a class="btn btn-sm btn-wa" href="${esc(linkWA(set('whatsapp'), `Halo Admin, saya sedang memesan "${a.nama}". Ingin konfirmasi mengenai pembayaran transfer...`))}" target="_blank" rel="noopener noreferrer">Chat Admin via WA</a>
            </div>
          ` : ''}
        </section>
        <section class="card card-p">
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px"><h2 class="sec-title"><span class="dot"></span>3. Unggah Bukti Transfer <span class="req">*</span></h2><span class="pill pill-mute nodot" id="bukti-st">Belum ada berkas</span></div>
          <div class="dropzone" id="dz" tabindex="0" role="button" aria-label="Pilih berkas bukti transfer"><div class="dz-ic">${icon('upload-cloud')}</div><div>Seret &amp; lepas berkas bukti transfer di sini, atau <u>Telusuri Berkas</u></div><div class="hint">Mendukung format JPG, PNG, atau PDF (ukuran maksimal 5 MB)</div></div>
          <input type="file" id="berkas" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.pdf" class="hide" aria-label="Berkas bukti transfer">
          <div id="berkas-info"></div><div class="field has-error" style="margin:8px 0 0"><div class="err" id="bukti-err">${icon('alert-circle')}<span></span></div></div>
        </section>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><a class="btn btn-ghost" href="#/aplikasi/${esc(a.id)}">${icon('arrow-left')} Kembali ke Detail</a><button class="btn btn-primary btn-lg" type="submit" id="kirim">Kirim Pesanan &amp; Bukti Transfer</button></div>
      </div>
      <aside class="ord-side">
        <div class="card card-p"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h2 class="h-sm">Ringkasan Pesanan</h2><span class="lbl-mono">SKU: ${esc(a.id)}</span></div>
          <div class="mini-app"><div class="mt">${pratinjau(a, { lebar: 200 })}</div><div style="min-width:0"><div class="mono" style="font-size:11px;color:var(--indigo-700)">v${esc(a.versi || '1.0')} · Web App</div><div class="h-sm" style="margin:2px 0">${esc(a.nama)}</div><div class="mono muted" style="font-size:11px">Lisensi ${esc(a.lisensi || 'Full Source')}</div></div></div>
          <div style="margin-top:16px">
            <div class="sumrow"><span class="muted">Harga Lisensi</span><span class="mono">${rupiah(a.harga)}</span></div>
            <div id="sum-discount"></div>
            <div class="sumrow"><span class="muted">Biaya Verifikasi</span><span class="mono" style="color:var(--ok-t)">Rp 0</span></div>
          </div>
          <div class="total-box"><div><div class="lbl-mono">Total Pembayaran</div></div><div class="amt" id="total-amt">${rupiah(a.harga)}</div></div>
          <div class="coupon-box">
            <label for="kd-kupon" class="lbl-mono" style="margin-bottom:6px;display:block">${icon('tag')} Kode Promo</label>
            <div id="coupon-area"></div>
            <div id="coupon-msg" class="coupon-err hide"></div>
          </div>
          <div class="note-i" style="margin-top:16px;background:var(--bg);border-color:var(--line);color:var(--text-2)">${icon('shield-check')}<div>Simpan <b>Kode Pesanan</b> yang tampil pada layar berikutnya untuk memantau status verifikasi.</div></div>
        </div>
        ${set('garansi_order_judul') ? `<div class="card card-p-sm" style="display:flex;gap:12px;align-items:flex-start"><span class="avatar" style="background:var(--ok-bg);color:var(--ok-t);border-color:var(--ok-line)">${icon('shield-check')}</span><div><b class="t-sm">${esc(set('garansi_order_judul'))}</b><p class="muted t-sm" style="margin-top:2px">${esc(set('garansi_order_teks'))}</p></div></div>` : ''}
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
    const nm = [['TAHAP 01', 'Data Pembeli'], ['TAHAP 02', 'Transfer Bank'], ['TAHAP 03', 'Unggah Bukti']];
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
      btn.innerHTML = icon('check') + ' Tersalin';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
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
              <div class="mono" style="font-size:12px;color:#CBD5E1">${ukuranBerkas(b.ukuran)}</div>
            </div>
          ` : `
            <img id="prv-img" width="640" height="360" src="${b.dataUrl}" alt="Pratinjau bukti transfer ${esc(b.nama)}">
          `}
        </div>
        <div class="receipt-preview-foot">
          <div class="receipt-preview-info">
            <b class="t-sm" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(b.nama)}</b>
            <span class="muted t-sm mono">${ukuranBerkas(b.ukuran)} · Siap dikirim</span>
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
          toast(`Kupon ${item.kode} berhasil dipasang. Hemat ${rupiah(pot)}.`, 'ok');
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
        total: st.total,
        total_bayar: st.total
      };
      const r = await API.post('createOrder', payload, { timeout: 120000 });
      r.kode = r.kode || (r.pesanan && r.pesanan.id) || '';
      r.nama = payload.nama;
      r.email = payload.email;
      r.aplikasi = a.nama;
      r.versi = a.versi || '1.0';
      r.nama_file = st.bukti.nama;
      r.ukuran = st.bukti.ukuran;
      r.tanggal = new Date().toISOString();
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
    <h1 class="h-lg">Pesanan Berhasil Dibuat</h1>
    <p class="muted" style="margin-top:8px">Terima kasih, <b style="color:var(--ink)">${esc(o.nama)}</b>. Bukti transfer Anda telah diterima dan akan diverifikasi admin maksimal ${esc(set('sla_verifikasi', '1×24 jam'))}.</p>
    <div class="refbox"><div class="lbl-mono">Nomor Referensi / Kode Pesanan</div><div class="code">${esc(o.kode)}<button class="btn btn-secondary btn-sm" type="button" id="salin">${icon('copy')} Salin Kode</button></div><p class="hint" style="margin-top:8px">Simpan kode pesanan ini untuk mengecek status verifikasi atau mengirim testimoni.</p></div>
    <div style="text-align:left"><div class="kv"><span>Aplikasi</span><span>${esc(o.aplikasi)} <span class="mono" style="color:var(--indigo-700)">(v${esc(o.versi || '1.0')})</span></span></div>
      <div class="kv"><span>Email Pembeli</span><span class="mono">${esc(o.email)}</span></div>
      <div class="kv"><span>Total Pembayaran</span><span class="mono">${rupiah(totalAkhir)}</span></div>
      ${o.diskon ? `<div class="kv"><span>Diskon Promo (${esc(o.kode_kupon)})</span><span class="mono" style="color:var(--ok-t)">-${rupiah(o.diskon)}</span></div>` : ''}
      <div class="kv"><span>Berkas Terunggah</span><span class="mono" style="font-size:13px;overflow-wrap:anywhere">${esc(o.nama_file)} <span class="muted">(${ukuranBerkas(o.ukuran)})</span></span></div>
      <div class="kv"><span>Tanggal Pesanan</span><span>${esc(tgl(o.tanggal, true))}</span></div></div>
    <div class="note-i" style="text-align:left;margin:20px 0">${icon('mail')}<div><b>Pengiriman Tautan Source Code</b><br>Begitu pembayaran disetujui, email resmi berisi tanda terima (PDF), tautan akses privat, dan panduan instalasi langsung dikirim ke alamat email Anda.</div></div>
    <a class="btn btn-primary btn-lg btn-block" href="#/status?kode=${encodeURIComponent(o.kode)}">Pantau Status Pesanan</a>
    <p style="margin-top:16px"><a href="#/">${icon('arrow-left')} Kembali ke Katalog</a></p></div>
    ${set('email_admin') ? `<p class="muted t-sm" style="text-align:center">Butuh bantuan? Hubungi <a href="mailto:${esc(set('email_admin'))}">${esc(set('email_admin'))}</a></p>` : ''}</div>`;
  $('#salin').addEventListener('click', () => salin(o.kode, 'Kode pesanan disalin'));
}

// ============================================================
// CEK STATUS PESANAN
// ============================================================
function normalisasiOrderStatus(r) {
  const waktu = r.waktu || { dibuat: r.tanggal || r.created_at, diverifikasi: r.tanggal_verifikasi, akses_terkirim: r.status === 'Disetujui' ? (r.tanggal_verifikasi || r.tanggal) : null };
  const appNama = typeof r.aplikasi === 'object' && r.aplikasi ? r.aplikasi.nama : (r.aplikasi || r.aplikasi_id || 'Aplikasi Web');
  const appVer = (typeof r.aplikasi === 'object' && r.aplikasi && r.aplikasi.versi) || r.versi || '1.0';
  return {
    kode: r.kode || r.id,
    nama: r.nama || r.nama_pemesan || '-',
    email: r.email || '-',
    status: r.status || 'Menunggu Verifikasi',
    aplikasi: appNama,
    versi: appVer,
    lisensi: r.lisensi || 'Full Source',
    jumlah: r.jumlah !== undefined ? r.jumlah : (r.total_harga || 0),
    bank_nama: r.bank_nama || set('bank_nama', 'Bank Transfer'),
    bank_nomor: r.bank_nomor || set('bank_nomor', '-'),
    catatan_admin: r.catatan_admin || r.catatan || '',
    waktu,
    berkas: r.berkas || { nama: r.bukti_transfer_url ? 'Bukti Transfer Terunggah' : '-', tanggal: r.tanggal || r.created_at },
    sudah_testimoni: !!r.sudah_testimoni
  };
}

function langkahStatus(r) {
  const s = r.status, w = r.waktu || {};
  return [
    { j: 'Pesanan Dibuat', w: tgl(w.dibuat, true), d: 'Data pesanan tercatat', k: 'done' },
    s === 'Ditolak' ? { j: 'Pembayaran Ditolak', w: 'Perlu perbaikan bukti', d: '', k: 'bad' }
      : { j: 'Verifikasi Mutasi', w: w.diverifikasi ? tgl(w.diverifikasi, true) : 'Menunggu admin', d: 'Validasi bukti transfer', k: s === 'Disetujui' ? 'done' : 'wait' },
    { j: 'Akses Terkirim', w: w.akses_terkirim ? tgl(w.akses_terkirim, true) : (s === 'Disetujui' && r.email_status === 'Gagal' ? 'Email tertunda' : '-'), d: 'Source code & tanda terima', k: w.akses_terkirim ? 'done' : 'wait' }
  ];
}
function hasilStatus(raw) {
  const r = normalisasiOrderStatus(raw);
  const langkah = langkahStatus(r);
  const banner = r.status === 'Disetujui'
    ? `<div class="banner ok"><div class="bic">${icon('mail')}</div><div class="bt"><b>${r.waktu.akses_terkirim ? 'Akses Telah Terkirim' : 'Pembayaran Disetujui'}</b>${r.waktu.akses_terkirim ? 'Tautan akses privat aplikasi dan panduan instalasi telah dikirimkan ke <b class="mono">' + esc(r.email) + '</b>.' : 'Email akses sedang diproses. Jika belum diterima, hubungi kami dengan menyebut kode pesanan Anda.'}</div>
        <div class="ba"><button class="btn btn-secondary btn-sm" type="button" id="unduh-pdf">${icon('download')} Unduh PDF</button><a class="btn btn-secondary btn-sm" href="#/tanda-terima?kode=${encodeURIComponent(r.kode)}">${icon('file-text')} Lihat Tanda Terima</a>${r.sudah_testimoni ? '' : `<a class="btn btn-accent btn-sm" href="#/testimoni?kode=${encodeURIComponent(r.kode)}">Kirim Ulasan</a>`}</div></div>`
    : r.status === 'Ditolak'
      ? `<div class="banner bad"><div class="bic">${icon('alert-triangle')}</div><div class="bt"><b>Catatan Verifikator</b>${esc(r.catatan_admin || 'Bukti transfer belum dapat diverifikasi.')}</div><div class="ba"><button class="btn btn-primary btn-sm" type="button" id="buka-ulang">${icon('upload-cloud')} Unggah Ulang Bukti</button></div></div>
         <div id="ulang-box" class="hide" style="margin-top:12px"><div class="dropzone" id="dz2" tabindex="0" role="button" aria-label="Unggah ulang bukti transfer"><div class="dz-ic">${icon('upload-cloud')}</div><div>Seret berkas bukti baru atau <u>Telusuri</u></div><div class="hint">JPG, PNG, atau PDF (maks. 5 MB)</div></div><input type="file" id="berkas2" accept="image/jpeg,image/png,image/webp,application/pdf" class="hide" aria-label="Berkas bukti transfer baru"><div id="info2"></div><div style="margin-top:12px;text-align:right"><button class="btn btn-primary" type="button" id="kirim-ulang" disabled>Kirim Bukti Baru</button></div></div>`
      : `<div class="banner wait"><div class="bic">${icon('clock')}</div><div class="bt"><b>Sedang Diperiksa Admin</b>Bukti transfer Anda sudah diterima. Verifikasi memerlukan waktu maksimal ${esc(set('sla_verifikasi', '1×24 jam'))}.</div></div>`;
  return `<div class="card card-p" style="margin-top:24px">
    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start"><div><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span class="mono" style="font-size:22px;font-weight:700">${esc(r.kode)}</span><span class="pill pill-indigo nodot">Lisensi ${esc(r.lisensi)}</span></div><div class="t-lg" style="margin-top:6px;font-weight:600">${esc(r.aplikasi)} <span class="mono muted">(v${esc(r.versi)})</span></div></div>${pil(r.status)}</div>
    <div class="tracker" style="margin:20px 0 16px">${langkah.map((l) => `<div class="tk ${l.k}"><span class="tc">${l.k === 'done' ? icon('check') : l.k === 'bad' ? icon('x') : icon('clock')}</span><div><b>${esc(l.j)}</b><small>${esc(l.w)}</small><div class="hint">${esc(l.d)}</div></div></div>`).join('')}</div>
    ${banner}
    <h3 class="h-sm" style="margin:24px 0 12px">Rincian Transaksi</h3>
    <div class="spec-strip" style="padding:0">
      <div style="padding:12px 14px"><div class="lbl-mono">Total Pembayaran</div><div class="mono" style="font-size:18px;font-weight:700;margin-top:4px;color:var(--ink)">${rupiah(r.jumlah)}</div><div class="hint mono">${r.status === 'Disetujui' ? 'Lunas Terverifikasi' : 'Menunggu Konfirmasi'}</div></div>
      <div style="padding:12px 14px"><div class="lbl-mono">Metode Pembayaran</div><div style="margin-top:4px;font-weight:600;color:var(--ink)">${icon('landmark')} Transfer ${esc(r.bank_nama)}</div><div class="hint mono">Rek: ${esc(r.bank_nomor)}</div></div>
      <div style="padding:12px 14px"><div class="lbl-mono">Berkas Bukti Transfer</div><div class="mono" style="margin-top:4px;font-size:12px;color:var(--indigo-700);overflow-wrap:anywhere">${icon('image')} ${esc(r.berkas.nama)}</div><div class="hint">Tanggal: ${esc(tgl(r.berkas.tanggal))}</div></div>
    </div></div>`;
}
function pgStatus(c) {
  const v = ss('kaw_verif') || {};
  const kode0 = c.query.kode || v.kode || '';
  const email0 = kode0 && v.kode === kode0 ? v.email : '';
  c.el.innerHTML = `<div class="container" style="max-width:960px"><div style="padding:36px 0 24px"><div class="eyebrow">Pelacakan Pesanan</div><h1 class="h-lg" style="font-size:30px;margin-top:4px">Cek Status Pesanan</h1><p class="muted" style="max-width:600px;margin-top:6px">Masukkan kode pesanan dan alamat email yang digunakan saat checkout untuk melihat status verifikasi pembayaran serta tautan unduh aplikasi.</p></div>
    <form class="card card-p" id="fstat" novalidate>
      <div class="row c2"><div class="field"><label for="k">Kode Pesanan <span class="req">*</span></label><div class="ig">${icon('hash')}<input class="input mono" id="k" placeholder="INV-... atau ORD-..." autocomplete="off" value="${esc(kode0)}" maxlength="40"></div></div>
        <div class="field"><label for="e">Alamat Email Pembeli <span class="req">*</span></label><div class="ig">${icon('mail')}<input class="input" id="e" type="email" placeholder="nama@email.com" autocomplete="email" value="${esc(email0)}" maxlength="200"></div></div></div>
      <button class="btn btn-primary" type="submit" id="cek">${icon('search')} Periksa Status Pesanan</button></form>
    <div id="hasil"></div>
    <section style="margin-top:40px"><h2 class="h-md">Keterangan Tahap Verifikasi</h2><p class="muted t-sm" style="margin:4px 0 14px">arti setiap status pada proses verifikasi pembayaran manual.</p>
      <div class="status-legend">
        <div><div class="ph"><span>TAHAP 01</span>${pil('Menunggu Verifikasi', 'Menunggu')}</div><h3 class="h-sm">Pengecekan Mutasi</h3><p class="muted t-sm" style="margin-top:4px">Admin mencocokkan mutasi rekening dengan bukti bayar yang diunggah (maks. ${esc(set('sla_verifikasi', '1×24 jam'))}).</p></div>
        <div><div class="ph"><span>TAHAP 02</span>${pil('Disetujui')}</div><h3 class="h-sm">Distribusi Akses</h3><p class="muted t-sm" style="margin-top:4px">Tautan source code privat beserta tanda terima resmi dikirimkan ke email pembeli.</p></div>
        <div><div class="ph"><span>KOREKSI</span>${pil('Ditolak')}</div><h3 class="h-sm">Unggah Ulang Bukti</h3><p class="muted t-sm" style="margin-top:4px">Jika nominal selisih atau foto buram, Anda dapat mengunggah bukti baru langsung di halaman ini.</p></div>
      </div>
      <div class="help-inline-bar" style="margin-top:16px"><span class="muted">${icon('help-circle')} Belum menerima email setelah status disetujui lebih dari 15 menit?</span><a href="#/bantuan" class="link-btn">Buka Pusat Bantuan</a></div></section></div>`;
  const form = $('#fstat');
  async function periksa() {
    const kode = $('#k').value.trim(), email = $('#e').value.trim();
    if (!kode || !EMAIL_RE.test(email)) { toast('Isi kode pesanan dan email dengan benar.', 'warn'); return; }
    const btn = $('#cek'); tombolBusy(btn, true, 'Memeriksa...');
    $('#hasil').innerHTML = '<div class="card card-p" style="margin-top:24px"><div class="skel" style="height:24px;width:40%"></div><div class="skel" style="height:90px;margin-top:16px"></div><div class="skel" style="height:60px;margin-top:16px"></div></div>';
    try {
      const r = await API.post('checkOrder', { kode, email });
      if (c.batal()) return;
      const norm = normalisasiOrderStatus(r);
      ss('kaw_verif', { kode: norm.kode, email });
      $('#hasil').innerHTML = hasilStatus(norm);
      ikatStatus(norm, email);
    } catch (e) { $('#hasil').innerHTML = `<div class="alert err" style="margin-top:24px">${icon('alert-circle')}<div>${esc(e.message)}</div></div>`; }
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
        try { bukti = await siapkanBukti(file); $('#info2').innerHTML = `<div class="filerow"><div class="fi">${bukti.pdf ? icon('file-text') : `<img alt="Pratinjau bukti baru" width="40" height="40" src="${bukti.dataUrl}">`}</div><div style="min-width:0"><div class="fn">${esc(bukti.nama)}</div><div class="fm">${ukuranBerkas(bukti.ukuran)} · siap dikirim</div></div></div>`; $('#kirim-ulang').disabled = false; }
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
    c.el.innerHTML = `<div class="container"><div class="card center-card"><h1 class="h-md">Buka Tanda Terima Pembayaran</h1><p class="muted" style="margin:8px 0 16px">Masukkan kode pesanan dan alamat email terdaftar untuk membuka dokumen tanda terima.</p><form id="fr" novalidate><div class="field"><label for="tt-k">Kode Pesanan <span class="req">*</span></label><input class="input mono" id="tt-k" value="${esc(kode)}" placeholder="INV-... atau ORD-..."></div><div class="field"><label for="tt-e">Alamat Email <span class="req">*</span></label><input class="input" id="tt-e" type="email" placeholder="nama@email.com"></div><button class="btn btn-primary btn-block" type="submit">Buka Tanda Terima</button></form></div></div>`;
    $('#fr').addEventListener('submit', (e) => { e.preventDefault(); ss('kaw_verif', { kode: $('#tt-k').value.trim(), email: $('#tt-e').value.trim() }); pgTandaTerima({ el: c.el, query: { kode: $('#tt-k').value.trim() }, batal: c.batal }); });
    return;
  }
  c.el.innerHTML = '<div class="container"><div class="receipt"><div class="skel" style="height:40px;width:50%"></div><div class="skel" style="height:200px;margin-top:24px"></div></div></div>';
  let r;
  try { r = await API.post('getReceipt', { kode, email }); }
  catch (e) { if (c.batal()) return; c.el.innerHTML = `<div class="container"><div class="card center-card" style="text-align:center"><div class="empty"><div class="em-ic">${icon('file-text')}</div><h1>Tanda terima belum tersedia</h1><p style="margin-top:4px">${esc(e.message)}</p><a class="btn btn-primary" style="margin-top:16px" href="#/status?kode=${encodeURIComponent(kode)}">Kembali ke Status Pesanan</a></div></div></div>`; return; }
  if (c.batal()) return;
  const k = r.kredensial || {};
  c.el.innerHTML = `<div class="toolbar-r"><div class="container in"><a class="btn btn-ghost btn-sm" href="#/status?kode=${encodeURIComponent(kode)}">${icon('arrow-left')} Kembali ke Status Pesanan</a><span style="flex:1"></span>
      <button class="btn btn-secondary btn-sm" type="button" id="cetak">${icon('printer')} Cetak Dokumen</button><button class="btn btn-secondary btn-sm" type="button" id="pdf">${icon('download')} Unduh PDF</button>${k.link_akses ? `<a class="btn btn-accent btn-sm" href="${esc(urlAman(k.link_akses))}" target="_blank" rel="noopener noreferrer">${icon('external-link')} Buka Tautan Akses</a>` : ''}</div></div>
    <div class="container"><article class="receipt">
      <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-bottom:20px;border-bottom:1px solid var(--line)">
        <div style="display:flex;gap:12px;align-items:center"><img src="assets/logo.svg" width="44" height="44" alt="Logo ${esc(r.toko.nama)}" style="border-radius:10px;border:1px solid var(--line)"><div><div class="h-sm">${esc(r.toko.nama)}</div><div class="muted t-sm">${esc(r.toko.kota)}${r.toko.email ? ' · ' + esc(r.toko.email) : ''}</div></div></div>
        <div style="text-align:right"><div class="eyebrow">Tanda Terima Pembayaran Resmi</div><h1 class="h-md mono" style="margin:4px 0">${esc(r.nomor_invoice)}</h1><span class="pill pill-ok">LUNAS / TERVERIFIKASI</span></div></div>
      <div class="row c2" style="margin:20px 0"><div style="background:var(--bg);border:1px solid var(--line);padding:16px;border-radius:12px"><div class="lbl-mono">Diterbitkan Untuk</div><div class="h-sm" style="margin:6px 0 2px">${esc(r.pembeli.nama)}</div><div class="muted t-sm">${icon('mail')} ${esc(r.pembeli.email)}</div><div class="hint" style="margin-top:12px">ID Referensi Pesanan:</div><div class="mono" style="color:var(--indigo-700);font-size:13px">${esc(r.kode)}</div></div>
        <div style="background:var(--bg);border:1px solid var(--line);padding:16px;border-radius:12px"><div class="lbl-mono">Detail Transaksi</div><div class="kv" style="padding:6px 0;border:0"><span>Tanggal Pesan</span><span class="mono" style="font-size:12px">${esc(tgl(r.tanggal_pesan, true))}</span></div><div class="kv" style="padding:6px 0;border:0"><span>Tanggal Verifikasi</span><span class="mono" style="font-size:12px">${esc(tgl(r.tanggal_verifikasi, true))}</span></div><div class="kv" style="padding:6px 0;border:0"><span>Metode Bayar</span><span>${esc(r.metode)}</span></div><div class="hint" style="text-align:right">${esc(r.rekening)}</div></div></div>
      <div class="tbl-wrap"><table><thead><tr><th>No</th><th>Deskripsi Aplikasi &amp; Paket</th><th>Versi</th><th>Jenis Lisensi</th><th style="text-align:right">Total</th></tr></thead><tbody><tr><td class="mono">01</td><td><b>${esc(r.item.nama)}</b><div class="muted t-sm">${esc(r.item.deskripsi)}</div></td><td><span class="tag">v${esc(r.item.versi)}</span></td><td>${esc(r.item.lisensi)}</td><td class="mono" style="text-align:right">${rupiah(r.item.total)}</td></tr></tbody></table></div>
      <div style="display:flex;justify-content:flex-end;margin-top:16px"><div style="min-width:280px;background:var(--bg);border:1px solid var(--line);padding:16px;border-radius:12px"><div class="sumrow"><span class="muted">Subtotal Produk:</span><span class="mono">${rupiah(r.subtotal)}</span></div><div class="sumrow"><span class="muted">Biaya Administrasi:</span><span class="mono">${rupiah(r.biaya_admin)}</span></div><div class="sumrow" style="margin-top:8px;padding-top:12px;border-top:1px solid var(--line-2);font-weight:600"><span>Total Lunas:</span><span class="mono" style="color:var(--indigo-700);font-size:18px">${rupiah(r.total)}</span></div></div></div>
      <div class="cred"><h2 class="sec-title">${icon('key')} Kredensial &amp; Akses Anda</h2><p class="muted t-sm" style="margin-top:4px">Simpan informasi akses ini dan jangan dibagikan kepada pihak luar.</p>
        ${k.link_akses ? `<div class="cred-row"><div><div class="hint">Tautan Akses Utama:</div><div class="cv">${esc(k.link_akses)}</div></div><button class="btn btn-secondary btn-sm" type="button" data-salin="${esc(k.link_akses)}">${icon('copy')} Salin Tautan</button></div>` : ''}
        ${k.video_instalasi ? `<div class="cred-row"><div><div class="hint">Video Panduan Setup &amp; Deployment:</div><div class="cv">${esc(k.video_instalasi)}</div></div><a class="btn btn-secondary btn-sm" href="${esc(urlAman(k.video_instalasi))}" target="_blank" rel="noopener noreferrer">${icon('play')} Putar Video</a></div>` : ''}
        ${k.token ? `<div class="cred-row dark"><div><div style="font-size:12px;color:#CBD5E1">Token Lisensi Aktif:</div><div class="cv">${esc(k.token)}</div></div><button class="btn btn-secondary btn-sm" type="button" data-salin="${esc(k.token)}">${icon('copy')} Salin Token</button></div>` : ''}</div>
      <p class="muted t-sm" style="margin-top:24px">Dokumen ini diterbitkan secara elektronik oleh sistem ${esc(r.toko.nama)} dan sah sebagai bukti pembayaran.</p>
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
    <div class="eyebrow">Ulasan Pembeli</div>
    <h1 class="h-lg" style="font-size:30px;margin:4px 0">Kirim Testimoni Penggunaan</h1>
    <p class="muted" style="margin-bottom:24px">Bagikan evaluasi jujur mengenai kualitas kode dan kemudahan instalasi aplikasi yang Anda beli.</p>
    <div id="sukses"></div>
    <div class="two">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card card-p" id="kiri"></div>
        <div class="card card-p"><h2 class="h-sm">Ketentuan Moderasi Ulasan</h2><ul class="checklist" style="margin-top:10px">
          <li>${icon('check-circle')}<span>Hanya nomor pesanan berstatus <b>Disetujui</b> yang dapat mengirimkan ulasan.</span></li>
          <li>${icon('check-circle')}<span>Setiap ulasan ditinjau admin untuk memastikan tidak ada spam atau tautan berbahaya.</span></li>
        </ul></div>
      </div>
      <form class="card card-p" id="ftes" novalidate><fieldset id="fs" disabled style="border:0;padding:0;margin:0;min-width:0;opacity:.55">
        <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:4px"><h2 class="h-md">Formulir Evaluasi Aplikasi</h2><span class="hint">* Wajib diisi</span></div>
        <p class="muted t-sm" style="margin-bottom:20px">Verifikasi kode pesanan di panel sebelah kiri terlebih dahulu untuk mengaktifkan formulir ini.</p>
        <div style="padding:16px;background:var(--bg);border:1px solid var(--line);border-radius:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px"><div><div class="lbl-mono">Penilaian Keseluruhan *</div><div id="lr" style="font-weight:500;margin-top:4px">${LABEL_RATING[0]}</div></div><div class="stars-in" id="sin" role="radiogroup" aria-label="Rating bintang">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-r="${n}" aria-label="${n} bintang">${icon('star')}</button>`).join('')}</div></div>
        <div class="row c2"><div class="field"><label for="nt">Nama Tampil Publik <span class="req">*</span></label><input class="input" id="nt" maxlength="80"><div class="hint">Boleh memakai nama panggilan, inisial, atau nama unit usaha.</div></div><div class="field"><label for="pr">Peran / Bidang Usaha <span class="opt">(Opsional)</span></label><input class="input" id="pr" maxlength="100" placeholder="Contoh: Pemilik Toko Ritel"></div></div>
        <div class="field"><label for="is">Ulasan Pengalaman Penggunaan <span class="req">*</span><span class="opt mono" id="cn">0 / 500 karakter</span></label><textarea class="textarea" id="is" maxlength="500" rows="5" placeholder="Ceritakan pengalaman Anda: kemudahan instalasi, fitur yang paling membantu, dan dampaknya untuk operasional Anda."></textarea><div class="hint">Minimal 40 karakter.</div><div class="err" id="is-err">${icon('alert-circle')}<span></span></div></div>
        <div class="field"><label for="foto">Unggah Foto Profil / Logo Usaha <span class="opt">(Opsional)</span></label><div id="foto-box"><button class="btn btn-secondary btn-sm" type="button" id="pilih-foto">${icon('image')} Pilih Berkas Foto</button><span class="hint" style="margin-left:8px">JPG, PNG, WEBP · Maksimal 2 MB</span></div><input type="file" id="foto" accept="image/jpeg,image/png,image/webp" class="hide"></div>
        <div class="note-i" style="margin-bottom:16px">${icon('info')}<div>Testimoni akan dimoderasi oleh admin sebelum ditampilkan pada halaman detail produk.</div></div>
        <label class="check" style="margin-bottom:20px"><input type="checkbox" id="konf"><span>Saya menyatakan bahwa ulasan ini ditulis berdasarkan pengalaman nyata penggunaan aplikasi.</span></label>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span class="hint">${icon('shield')} Email tidak ditampilkan ke publik</span><button class="btn btn-primary btn-lg" type="submit" id="kirim">Kirim Testimoni</button></div>
      </fieldset></form></div>
    <div class="card card-p" style="margin-top:24px;display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap"><div style="display:flex;gap:16px;align-items:center"><span class="avatar" style="width:44px;height:44px;border-radius:10px">${icon('code')}</span><div><h2 class="h-sm">Butuh Penyesuaian Fitur Khusus?</h2><p class="muted t-sm">Hubungi developer untuk diskusi modifikasi modul, skema database, atau integrasi API.</p></div></div>${set('email_admin') ? `<a class="btn btn-secondary" href="mailto:${esc(set('email_admin'))}">Hubungi Developer ${icon('external-link')}</a>` : ''}</div></div>`;

  function kiri() {
    const o = st.order;
    $('#kiri').innerHTML = o ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span class="lbl-mono">Status Kepemilikan</span><span class="pill pill-ok">Terverifikasi</span></div>
        <div class="field"><label for="ro-kode">Nomor Referensi Pesanan</label><div class="ig">${icon('check-circle')}<input class="input mono" id="ro-kode" readonly value="${esc(o.kode)}"><span class="end" style="top:10px;right:12px;color:var(--muted)">${icon('lock')}</span></div></div>
        <div class="field"><label for="ro-email">Email Pembeli</label><div class="ig">${icon('mail')}<input class="input" id="ro-email" readonly value="${esc(o.email)}"></div></div>
        <div class="field"><span class="lbl">Aplikasi Terkait</span><div class="mini-app"><span class="avatar" style="border-radius:8px">${icon('package')}</span><div><b>${esc(o.aplikasi)}</b><div class="hint mono">v${esc(o.versi)} · Lisensi ${esc(o.lisensi || 'Full Source')}</div></div></div></div>
        <button class="btn btn-ghost btn-block" type="button" id="ganti">${icon('refresh')} Ganti Kode Pesanan</button>`
      : `<h2 class="h-sm" style="margin-bottom:4px">1. Verifikasi Kepemilikan</h2><p class="muted t-sm" style="margin-bottom:16px">Masukkan kode pesanan dan email terdaftar untuk membuka formulir ulasan.</p>
        <div class="field"><label for="k">Kode Pesanan</label><div class="ig">${icon('hash')}<input class="input mono" id="k" value="${esc(kode0)}" placeholder="INV-... atau ORD-..." maxlength="40"></div></div>
        <div class="field"><label for="e">Email Pembeli Terdaftar</label><div class="ig">${icon('mail')}<input class="input" id="e" type="email" value="${esc(email0)}" placeholder="nama@email.com" maxlength="200"></div></div>
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
      const raw = await API.post('checkOrder', { kode, email });
      const r = normalisasiOrderStatus(raw);
      if (r.status !== 'Disetujui') throw new ApiError('Testimoni hanya dapat dikirim untuk pesanan yang sudah disetujui. Status pesanan Anda saat ini: ' + r.status + '.');
      if (r.sudah_testimoni) throw new ApiError('Pesanan ini sudah memiliki testimoni. Terima kasih.');
      st.order = { kode: r.kode, email, aplikasi: r.aplikasi, versi: r.versi, lisensi: r.lisensi, nama: r.nama };
      ss('kaw_verif', { kode: r.kode, email }); kiri();
    } catch (e) { tombolBusy(b, false); $('#verr').innerHTML = `<div class="alert err" style="margin-bottom:12px">${icon('alert-circle')}<div>${esc(e.message)}</div></div>`; }
  }
  kiri();
  if (kode0 && email0) verifikasi();
  on($('#sin'), 'click', 'button', (e, t) => { st.rating = +t.dataset.r; $$('#sin button').forEach((b) => b.classList.toggle('on', +b.dataset.r <= st.rating)); $('#lr').textContent = st.rating + '.0 / 5.0 : ' + LABEL_RATING[st.rating]; });
  $('#is').addEventListener('input', (e) => { $('#cn').textContent = e.target.value.length + ' / 500 karakter'; });
  $('#pilih-foto').addEventListener('click', () => $('#foto').click());
  $('#foto').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      st.foto = await siapkanGambar(file, { maxSisi: 800, kualitas: 0.8, webp: true });
      if (st.foto.ukuran > 2 * 1024 * 1024) { st.foto = null; throw new Error('Ukuran foto maksimal 2 MB.'); }
      $('#foto-box').innerHTML = `<div class="filerow" style="margin:0"><div class="fi"><img alt="Pratinjau foto" width="40" height="40" src="${st.foto.dataUrl}"></div><div style="min-width:0;flex:1"><div class="fn">${esc(st.foto.nama)}</div><div class="fm muted">${ukuranBerkas(st.foto.ukuran)}</div></div><button class="btn btn-ghost btn-sm" type="button" id="hf" aria-label="Hapus foto">${icon('trash')}</button></div>`;
      $('#hf').addEventListener('click', () => { st.foto = null; $('#foto-box').innerHTML = `<button class="btn btn-secondary btn-sm" type="button" id="pilih-foto2">${icon('image')} Pilih Berkas Foto</button>`; $('#pilih-foto2').addEventListener('click', () => $('#foto').click()); });
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
      $('#sukses').innerHTML = `<div class="alert ok" style="margin-bottom:24px;padding:16px">${icon('check-circle')}<div><b>Terima kasih, ulasan Anda telah diterima.</b><br>Testimoni sedang dalam antrean moderasi admin sebelum ditampilkan di halaman publik.</div></div>`;
      $('#ftes').classList.add('hide'); $('#kiri').innerHTML = `<div class="empty" style="padding:16px"><div class="em-ic" style="background:var(--ok-bg);color:var(--ok-t)">${icon('check')}</div><h2>Testimoni Terkirim</h2><a class="btn btn-secondary" style="margin-top:12px" href="#/">Kembali ke Katalog</a></div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { tombolBusy(btn, false); toast(err.message, 'err', 6000); }
  });
}

// ============================================================
// BANTUAN & FAQ
// ============================================================
function skelBantuan() {
  return `<section class="help-hero"><div class="container"><div class="skel" style="width:45%;max-width:420px;height:34px;margin-bottom:12px"></div><div class="skel" style="width:65%;max-width:560px;height:20px;margin-bottom:20px"></div><div class="skel" style="width:100%;max-width:520px;height:42px;border-radius:8px"></div></div></section>
    <div class="container" style="padding-top:24px">
      <div class="help-grid" style="margin-top:24px">
        <div><div class="card card-p"><div class="skel" style="height:16px;width:50%;margin-bottom:12px"></div>${'<div class="skel" style="height:36px;margin-bottom:8px;border-radius:8px"></div>'.repeat(4)}</div></div>
        <div>${'<div class="card card-p" style="margin-bottom:12px"><div class="skel" style="height:22px;width:70%;margin-bottom:8px"></div><div class="skel" style="height:14px;width:90%"></div></div>'.repeat(3)}</div>
      </div>
    </div>`;
}

async function pgBantuan(c) {
  let faq = S.faq;
  if (!faq) {
    c.el.innerHTML = skelBantuan();
    try { faq = await API.get('getFaq'); S.faq = faq; } catch (e) { faq = []; }
    if (c.batal()) return;
  }
  const cats = Array.from(new Set(faq.map((f) => f.kategori).filter(Boolean)));
  const F = { q: '', cat: 'Semua' };
  const wa = set('whatsapp'), email = set('email_admin');
  const IK = ['book', 'landmark', 'wrench', 'message-circle'];

  const statGaransi = [1, 2, 3]
    .map((i) => set('garansi_stat_' + i, ''))
    .filter(Boolean)
    .map((s) => s.split('|'))
    .filter((p) => p[0] && p[0].trim());

  c.el.innerHTML = `<section class="help-hero"><div class="container">
      <div class="hero-grid">
        <div class="hero-main">
          <div class="eyebrow">Dokumentasi &amp; Dukungan Teknis</div>
          <h1 class="h-xl">Pusat Bantuan &amp; Pertanyaan Umum (FAQ)</h1>
          <p class="muted t-lg" style="max-width:600px">Jawaban lengkap seputar alur pemesanan lisensi, pembayaran transfer manual, cara instalasi source code, serta dukungan teknis developer.</p>
        </div>
        <div class="hero-panel">
          <label class="lbl-mono" for="hq">Cari Topik Bantuan</label>
          <div class="searchbar"><div class="ig">${icon('search')}<input class="input" id="hq" type="search" placeholder="Ketik kata kunci (misal: lisensi, instalasi, verifikasi)..."></div></div>
          <div class="hint">Pilih kategori di bawah atau ketik kata kunci untuk menyaring jawaban secara instan.</div>
        </div>
      </div>
    </div></section>
    <div class="container" style="padding-top:28px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:14px">
        <div><div class="eyebrow">Ringkasan Prosedur</div><h2 class="h-md" style="margin-top:2px">Alur Pemesanan Lisensi</h2></div>
        <a href="#/" class="t-sm link-btn">Buka Katalog Aplikasi</a>
      </div>
      <div class="flow-strip">
        <div class="flow-item"><span class="no">TAHAP 01 · PILIH PRODUK</span><h3 class="h-sm">Isi Data Penerima</h3><p class="muted t-sm">Pilih aplikasi di katalog dan masukkan nama serta email aktif tanpa perlu registrasi akun.</p></div>
        <div class="flow-item"><span class="no">TAHAP 02 · PEMBAYARAN</span><h3 class="h-sm">Transfer &amp; Unggah Bukti</h3><p class="muted t-sm">Transfer sesuai nominal ke rekening resmi ${esc(set('bank_nama', 'toko'))} lalu unggah foto/PDF struk bukti bayar.</p></div>
        <div class="flow-item"><span class="no">TAHAP 03 · DISTRIBUSI</span><h3 class="h-sm">Terima Source Code</h3><p class="muted t-sm">Admin memverifikasi maksimal ${esc(set('sla_verifikasi', '1×24 jam'))}, tautan unduh privat dikirim langsung ke email Anda.</p></div>
      </div>
      <div class="help-grid" style="margin-top:40px">
        <div><div class="card card-p"><div class="lbl-mono">Kategori FAQ</div><h2 class="h-sm" style="margin-top:4px">Topik Pertanyaan</h2><p class="muted t-sm" style="margin-top:4px">Saring daftar pertanyaan berdasarkan topik:</p><div class="topnav" id="topnav" role="group" aria-label="Kategori FAQ"></div></div>
          <div class="card card-p" style="margin-top:16px;background:var(--bg);box-shadow:none"><h2 class="sec-title">${icon('help-circle')} Pertanyaan Lainnya?</h2><p class="muted t-sm" style="margin:8px 0 12px">Diskusikan kebutuhan kustomisasi modul atau integrasi khusus langsung bersama developer.</p>${email ? `<a class="btn btn-secondary btn-block" href="mailto:${esc(email)}">Kirim Email Konsultasi</a>` : ''}</div></div>
        <div id="faq"></div></div>
      <div class="card help-contact" style="margin-top:40px"><div><div class="eyebrow">Kontak Langsung</div><h2 class="h-lg" style="margin:4px 0 8px">Hubungi Developer</h2><p class="muted" style="margin-bottom:20px">Butuh bantuan spesifik mengenai pesanan Anda, kendala teknis saat deployment, atau konsultasi lisensi komersial?</p>
          <div class="row c2">${email ? `<div class="contact-tile"><span class="ct-ic">${icon('mail')}</span><div><div class="hint">Email Resmi</div><a class="mono t-sm" href="mailto:${esc(email)}">${esc(email)}</a></div></div>` : ''}${wa ? `<div class="contact-tile"><span class="ct-ic">${icon('message-circle')}</span><div><div class="hint">WhatsApp Support</div><a class="mono t-sm" href="${esc(linkWA(wa, 'Halo, saya butuh bantuan mengenai pesanan saya.'))}" target="_blank" rel="noopener noreferrer">${esc(wa)}</a></div></div>` : ''}</div>
          ${set('jam_layanan') ? `<div class="contact-tile" style="margin-top:12px">${icon('clock')}<span class="t-sm">Jam Operasional Layanan: <b>${esc(set('jam_layanan'))}</b></span></div>` : ''}</div>
        <div><div class="lbl-mono" style="margin-bottom:12px">Akses Cepat</div><div style="display:flex;flex-direction:column;gap:12px"><a class="quick" href="#/status"><span class="qi">${icon('file-text')}</span><div style="flex:1"><b>Cek Status Pesanan</b><div class="hint">Lacak status verifikasi pembayaran Anda</div></div></a><a class="quick" href="#/"><span class="qi g">${icon('grid')}</span><div style="flex:1"><b>Katalog Aplikasi Web</b><div class="hint">Telusuri seluruh produk aplikasi siap pakai</div></div></a></div></div></div>
      <div class="row c2" style="margin-top:24px;align-items:stretch">
        ${set('garansi_judul') ? `<div class="card card-p"><div class="eyebrow">Jaminan Kualitas</div><h2 class="h-md" style="margin:4px 0 8px">${esc(set('garansi_judul'))}</h2><p class="muted t-sm">${esc(set('garansi_teks'))}</p>${statGaransi.length ? `<div class="spec-strip" style="margin-top:16px">${statGaransi.map((p) => `<div><b style="display:block;color:var(--indigo-700)">${esc(p[0])}</b><span>${esc(p[1] || '')}</span></div>`).join('')}</div>` : ''}</div>` : ''}
        <div class="card card-p" style="display:flex;flex-direction:column;justify-content:center"><div class="eyebrow">Umpan Balik Pembeli</div><h2 class="h-md" style="margin:4px 0 8px">Sudah Menggunakan Aplikasi Kami?</h2><p class="muted t-sm" style="margin-bottom:16px">Bagikan ulasan pengalaman implementasi aplikasi di tempat usaha Anda melalui formulir testimoni terverifikasi.</p><div><a class="btn btn-accent" href="#/testimoni">${icon('message-square')} Kirim Testimoni Pembeli</a></div></div></div></div>`;
  function gambar(hanyaFaq) {
    const q = F.q.trim().toLowerCase();
    const daftar = faq.filter((f) => (F.cat === 'Semua' || f.kategori === F.cat) && (!q || (f.pertanyaan + ' ' + f.jawaban).toLowerCase().indexOf(q) >= 0));
    if (!hanyaFaq) {
      $('#topnav').innerHTML = ['Semua'].concat(cats).map((k) => `<button type="button" data-cat="${esc(k)}" class="${F.cat === k ? 'on' : ''}"><span>${icon(k === 'Semua' ? 'grid' : IK[cats.indexOf(k) % IK.length])} ${k === 'Semua' ? 'Semua Topik' : esc(k)}</span><span class="n">${k === 'Semua' ? faq.length : faq.filter((f) => f.kategori === k).length}</span></button>`).join('');
    } else {
      $$('#topnav button', c.el).forEach(b => b.classList.toggle('on', b.dataset.cat === F.cat));
    }
    const faqEl = $('#faq');
    if (!daftar.length) { faqEl.innerHTML = `<div class="card empty"><div class="em-ic">${icon('search')}</div><h3>Pertanyaan tidak ditemukan</h3><p>Coba kata kunci lain, atau hubungi developer langsung melalui kontak di bawah.</p></div>`; return; }
    let html = '', kat = null;
    daftar.forEach((f, i) => {
      if (f.kategori !== kat) { kat = f.kategori; html += `<h3 class="faq-cat">${icon(IK[Math.max(0, cats.indexOf(kat)) % IK.length])} ${esc(kat)}</h3>`; }
      const open = i === 0 && !q;
      html += `<div class="acc ${open ? 'open' : ''}"><button type="button" aria-expanded="${open ? 'true' : 'false'}"><span>${esc(f.pertanyaan)}</span>${icon('chevron-down')}</button><div class="ans">${esc(f.jawaban)}</div></div>`;
    });
    faqEl.innerHTML = html;
  }
  gambar();
  $('#hq').addEventListener('input', debounce((e) => { F.q = e.target.value; gambar(true); }, 200));
  on(c.el, 'click', '[data-cat]', (e, t) => { F.cat = t.dataset.cat; gambar(true); });
  on(c.el, 'click', '.acc > button', (e, t) => { const a = t.closest('.acc'); a.classList.toggle('open'); t.setAttribute('aria-expanded', a.classList.contains('open')); });
}
