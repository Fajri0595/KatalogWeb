/* ============================================================
   admin2.js — kelola aplikasi, moderasi testimoni, pengaturan
   ============================================================ */

// ============================================================
// KELOLA APLIKASI — DAFTAR
// ============================================================
const AdmA = { q: '', kat: 'Semua', status: 'Semua', hal: 1 };
async function admAplikasi(c) {
  const el = c.el;
  el.innerHTML = skelAdmin(3);
  const apps = await muatAplikasi(true);
  if (c.batal()) return;
  const kats = ['Semua'].concat(Array.from(new Set(apps.map((a) => a.kategori))));
  el.innerHTML = `<div class="page-h"><div><div class="eyebrow">Manajemen Produk</div><h1 class="h-lg" style="margin-top:4px">Daftar &amp; Kelola Aplikasi Web</h1><p>Atur etalase aplikasi, visibilitas status penjualan, pembaruan versi, dan konfigurasi harga produk.</p></div>
      <div class="acts"><button class="btn btn-secondary" id="segar">${icon('refresh')} Sinkronkan</button><a class="btn btn-primary" href="#/admin/aplikasi/baru">${icon('plus')} Tambah Aplikasi Baru</a></div></div>
    <div class="stats stats-c3" style="grid-template-columns:repeat(3,minmax(0,1fr))">
      <div class="card stat"><div class="lbl-mono">Total Aplikasi Terdaftar</div><div class="sv">${apps.length}<small>katalog</small></div></div>
      <div class="card stat"><div class="lbl-mono">Rata-rata Nilai Lisensi</div><div class="sv" style="font-size:24px">${rupiah(apps.length ? apps.reduce((s, a) => s + a.harga, 0) / apps.length : 0)}</div></div>
      <div class="card stat"><div class="lbl-mono">Total Terjual (Disetujui)</div><div class="sv">${apps.reduce((s, a) => s + a.jumlah_pesanan, 0)}<small>lisensi</small></div></div></div>
    <div class="card"><div class="filters">
        <div class="ig">${icon('search')}<input class="input" id="q" placeholder="Cari nama aplikasi, kategori, ID..." value="${esc(AdmA.q)}"></div>
        <select class="select" id="kat">${kats.map((k) => `<option value="${esc(k)}" ${AdmA.kat === k ? 'selected' : ''}>${k === 'Semua' ? 'Kategori: Semua' : esc(k)}</option>`).join('')}</select>
        <div class="tabs seg-t" id="stt">${['Semua', 'Tersedia', 'Segera Hadir', 'Tidak Dijual'].map((s) => `<button class="${AdmA.status === s ? 'on' : ''}" data-st="${esc(s)}">${s}</button>`).join('')}</div></div>
      <div class="tbl-wrap" id="tbl"></div><div class="tbl-foot" id="fot"></div></div>`;
  function saring() {
    const q = AdmA.q.trim().toLowerCase();
    return apps.filter((a) => (AdmA.kat === 'Semua' || a.kategori === AdmA.kat) && (AdmA.status === 'Semua' || a.status === AdmA.status) && (!q || (a.nama + a.id + a.kategori).toLowerCase().indexOf(q) >= 0))
      .sort((x, y) => x.urutan - y.urutan);
  }
  function gambar() {
    const daftar = saring(); const per = 8, tot = Math.max(1, Math.ceil(daftar.length / per)); AdmA.hal = Math.min(AdmA.hal, tot);
    $('#stt', el).innerHTML = ['Semua', 'Tersedia', 'Segera Hadir', 'Tidak Dijual'].map((s) => `<button class="${AdmA.status === s ? 'on' : ''}" data-st="${esc(s)}">${s}</button>`).join('');
    $('#tbl').innerHTML = daftar.length ? `<table class="tbl"><thead><tr><th>Aplikasi</th><th>Harga</th><th>Status</th><th>Versi &amp; Rilis</th><th>Tampil Publik</th><th>Terjual</th><th>Diubah</th><th style="text-align:right">Aksi</th></tr></thead><tbody>${daftar.slice((AdmA.hal - 1) * per, AdmA.hal * per).map((a) => `<tr><td><div class="app-cell"><div class="app-ic">${a.thumb ? `<img alt="" src="${esc(driveThumb(a.thumb, 100))}">` : icon('package')}</div><div style="min-width:0"><b>${esc(a.nama)}</b><div class="sub mono">${esc(a.id)} • ${esc(a.kategori)}</div></div></div></td><td class="mono">${rupiah(a.harga)}</td><td>${pil(a.status)}</td><td class="sub">v${esc(a.versi || '-')}<br>${esc(tgl(a.tanggal_rilis))}</td><td><label class="switch"><input type="checkbox" data-toggle="${esc(a.id)}" ${a.tampil_publik ? 'checked' : ''}></label></td><td class="mono">${a.jumlah_pesanan}</td><td class="sub">${esc(relatif(a.diubah_pada))}</td><td style="text-align:right"><a class="btn btn-secondary btn-sm" href="#/admin/aplikasi/${esc(a.id)}">${icon('pencil')} Ubah</a> <button class="btn btn-ghost btn-sm btn-icon" data-hapus="${esc(a.id)}" aria-label="Hapus">${icon('trash')}</button></td></tr>`).join('')}</tbody></table>` : `<div class="empty"><div class="em-ic">${icon('package')}</div><h3>Belum ada aplikasi</h3><p>Klik "Tambah Aplikasi Baru" untuk mengisi katalog.</p></div>`;
    $('#fot').innerHTML = `<span>Menampilkan <b style="color:var(--ink)">${daftar.length ? (AdmA.hal - 1) * per + 1 : 0}-${Math.min(daftar.length, AdmA.hal * per)}</b> dari <b style="color:var(--ink)">${daftar.length}</b> total item katalog</span><div class="pager" style="margin:0;padding:0;border:0"><div class="pg"><button data-h="${AdmA.hal - 1}" ${AdmA.hal <= 1 ? 'disabled' : ''}>${icon('chevron-left')}</button>${Array.from({ length: tot }, (_, i) => `<button class="${i + 1 === AdmA.hal ? 'on' : ''}" data-h="${i + 1}">${i + 1}</button>`).join('')}<button data-h="${AdmA.hal + 1}" ${AdmA.hal >= tot ? 'disabled' : ''}>${icon('chevron-right')}</button></div></div>`;
  }
  gambar();
  $('#segar').addEventListener('click', async () => { await muatAplikasi(true); apps.length = 0; Adm.apps.forEach((a) => apps.push(a)); gambar(); toast('Katalog disegarkan.', 'ok', 2000); });
  $('#q').addEventListener('input', debounce((e) => { AdmA.q = e.target.value; AdmA.hal = 1; gambar(); }, 200));
  $('#kat').addEventListener('change', (e) => { AdmA.kat = e.target.value; AdmA.hal = 1; gambar(); });
  on(el, 'click', '[data-st]', (e, t) => { AdmA.status = t.dataset.st; AdmA.hal = 1; gambar(); });
  on(el, 'click', '[data-h]', (e, t) => { AdmA.hal = +t.dataset.h; gambar(); });
  on(el, 'change', '[data-toggle]', async (e, t) => {
    const id = t.dataset.toggle, tampil = t.checked;
    t.disabled = true;
    try { await ambil('adminToggleApp', { id, tampil }); const a = apps.find((x) => x.id === id); if (a) a.tampil_publik = tampil; toast(tampil ? 'Aplikasi ditampilkan di katalog.' : 'Aplikasi disembunyikan dari katalog.', 'ok', 2200); bersihkanCachePublik(); }
    catch (e2) { t.checked = !tampil; toast(e2.message, 'err'); } finally { t.disabled = false; }
  });
  on(el, 'click', '[data-hapus]', async (e, t) => {
    const a = apps.find((x) => x.id === t.dataset.hapus);
    const ok = await konfirmasi('Hapus aplikasi ini?', 'Aplikasi <b>' + esc(a.nama) + '</b> akan dihapus permanen dari katalog. Pesanan lama tetap tersimpan.', { ok: 'Ya, Hapus', bahaya: true });
    if (!ok) return;
    try { await ambil('adminDeleteApp', { id: a.id }); const i = apps.indexOf(a); apps.splice(i, 1); Adm.apps = apps.slice(); bersihkanCachePublik(); gambar(); toast('Aplikasi dihapus.', 'ok'); } catch (e2) { toast(e2.message, 'err'); }
  });
}

// ============================================================
// KELOLA APLIKASI — FORM TAMBAH/UBAH
// ============================================================
function baris(f) { return typeof f === 'string' ? f : JSON.stringify(f); }
function kosongForm() { return { id: '', nama: '', kategori: '', harga: '', harga_coret: '', status: 'Tersedia', versi: '', tanggal_rilis: '', urutan: 1, teknologi: [], lisensi: 'Full Access', tampil_publik: true, thumb: '', galeri: [], video_penggunaan: '', video_instalasi: '', link_demo: '', link_akses_privat: '', catatan_email: '', deskripsi_singkat: '', deskripsi_lengkap: '', fitur: [], persyaratan: '', langkah: [] }; }

async function admAplikasiForm(c) {
  const el = c.el;
  const idParam = c.bagian[1];
  const baru = idParam === 'baru';
  el.innerHTML = skelAdmin(0) + '<div class="card card-p"><div class="skel" style="height:300px"></div></div>';
  let F = kosongForm();
  if (!baru) {
    try { const d = await ambil('adminGetApp', { id: idParam }); if (c.batal()) return; F = Object.assign(kosongForm(), d, { teknologi: d.teknologi || [] }); }
    catch (e) { if (!c.batal()) galatAdmin(el, e, () => jalankan()); return; }
  }
  let kotor = false;
  const kategoriAda = Array.from(new Set((Adm.apps || []).map((a) => a.kategori))).filter(Boolean);
  document.title = (baru ? 'Tambah Aplikasi' : 'Ubah ' + F.nama) + ' — Admin';

  function render() {
    el.innerHTML = `<a href="#/admin/aplikasi" class="t-sm" style="display:inline-flex;gap:6px;align-items:center;color:var(--muted);margin-bottom:8px">${icon('arrow-left')} Kembali ke Kelola Aplikasi</a>
      <div class="page-h"><div>${!baru ? `<div class="lbl-mono">${esc(F.id)} • v${esc(F.versi || '-')}</div>` : ''}<h1 class="h-lg" style="margin-top:2px">${baru ? 'Tambah Aplikasi Baru' : 'Edit Aplikasi: ' + esc(F.nama)}</h1><p>Lengkapi informasi produk, unggah media pendukung, dan tautkan link akses privat source code.</p></div>${!baru ? pil(F.status) : ''}</div>
      <div class="ap-form">
        <div class="col">
          <div class="card card-p"><div class="sec-title" style="margin-bottom:16px">${icon('file-text')} Informasi Dasar Produk</div>
            <div class="field"><label for="fnama">Nama Lengkap Aplikasi <span class="req">*</span></label><input class="input" id="fnama" maxlength="150" value="${esc(F.nama)}"></div>
            <div class="field"><label for="fsingkat">Deskripsi Singkat (Ringkasan Etalase) <span class="req">*</span><span class="opt mono" id="cn">0/150</span></label><textarea class="textarea" id="fsingkat" rows="2" maxlength="150">${esc(F.deskripsi_singkat)}</textarea></div>
            <div class="field"><label for="fkat">Kategori Aplikasi <span class="req">*</span></label><input class="input" id="fkat" list="katlist" maxlength="60" value="${esc(F.kategori)}"><datalist id="katlist">${kategoriAda.map((k) => `<option value="${esc(k)}">`).join('')}</datalist></div>
            <div class="row c2"><div class="field"><label for="fharga">Harga Lisensi (IDR) <span class="req">*</span></label><input class="input" id="fharga" type="number" min="0" step="1000" value="${F.harga}"></div><div class="field"><label for="fcoret">Harga Coret <span class="opt">(opsional)</span></label><input class="input" id="fcoret" type="number" min="0" step="1000" value="${F.harga_coret || ''}"></div></div>
            <div class="row c2"><div class="field"><label for="fstatus">Status Ketersediaan</label><select class="select" id="fstatus"><option value="Tersedia" ${F.status === 'Tersedia' ? 'selected' : ''}>Tersedia (Dapat Dibeli)</option><option value="Segera Hadir" ${F.status === 'Segera Hadir' ? 'selected' : ''}>Segera Hadir (Pre-order)</option><option value="Tidak Dijual" ${F.status === 'Tidak Dijual' ? 'selected' : ''}>Tidak Dijual (Arsip)</option></select></div><div class="field"><label for="furut">Urutan Tampil</label><input class="input" id="furut" type="number" value="${F.urutan}"></div></div>
            <div class="row c2"><div class="field"><label for="fver">Versi Rilis</label><input class="input" id="fver" maxlength="20" placeholder="2.1" value="${esc(F.versi)}"></div><div class="field"><label for="ftgl">Tanggal Rilis</label><input class="input" id="ftgl" type="date" value="${esc(F.tanggal_rilis)}"></div></div>
            <div class="field"><label for="flisensi">Jenis Lisensi</label><input class="input" id="flisensi" maxlength="60" value="${esc(F.lisensi)}"></div>
            <div class="field" style="margin-bottom:0"><label>Tumpukan Teknologi (Tech Stack)</label><div class="tag-in" id="tagwrap"><input id="taginput" placeholder="Ketik lalu Enter, mis. Google Apps Script"></div></div></div>
          <div class="card card-p"><div class="sec-title" style="margin-bottom:16px">${icon('book')} Deskripsi &amp; Dokumen Fitur</div>
            <div class="field"><label for="fdesk">Deskripsi Lengkap</label><div class="md-tool"><button type="button" data-md="b" title="Tebal"><b>B</b></button><button type="button" data-md="i" title="Miring"><i>I</i></button><button type="button" data-md="h" title="Judul">H</button><button type="button" data-md="l" title="Daftar">•</button><button type="button" data-md="k" title="Kode">&lt;/&gt;</button></div><div class="md-ed"><textarea class="textarea" id="fdesk">${esc(F.deskripsi_lengkap)}</textarea><div class="pvw prose" id="fdesk-pv"></div></div><div class="hint">Mendukung format Markdown ringan (#, **tebal**, - daftar).</div></div>
            <div class="field"><label>Fitur Unggulan</label><div id="fitwrap"></div><button class="btn btn-secondary btn-sm" type="button" id="addfit">${icon('plus')} Tambah Fitur</button></div>
            <div class="field"><label for="fsyarat">Persyaratan Sistem <span class="opt">(satu per baris)</span></label><textarea class="textarea" id="fsyarat" rows="3">${esc(F.persyaratan)}</textarea></div>
            <div class="field" style="margin-bottom:0"><label>Langkah Instalasi</label><div id="lkwrap"></div><button class="btn btn-secondary btn-sm" type="button" id="addlk">${icon('plus')} Tambah Langkah</button></div></div>
          <div class="card card-p"><div class="sec-title" style="margin-bottom:16px">${icon('image')} Media Visual &amp; Tautan Video</div>
            <div class="field"><label>Thumbnail Sampul Utama (rasio 16:9)</label><div class="thumb-big" id="thumbbox"></div><input type="file" id="thumbinput" accept="image/*" class="hide"></div>
            <div class="field"><label>Galeri Tangkapan Layar <span class="opt">(maks. 5)</span></label><div class="gal-adm" id="galwrap"></div><input type="file" id="galinput" accept="image/*" multiple class="hide"><button class="btn btn-secondary btn-sm" type="button" id="addgal">${icon('upload-cloud')} Tambah Foto</button></div>
            <div class="row c2"><div class="field"><label for="fvidp">Link Video Cara Pakai (YouTube)</label><input class="input" id="fvidp" placeholder="https://youtu.be/..." value="${esc(F.video_penggunaan)}"></div><div class="field"><label for="fvidi">Link Video Tutorial Instalasi</label><input class="input" id="fvidi" placeholder="https://youtu.be/..." value="${esc(F.video_instalasi)}"></div></div></div>
        </div>
        <div class="col">
          <div class="card card-p"><div class="sec-title" style="margin-bottom:16px">${icon('link')} Tautan Aplikasi</div>
            <div class="field"><label for="fdemo">Link Demo Publik <span class="opt">(opsional)</span></label><input class="input" id="fdemo" placeholder="https://" value="${esc(F.link_demo)}"></div>
            <div class="private-box"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px"><b class="t-sm">${icon('lock')} Link Akses Privat (Source Code)</b><span class="pill pill-ink">Rahasia</span></div><input class="input mono" id="fakses" placeholder="https://github.com/user/repo atau link ZIP" value="${esc(F.link_akses_privat)}" style="background:#fff"><p class="hint" style="margin-top:8px">Tautan ini tidak pernah tampil di halaman publik. Otomatis dikirim ke email pembeli setelah pembayaran disetujui.</p></div>
            <div class="field" style="margin:16px 0 0"><label for="fcatatan">Catatan Khusus untuk Email Pembeli <span class="opt">(opsional)</span></label><textarea class="textarea" id="fcatatan" rows="3" maxlength="2000">${esc(F.catatan_email)}</textarea></div></div>
          <div class="card card-p"><div class="sec-title" style="margin-bottom:12px">${icon('eye')} Visibilitas</div><label class="check"><input type="checkbox" id="ftampil" ${F.tampil_publik ? 'checked' : ''}><span>Tampilkan di katalog publik</span></label>
            ${!baru ? `<div class="hint" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)">Dibuat: ${esc(tgl(F.dibuat_pada, true))}<br>Diubah: ${esc(tgl(F.diubah_pada, true))} oleh ${esc(F.diubah_oleh || '-')}</div>` : ''}</div>
        </div>
      </div>
      <div class="stickybar"><span class="st-l" id="dirty"><i></i> Tersimpan</span><div class="sp"><button class="btn btn-secondary" id="batal">Batal</button><button class="btn btn-primary" id="simpan">${icon('check')} ${baru ? 'Tambah Aplikasi' : 'Simpan Perubahan'}</button></div></div>`;
    ikat();
  }
  render();

  function tandaiKotor() { kotor = true; const d = $('#dirty'); if (d) { d.classList.add('dirty'); d.innerHTML = '<i></i> Perubahan belum disimpan'; } }
  function ikat() {
    $('#fnama').value = F.nama;
    const cn = () => { $('#cn').textContent = $('#fsingkat').value.length + '/150'; };
    cn(); $('#fsingkat').addEventListener('input', cn);
    $$('input,select,textarea', el).forEach((i) => i.addEventListener('input', tandaiKotor));

    // Markdown mini toolbar
    const md_ = $('#fdesk');
    const pv = () => { $('#fdesk-pv').innerHTML = md(md_.value) || '<span class="muted t-sm">Pratinjau akan tampil di sini...</span>'; };
    pv(); md_.addEventListener('input', pv);
    on(el, 'click', '[data-md]', (e, t) => {
      const wrap = { b: ['**', '**'], i: ['*', '*'], h: ['## ', ''], l: ['- ', ''], k: ['`', '`'] }[t.dataset.md];
      const s = md_.selectionStart, en = md_.selectionEnd, v = md_.value;
      md_.value = v.slice(0, s) + wrap[0] + v.slice(s, en) + wrap[1] + v.slice(en);
      md_.focus(); md_.selectionStart = s + wrap[0].length; md_.selectionEnd = en + wrap[0].length; pv(); tandaiKotor();
    });

    // Tags
    function gambarTag() { $('#tagwrap').innerHTML = F.teknologi.map((t, i) => `<span class="tag">${esc(t)}<button type="button" data-rmtag="${i}">${icon('x')}</button></span>`).join('') + '<input id="taginput" placeholder="Ketik lalu Enter">'; $('#taginput').addEventListener('keydown', tagKey); }
    function tagKey(e) { if ((e.key === 'Enter' || e.key === ',') && e.target.value.trim()) { e.preventDefault(); if (F.teknologi.length < 12) F.teknologi.push(e.target.value.trim().slice(0, 30)); e.target.value = ''; gambarTag(); tandaiKotor(); } else if (e.key === 'Backspace' && !e.target.value && F.teknologi.length) { F.teknologi.pop(); gambarTag(); tandaiKotor(); } }
    $('#taginput').addEventListener('keydown', tagKey);
    on(el, 'click', '[data-rmtag]', (e, t) => { F.teknologi.splice(+t.dataset.rmtag, 1); gambarTag(); tandaiKotor(); });

    // Fitur & langkah (list dinamis)
    function gambarFitur() { $('#fitwrap').innerHTML = F.fitur.map((f, i) => `<div class="rep"><span class="lbl-mono" style="padding-top:8px">#${i + 1}</span><div class="rc"><input class="input" placeholder="Judul fitur" data-fit-j="${i}" value="${esc(f.judul)}"><textarea class="textarea" rows="2" placeholder="Deskripsi singkat" data-fit-d="${i}">${esc(f.deskripsi)}</textarea></div><button class="btn btn-ghost btn-sm btn-icon" data-rmfit="${i}">${icon('trash')}</button></div>`).join(''); }
    gambarFitur();
    $('#addfit').addEventListener('click', () => { if (F.fitur.length >= 8) return toast('Maksimal 8 fitur.', 'warn'); F.fitur.push({ judul: '', deskripsi: '' }); gambarFitur(); tandaiKotor(); });
    on(el, 'input', '[data-fit-j]', (e, t) => { F.fitur[+t.dataset.fitJ].judul = t.value; });
    on(el, 'input', '[data-fit-d]', (e, t) => { F.fitur[+t.dataset.fitD].deskripsi = t.value; });
    on(el, 'click', '[data-rmfit]', (e, t) => { F.fitur.splice(+t.dataset.rmfit, 1); gambarFitur(); tandaiKotor(); });

    function gambarLangkah() { $('#lkwrap').innerHTML = F.langkah.map((l, i) => `<div class="rep"><span class="lbl-mono" style="padding-top:8px">${i + 1}</span><div class="rc"><input class="input" placeholder="Judul langkah" data-lk-j="${i}" value="${esc(l.judul)}"><div style="display:flex;gap:8px"><textarea class="textarea" rows="2" placeholder="Deskripsi" data-lk-d="${i}" style="flex:1">${esc(l.deskripsi)}</textarea><input class="input mono" placeholder="Durasi" data-lk-t="${i}" style="width:90px" value="${esc(l.durasi || '')}"></div></div><button class="btn btn-ghost btn-sm btn-icon" data-rmlk="${i}">${icon('trash')}</button></div>`).join(''); }
    gambarLangkah();
    $('#addlk').addEventListener('click', () => { if (F.langkah.length >= 8) return toast('Maksimal 8 langkah.', 'warn'); F.langkah.push({ judul: '', deskripsi: '', durasi: '' }); gambarLangkah(); tandaiKotor(); });
    on(el, 'input', '[data-lk-j]', (e, t) => { F.langkah[+t.dataset.lkJ].judul = t.value; });
    on(el, 'input', '[data-lk-d]', (e, t) => { F.langkah[+t.dataset.lkD].deskripsi = t.value; });
    on(el, 'input', '[data-lk-t]', (e, t) => { F.langkah[+t.dataset.lkT].durasi = t.value; });
    on(el, 'click', '[data-rmlk]', (e, t) => { F.langkah.splice(+t.dataset.rmlk, 1); gambarLangkah(); tandaiKotor(); });

    // Media
    function gambarThumb() { $('#thumbbox').innerHTML = (F.thumb ? `<img alt="" src="${esc(driveThumb(F.thumb, 700))}">` : `<div style="height:100%;display:grid;place-items:center;color:var(--faint)">${icon('image')}</div>`) + `<div class="tb-bar"><span>${F.thumb ? 'Thumbnail tersimpan' : 'Belum ada thumbnail'}</span><span style="display:flex;gap:6px"><button class="btn btn-secondary btn-sm" type="button" id="gantithumb">${icon('upload-cloud')} ${F.thumb ? 'Ganti' : 'Unggah'} Gambar</button></span></div>`; $('#gantithumb').addEventListener('click', () => $('#thumbinput').click()); }
    gambarThumb();
    bindUploadTombol($('#thumbinput'), async (file) => {
      try { const g = await siapkanGambar(file, { maxSisi: 1280, kualitas: 0.85, webp: true }); const r = await ambil('adminUploadMedia', { jenis: 'thumbnail', nama: g.nama, mime: g.mime, base64: g.base64 }); F.thumb = r.id; gambarThumb(); tandaiKotor(); toast('Thumbnail terunggah.', 'ok', 2000); }
      catch (e) { toast(e.message, 'err'); }
    });
    function gambarGaleri() { $('#galwrap').innerHTML = F.galeri.map((g, i) => `<div class="gi"><img alt="" src="${esc(driveThumb(g.id, 300))}"><input class="input" placeholder="Label foto" data-gal-l="${i}" value="${esc(g.label || '')}"><button class="x" type="button" data-rmgal="${i}" aria-label="Hapus">${icon('x')}</button></div>`).join(''); $('#addgal').disabled = F.galeri.length >= 5; }
    gambarGaleri();
    $('#addgal').addEventListener('click', () => $('#galinput').click());
    on(el, 'input', '[data-gal-l]', (e, t) => { F.galeri[+t.dataset.galL].label = t.value; });
    on(el, 'click', '[data-rmgal]', (e, t) => { F.galeri.splice(+t.dataset.rmgal, 1); gambarGaleri(); tandaiKotor(); });
    $('#galinput').addEventListener('change', async (e) => {
      const files = Array.from(e.target.files).slice(0, 5 - F.galeri.length); e.target.value = '';
      for (const file of files) {
        try { const g = await siapkanGambar(file, { maxSisi: 1280, kualitas: 0.82, webp: true }); const r = await ambil('adminUploadMedia', { jenis: 'galeri', nama: g.nama, mime: g.mime, base64: g.base64 }); F.galeri.push({ id: r.id, label: '' }); }
        catch (e2) { toast(e2.message, 'err'); }
      }
      gambarGaleri(); tandaiKotor();
    });
  }
  function bindUploadTombol(input, onFile) { input.addEventListener('change', () => { if (input.files[0]) onFile(input.files[0]); input.value = ''; }); }

  window.addEventListener('beforeunload', bewareUnload);
  function bewareUnload(e) { if (kotor) { e.preventDefault(); e.returnValue = ''; } }
  function bersih() { kotor = false; window.removeEventListener('beforeunload', bewareUnload); }

  $('#batal').addEventListener('click', async () => { if (kotor && !(await konfirmasi('Buang perubahan?', 'Perubahan yang belum disimpan akan hilang.', { ok: 'Ya, Buang', bahaya: true }))) return; bersih(); location.hash = '#/admin/aplikasi'; });
  $('#simpan').addEventListener('click', async () => {
    const nama = $('#fnama').value.trim(), singkat = $('#fsingkat').value.trim(), kategori = $('#fkat').value.trim(), harga = $('#fharga').value;
    if (nama.length < 3) { toast('Nama aplikasi minimal 3 karakter.', 'warn'); $('#fnama').focus(); return; }
    if (!kategori) { toast('Kategori wajib diisi.', 'warn'); $('#fkat').focus(); return; }
    if (!singkat) { toast('Deskripsi singkat wajib diisi.', 'warn'); $('#fsingkat').focus(); return; }
    if (harga === '' || +harga < 0) { toast('Harga tidak valid.', 'warn'); $('#fharga').focus(); return; }
    const btn = $('#simpan'); tombolBusy(btn, true, 'Menyimpan...');
    const payload = {
      id: baru ? undefined : F.id, nama, kategori, harga: +harga, harga_coret: $('#fcoret').value ? +$('#fcoret').value : 0,
      status: $('#fstatus').value, versi: $('#fver').value.trim(), tanggal_rilis: $('#ftgl').value, urutan: +$('#furut').value || 999,
      teknologi: F.teknologi, lisensi: $('#flisensi').value.trim(), tampil_publik: $('#ftampil').checked,
      thumb: F.thumb, galeri: F.galeri, video_penggunaan: $('#fvidp').value.trim(), video_instalasi: $('#fvidi').value.trim(),
      link_demo: $('#fdemo').value.trim(), link_akses_privat: $('#fakses').value.trim(), catatan_email: $('#fcatatan').value.trim(),
      deskripsi_singkat: singkat, deskripsi_lengkap: $('#fdesk').value, fitur: F.fitur.filter((f) => f.judul.trim()),
      persyaratan: $('#fsyarat').value, langkah: F.langkah.filter((l) => l.judul.trim())
    };
    try {
      const r = await ambil('adminSaveApp', payload);
      toast(r.pesan, 'ok');
      bersih();
      bersihkanCachePublik();
      Adm.apps = null;
      location.hash = '#/admin/aplikasi';
      jalankan();
    } catch (e) {
      toast(e.message, 'err', 6000);
    } finally {
      tombolBusy(btn, false);
    }
  });
}

// ============================================================
// MODERASI TESTIMONI
// ============================================================
const AdmT = { tab: 'Menunggu', q: '' };
async function admTestimoni(c) {
  const el = c.el;
  el.innerHTML = skelAdmin(3);
  const tes = await muatTestimoni(true);
  if (c.batal()) return;
  el.innerHTML = `<div class="page-h"><div><div class="eyebrow">Moderasi Ulasan</div><h1 class="h-lg" style="margin-top:4px">Moderasi Testimoni &amp; Ulasan Pembeli</h1><p>Tinjau testimoni dari pembeli terverifikasi sebelum dipublikasikan ke halaman etalase publik.</p></div></div>
    <div class="stats stats-c3" style="grid-template-columns:repeat(3,minmax(0,1fr))">
      <div class="card stat" style="border-left:3px solid var(--warn)"><div class="lbl-mono">Menunggu Moderasi</div><div class="sv">${tes.filter((t) => t.status === 'Menunggu').length}<small>ulasan</small></div></div>
      <div class="card stat" style="border-left:3px solid var(--ok)"><div class="lbl-mono">Disetujui &amp; Tampil</div><div class="sv">${tes.filter((t) => t.status === 'Disetujui').length}<small>publik</small></div></div>
      <div class="card stat" style="border-left:3px solid var(--line-2)"><div class="lbl-mono">Ditolak / Disembunyikan</div><div class="sv">${tes.filter((t) => t.status === 'Ditolak' || t.status === 'Disembunyikan').length}<small>arsip</small></div></div></div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:16px"><div id="tabs"></div><div class="ig" style="flex:1;min-width:220px;max-width:340px;margin-left:auto">${icon('search')}<input class="input" id="q" placeholder="Cari pembeli / aplikasi..." value="${esc(AdmT.q)}"></div></div>
    <div id="list"></div>`;
  function daftar() {
    const q = AdmT.q.trim().toLowerCase();
    return tes.filter((t) => t.status === AdmT.tab && (!q || (t.nama + t.aplikasi + t.isi).toLowerCase().indexOf(q) >= 0)).sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)));
  }
  function kartu(t) {
    const aksi = t.status === 'Menunggu'
      ? `<button class="btn btn-success btn-sm" data-aksi="setujui" data-id="${esc(t.id)}">${icon('check')} Setujui &amp; Publikasikan</button><button class="btn btn-danger-o btn-sm" data-aksi="tolak" data-id="${esc(t.id)}">${icon('x')} Tolak / Sembunyikan</button>`
      : t.status === 'Disetujui' ? `<button class="btn btn-secondary btn-sm" data-aksi="sembunyikan" data-id="${esc(t.id)}">${icon('eye-off')} Sembunyikan</button>`
        : `<button class="btn btn-secondary btn-sm" data-aksi="setujui" data-id="${esc(t.id)}">${icon('check')} Publikasikan Kembali</button>`;
    return `<div class="card mod-card ${t.status === 'Disetujui' ? 'done' : t.status !== 'Menunggu' ? 'arsip' : ''}"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div style="display:flex;gap:12px"><span class="avatar" style="width:40px;height:40px">${t.foto ? `<img alt="" src="${esc(driveThumb(t.foto, 100))}">` : esc(inisial(t.nama))}</span><div><b>${esc(t.nama)}</b>${t.peran ? `<div class="hint">${esc(t.peran)}</div>` : ''}<div class="hint mono">${esc(t.kode)} • ${esc(t.email_pembeli)}</div></div></div><span class="muted t-sm">${esc(relatif(t.tanggal))}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:12px"><span class="tag">${icon('package')} ${esc(t.aplikasi)}</span>${bintang(t.rating, 16)}</div>
      <p class="quote">“${esc(t.isi)}”</p>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div style="display:flex;gap:8px">${aksi}</div>${t.email_pembeli ? `<a class="btn btn-ghost btn-sm" href="mailto:${esc(t.email_pembeli)}">${icon('mail')} Hubungi Pembeli</a>` : ''}</div></div>`;
  }
  function gambar() {
    const n = (s) => tes.filter((t) => t.status === s).length;
    $('#tabs', el).innerHTML = `<div class="tabs seg-t">${[['Menunggu', 'Menunggu Moderasi'], ['Disetujui', 'Disetujui'], ['Ditolak', 'Ditolak / Disembunyikan']].map((t) => `<button class="${AdmT.tab === t[0] ? 'on' : ''}" data-tab="${t[0]}">${t[1]} <span class="n ${t[0] === 'Menunggu' && n('Menunggu') ? 'hot' : ''}">${t[0] === 'Ditolak' ? n('Ditolak') + n('Disembunyikan') : n(t[0])}</span></button>`).join('')}</div>`;
    const d = daftar();
    $('#list').innerHTML = d.length ? d.map(kartu).join('') : `<div class="card empty"><div class="em-ic">${icon('message-square')}</div><h3>Tidak ada testimoni pada tab ini</h3></div>`;
  }
  gambar();
  $('#q').addEventListener('input', debounce((e) => { AdmT.q = e.target.value; gambar(); }, 200));
  on(el, 'click', '[data-tab]', (e, t) => { AdmT.tab = t.dataset.tab; gambar(); });
  on(el, 'click', '[data-aksi]', async (e, t) => {
    const item = tes.find((x) => x.id === t.dataset.id);
    if (t.dataset.aksi === 'tolak' && !(await konfirmasi('Tolak testimoni ini?', 'Testimoni tidak akan tampil di halaman publik.', { ok: 'Ya, Tolak', bahaya: true }))) return;
    tombolBusy(t, true);
    try {
      await ambil('adminModerateTestimonial', { id: item.id, aksi: t.dataset.aksi });
      item.status = { setujui: 'Disetujui', tolak: 'Ditolak', sembunyikan: 'Disembunyikan' }[t.dataset.aksi];
      Adm.tes = tes.slice(); perbaruiBadge(); bersihkanCachePublik(); S.detail = {};
      toast('Testimoni diperbarui.', 'ok', 2000); gambar();
    } catch (err) { toast(err.message, 'err'); tombolBusy(t, false); }
  });
}

// ============================================================
// PENGATURAN SISTEM
// ============================================================
const TAB_VAR = ['kode_pesanan', 'nama_pembeli', 'email_pembeli', 'nama_aplikasi', 'versi', 'total_nominal', 'link_status', 'link_akses_privat', 'link_video_tutorial', 'token_lisensi', 'alasan_penolakan', 'wa_pembeli', 'link_admin', 'rating', 'isi_testimoni', 'nama_toko', 'whatsapp', 'sla'];
const AdmP = { tab: 'rekening', tpl: '1' };
async function admPengaturan(c) {
  const el = c.el;
  el.innerHTML = skelAdmin(0) + '<div class="card card-p"><div class="skel" style="height:320px"></div></div>';
  const d = await ambil('adminGetSettings');
  if (c.batal()) return;
  Adm.setting = d;
  const V = Object.assign({}, d.nilai);
  let faq = await ambil('adminGetFaq');
  if (c.batal()) return;
  let kotor = false;
  const tandai = () => { kotor = true; const s = $('#dirty'); if (s) { s.classList.add('dirty'); s.innerHTML = '<i></i> Perubahan belum disimpan'; } };

  el.innerHTML = `<div class="page-h"><div><div class="eyebrow">Konfigurasi</div><h1 class="h-lg" style="margin-top:4px">Pengaturan Toko &amp; Sistem</h1><p>Atur rekening tujuan transfer, kontak developer, FAQ publik, serta template email otomatis.</p></div></div>
    <div class="row c3" style="margin-bottom:24px">
      <div class="card int-card"><span class="iic">${icon('landmark')}</span><div><div class="lbl-mono">Metode Pembayaran</div><b>${esc(V.bank_nama)}</b></div></div>
      <div class="card int-card"><span class="iic">${icon('mail')}</span><div><div class="lbl-mono">Kuota Email Harian</div><b>${d.integrasi.kuota_email_sisa === null ? '-' : d.integrasi.kuota_email_sisa + ' tersisa'}</b></div></div>
      <div class="card int-card"><span class="iic">${icon('database')}</span><div><div class="lbl-mono">Login Admin</div><b class="mono t-sm">${esc(d.integrasi.email_login || '-')}</b></div></div></div>
    <div class="tabs" id="tabs"></div>
    <div id="panel" style="padding-top:20px"></div>
    <div class="stickybar"><span class="st-l" id="dirty"><i></i> Tersimpan</span><div class="sp"><button class="btn btn-secondary" id="uji-email">${icon('mail')} Kirim Email Uji</button><button class="btn btn-primary" id="simpan">${icon('check')} Simpan Pengaturan</button></div></div>`;

  const TABS = [
    ['rekening', 'Rekening Bank', 'landmark'],
    ['kupon', 'Kupon Promo', 'percent'],
    ['kontak', 'Kontak &amp; Bantuan', 'message-circle'],
    ['halaman', 'Konten Halaman', 'layers'],
    ['faq', 'FAQ', 'help-circle'],
    ['email', 'Template Email', 'mail'],
    ['integrasi', 'Integrasi &amp; Akun', 'database']
  ];
  $('#tabs').innerHTML = TABS.map((t) => `<button class="${AdmP.tab === t[0] ? 'on' : ''}" data-ptab="${t[0]}">${icon(t[2])} ${t[1]}</button>`).join('');

  let kuponList = ambilDaftarKupon(V);
  if (!kuponList.length && V.kupon_promo === undefined) {
    kuponList = [
      { kode: 'DISKON10', tipe: 'persen', nilai: 10, min: 0, maks: 50000, ket: 'Diskon 10% (Maksimal Rp 50.000)', aktif: true }
    ];
    V.kupon_promo = JSON.stringify(kuponList);
  }

  function inp(k, label, opsi) {
    opsi = opsi || {};
    return `<div class="field"><label for="p_${k}">${label}</label>${opsi.area ? `<textarea class="textarea" id="p_${k}" rows="${opsi.rows || 3}" maxlength="${opsi.maks || 1000}">${esc(V[k] || '')}</textarea>` : `<input class="input ${opsi.mono ? 'mono' : ''}" id="p_${k}" maxlength="${opsi.maks || 200}" placeholder="${esc(opsi.ph || '')}" value="${esc(V[k] || '')}">`}${d.keterangan[k] ? `<div class="hint">${esc(d.keterangan[k])}</div>` : ''}</div>`;
  }
  function panelRekening() {
    return `<div class="row" style="grid-template-columns:1.3fr 1fr;align-items:start"><div class="card card-p">
      ${inp('bank_nama', 'Nama Institusi Bank')}<div class="row c2">${inp('bank_nomor', 'Nomor Rekening', { mono: true })}${inp('bank_cabang', 'Kode Bank / Cabang (opsional)')}</div>
      ${inp('bank_atas_nama', 'Nama Pemilik Rekening')}${inp('catatan_transfer', 'Catatan Instruksi Transfer untuk Pembeli', { area: true, maks: 400 })}</div>
      <div class="bank-card"><small>Rekening Penampung Toko</small><div class="bn">${esc(V.bank_nama || '-')}</div><small>Nomor Rekening</small><div class="no">${esc(V.bank_nomor || '-')}</div><small>Atas Nama</small><div class="an">${esc(V.bank_atas_nama || '-')}</div></div></div>`;
  }
  function panelKupon() {
    return `<div class="card card-p">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px">
        <div><h2 class="h-md">Kode Promo &amp; Kupon Diskon</h2><p class="muted t-sm" style="margin-top:2px">Kelola voucher promo belanja untuk strategi pemasaran dan diskon calon pembeli.</p></div>
        <button class="btn btn-primary btn-sm" type="button" id="addkupon">${icon('plus')} Tambah Kupon Baru</button>
      </div>
      <div id="kuponwrap" style="display:flex;flex-direction:column;gap:10px"></div>
    </div>`;
  }
  function gambarKupon() {
    const wrap = $('#kuponwrap');
    if (!wrap) return;
    if (!kuponList.length) {
      wrap.innerHTML = `<div class="empty" style="padding:24px"><div class="em-ic">${icon('percent')}</div><h3>Belum ada kupon diskon</h3><p>Klik tombol "Tambah Kupon Baru" untuk membuat voucher promo pertama Anda.</p></div>`;
      return;
    }
    wrap.innerHTML = kuponList.map((k, i) => `
      <div class="kupon-card">
        <div style="display:flex;flex-direction:column;gap:4px">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span class="kupon-code">${icon('tag')} ${esc(k.kode)}</span>
            <span class="pill ${k.aktif ? 'pill-ok' : 'pill-mute'} nodot">${k.aktif ? 'Aktif' : 'Nonaktif'}</span>
          </div>
          <div style="font-size:14px;font-weight:600;color:var(--ink);margin-top:2px">
            ${k.tipe === 'persen' ? `Potongan ${k.nilai}% ${k.maks ? '(Maks. ' + rupiah(k.maks) + ')' : ''}` : `Potongan ${rupiah(k.nilai)}`}
            ${k.min ? `<span class="muted t-sm" style="font-weight:400">• Min. Belanja ${rupiah(k.min)}</span>` : '<span class="muted t-sm" style="font-weight:400">• Tanpa Min. Belanja</span>'}
          </div>
          ${k.ket ? `<div class="muted t-sm">${esc(k.ket)}</div>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <label class="switch" title="${k.aktif ? 'Nonaktifkan' : 'Aktifkan'}">
            <input type="checkbox" data-tgl-kupon="${i}" ${k.aktif ? 'checked' : ''}>
          </label>
          <button class="btn btn-secondary btn-sm" type="button" data-edit-kupon="${i}">${icon('pencil')} Edit</button>
          <button class="btn btn-ghost btn-sm btn-icon" type="button" data-rm-kupon="${i}" aria-label="Hapus">${icon('trash')}</button>
        </div>
      </div>
    `).join('');
  }
  async function modalKupon(data, idx) {
    const isEdit = typeof idx === 'number';
    const init = data || { kode: '', tipe: 'persen', nilai: 10, min: 0, maks: 0, ket: '', aktif: true };
    const res = await modal(`
      <h3>${isEdit ? 'Edit Kupon Promo' : 'Tambah Kupon Promo Baru'}</h3>
      <div class="field" style="margin-top:12px">
        <label>Kode Kupon <span class="req">*</span></label>
        <input class="input mono" id="m_kode" maxlength="25" placeholder="Contoh: DISKON10" style="text-transform:uppercase" value="${esc(init.kode)}">
        <div class="hint">Huruf kapital &amp; angka tanpa spasi (misal: LAUNCHING, DISKON20).</div>
      </div>
      <div class="row c2">
        <div class="field">
          <label>Tipe Diskon</label>
          <select class="select" id="m_tipe">
            <option value="persen" ${init.tipe === 'persen' ? 'selected' : ''}>Persentase (%)</option>
            <option value="nominal" ${init.tipe === 'nominal' ? 'selected' : ''}>Nominal Tetap (Rp)</option>
          </select>
        </div>
        <div class="field">
          <label>Besar Diskon <span class="req">*</span></label>
          <input class="input mono" id="m_nilai" type="number" min="1" placeholder="Misal: 10 atau 25000" value="${init.nilai || ''}">
        </div>
      </div>
      <div class="row c2">
        <div class="field">
          <label>Minimal Belanja <span class="opt">(0 jika tanpa minimum)</span></label>
          <input class="input mono" id="m_min" type="number" min="0" placeholder="0" value="${init.min || 0}">
        </div>
        <div class="field" id="m_maks_field">
          <label>Maksimal Potongan <span class="opt">(opsional untuk %)</span></label>
          <input class="input mono" id="m_maks" type="number" min="0" placeholder="0" value="${init.maks || 0}">
        </div>
      </div>
      <div class="field">
        <label>Keterangan / Catatan Singkat <span class="opt">(opsional)</span></label>
        <input class="input" id="m_ket" maxlength="150" placeholder="Contoh: Promo khusus peluncuran produk" value="${esc(init.ket || '')}">
      </div>
      <label class="check" style="margin:12px 0 16px">
        <input type="checkbox" id="m_aktif" ${init.aktif ? 'checked' : ''}>
        <span>Kupon aktif dan siap digunakan pembeli di checkout</span>
      </label>
      <div class="act">
        <button class="btn btn-secondary" data-m="no">Batal</button>
        <button class="btn btn-primary" data-m="ok">Simpan Kupon</button>
      </div>
    `, {
      ambil: (m) => {
        const kode = $('#m_kode', m).value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        const tipe = $('#m_tipe', m).value;
        const nilai = +$('#m_nilai', m).value;
        const min = +$('#m_min', m).value || 0;
        const maks = +$('#m_maks', m).value || 0;
        const ket = $('#m_ket', m).value.trim();
        const aktif = $('#m_aktif', m).checked;
        if (!kode || kode.length < 3) {
          toast('Kode kupon minimal 3 karakter.', 'warn');
          return false;
        }
        if (!nilai || nilai <= 0) {
          toast('Besar diskon harus lebih dari 0.', 'warn');
          return false;
        }
        if (tipe === 'persen' && nilai > 100) {
          toast('Diskon persentase tidak boleh lebih dari 100%.', 'warn');
          return false;
        }
        return { kode, tipe, nilai, min, maks, ket, aktif };
      }
    });
    if (!res) return;
    if (isEdit) {
      kuponList[idx] = res;
    } else {
      kuponList.push(res);
    }
    V.kupon_promo = JSON.stringify(kuponList);
    tandai();
    gambarKupon();
    toast('Kupon berhasil disimpan.', 'ok');
  }

  function panelKontak() {
    return `<div class="card card-p"><div class="row c2">${inp('email_admin', 'Email Kontak Publik &amp; Notifikasi')}${inp('whatsapp', 'Nomor WhatsApp', { ph: '+62 812-3456-7890' })}</div>
      <div class="row c2">${inp('jam_layanan', 'Jam Layanan')}${inp('kota', 'Kota')}</div>${inp('url_situs', 'Alamat Situs GitHub Pages', { mono: true, maks: 300, ph: 'https://username.github.io/katalog-aplikasi-web/' })}
      <div class="note-i">${icon('info')}<div>Alamat situs dipakai untuk menyusun tautan "Cek Status Pesanan" pada email otomatis. Isi persis sesuai URL GitHub Pages Anda, diakhiri tanda "/".</div></div></div>`;
  }
  function panelHalaman() {
    return `<div class="card card-p"><div class="sec-title" style="margin-bottom:12px">Beranda</div>${inp('nama_toko', 'Nama Toko / Brand')}${inp('tagline', 'Tagline (footer)', { maks: 200 })}${inp('hero_lencana', 'Lencana Kecil di Atas Judul')}${inp('hero_judul', 'Judul Besar Beranda', { maks: 150 })}${inp('hero_subjudul', 'Subjudul Beranda', { area: true, maks: 300 })}<div class="row c2">${inp('hero_trust_2', 'Poin Kepercayaan #2')}${inp('hero_trust_3', 'Poin Kepercayaan #3')}</div>${inp('sla_verifikasi', 'Estimasi Waktu Verifikasi', { ph: '1×24 jam' })}</div>
      <div class="card card-p" style="margin-top:16px"><div class="sec-title" style="margin-bottom:12px">Halaman Bantuan</div>${inp('garansi_judul', 'Judul Blok Garansi')}${inp('garansi_teks', 'Isi Blok Garansi', { area: true, maks: 300 })}<div class="row c3">${inp('garansi_stat_1', 'Statistik 1 (angka|label)')}${inp('garansi_stat_2', 'Statistik 2')}${inp('garansi_stat_3', 'Statistik 3')}</div></div>
      <div class="card card-p" style="margin-top:16px"><div class="sec-title" style="margin-bottom:12px">Halaman Pemesanan</div>${inp('garansi_order_judul', 'Judul Kartu Garansi')}${inp('garansi_order_teks', 'Isi Kartu Garansi', { area: true, maks: 200 })}</div>`;
  }
  function panelFaq() {
    return `<div class="card card-p"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><p class="muted t-sm" style="margin:0">Susun pertanyaan yang tampil di halaman Bantuan publik.</p><button class="btn btn-secondary btn-sm" id="addfaq">${icon('plus')} Tambah FAQ</button></div><div id="faqwrap"></div></div>`;
  }
  function gambarFaq() {
    $('#faqwrap').innerHTML = faq.length ? faq.map((f, i) => `<div class="faq-edit"><div style="display:flex;gap:8px;align-items:flex-start"><span class="lbl-mono" style="padding-top:10px">${icon('grip')}</span><div style="flex:1;display:grid;gap:8px"><input class="input" placeholder="Kategori" maxlength="80" data-faq-k="${i}" value="${esc(f.kategori)}"><input class="input" placeholder="Pertanyaan" maxlength="300" data-faq-q="${i}" value="${esc(f.pertanyaan)}"><textarea class="textarea" rows="2" placeholder="Jawaban" maxlength="3000" data-faq-a="${i}">${esc(f.jawaban)}</textarea></div><button class="btn btn-ghost btn-sm btn-icon" data-rmfaq="${i}">${icon('trash')}</button></div></div>`).join('') : `<div class="empty" style="padding:24px">Belum ada FAQ.</div>`;
  }
  function panelEmail() {
    return `<div class="row" style="grid-template-columns:1fr 1fr;align-items:start"><div class="card card-p">
      <select class="select" id="tplpilih">${[['1', 'Pesanan Diterima (ke Pembeli)'], ['2', 'Pembayaran Disetujui (ke Pembeli)'], ['3', 'Pembayaran Ditolak (ke Pembeli)'], ['4', 'Notifikasi Pesanan Baru (ke Admin)'], ['5', 'Notifikasi Testimoni Baru (ke Admin)']].map((t) => `<option value="${t[0]}" ${AdmP.tpl === t[0] ? 'selected' : ''}>${t[1]}</option>`).join('')}</select>
      <div class="field" style="margin-top:16px"><label for="tsubj">Subjek Email</label><input class="input" id="tsubj"></div>
      <div class="vars">${TAB_VAR.map((v) => `<button type="button" data-var="{${v}}">{${v}}</button>`).join('')}</div>
      <div class="field" style="margin-bottom:8px"><label for="tbody">Isi Pesan</label><textarea class="textarea" id="tbody" rows="12"></textarea></div>
      <button class="btn btn-ghost btn-sm" id="tplreset">${icon('refresh')} Kembalikan ke Bawaan</button></div>
      <div><div class="lbl-mono" style="margin-bottom:8px">Pratinjau Nyata (Live Preview)</div><div class="mailprev"><div class="mh"><div>Dari: <b>${esc(V.nama_toko)}</b></div><div>Kepada: <b>nama@email.com</b></div><div>Subjek: <b id="pv-subj"></b></div></div><div class="mb" id="pv-body"></div></div></div></div>`;
  }
  function panelIntegrasi() {
    return `<div class="row c2">
      <div class="card card-p"><div class="sec-title" style="margin-bottom:12px">${icon('database')} Google Sheets Database</div><a class="btn btn-secondary btn-block" href="${esc(d.integrasi.spreadsheet_url)}" target="_blank" rel="noopener noreferrer">${icon('external-link')} Buka Spreadsheet</a></div>
      <div class="card card-p"><div class="sec-title" style="margin-bottom:12px">${icon('folder')} Folder Google Drive</div><div style="display:flex;flex-direction:column;gap:8px">${d.integrasi.folder.map((f) => `<a class="btn btn-secondary btn-sm" style="justify-content:flex-start" href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">${icon('external-link')} ${esc(f.nama)}</a>`).join('')}</div></div>
      <div class="card card-p"><div class="sec-title" style="margin-bottom:12px">${icon('mail')} Kuota &amp; Pengiriman</div><div class="kv"><span>Sisa kuota email hari ini</span><span>${d.integrasi.kuota_email_sisa === null ? '-' : d.integrasi.kuota_email_sisa}</span></div><div class="kv"><span>Email login admin</span><span class="mono">${esc(d.integrasi.email_login || '-')}</span></div></div>
      <div class="card card-p"><div class="sec-title" style="margin-bottom:12px">${icon('key')} Kata Sandi Admin</div><button class="btn btn-secondary btn-block" id="ubahsandi">${icon('lock')} Ubah Kata Sandi</button></div></div>`;
  }
  function gambarPanel() {
    $('#tabs', el).innerHTML = TABS.map((t) => `<button class="${AdmP.tab === t[0] ? 'on' : ''}" data-ptab="${t[0]}">${icon(t[2])} ${t[1]}</button>`).join('');
    $('#panel').innerHTML = ({ rekening: panelRekening, kupon: panelKupon, kontak: panelKontak, halaman: panelHalaman, faq: panelFaq, email: panelEmail, integrasi: panelIntegrasi })[AdmP.tab]();
    $$('#panel input,#panel textarea,#panel select', el).forEach((i) => i.addEventListener('input', () => { simpanField(i); tandai(); }));
    if (AdmP.tab === 'kupon') {
      gambarKupon();
      const addBtn = $('#addkupon');
      if (addBtn) addBtn.addEventListener('click', () => modalKupon());
    }
    if (AdmP.tab === 'faq') { gambarFaq(); $('#addfaq').addEventListener('click', () => { faq.push({ kategori: 'Umum', pertanyaan: '', jawaban: '' }); gambarFaq(); tandai(); }); }
    if (AdmP.tab === 'email') ikatEmail();
    if (AdmP.tab === 'integrasi') { const b = $('#ubahsandi'); if (b) b.addEventListener('click', gantiSandiModal); }
  }
  function simpanField(input) { const k = input.id.replace(/^p_/, ''); if (k && k !== input.id) V[k] = input.value; }
  function muatTpl() {
    $('#tsubj').value = V['email_' + AdmP.tpl + '_subjek'] || ''; $('#tbody').value = V['email_' + AdmP.tpl + '_isi'] || ''; pratinjauEmail();
  }
  function pratinjauEmail() {
    const contoh = { kode_pesanan: 'ORD-20260924-001', nama_pembeli: 'Budi Santoso', email_pembeli: 'budi.santoso@gmail.com', nama_aplikasi: 'Sistem Manajemen Inventaris Toko', versi: '2.1', total_nominal: 'Rp 150.000', link_status: (V.url_situs || 'https://contoh.github.io/katalog/') + '#/status?kode=ORD-20260924-001', link_akses_privat: 'https://github.com/anda/repo-privat', link_video_tutorial: 'https://youtu.be/contoh', token_lisensi: 'LIC-2026-AB12-CD34', alasan_penolakan: 'Nominal transfer kurang Rp 5.000.', wa_pembeli: '0812-3456-7890', link_admin: '#/admin/pesanan', rating: '5/5', isi_testimoni: 'Sangat membantu operasional toko kami.', nama_toko: V.nama_toko, whatsapp: V.whatsapp, sla: V.sla_verifikasi };
    const isi = (s) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => (contoh[k] !== undefined ? contoh[k] : m));
    $('#pv-subj').textContent = isi($('#tsubj').value); $('#pv-body').textContent = isi($('#tbody').value);
  }
  function ikatEmail() {
    muatTpl();
    $('#tplpilih').addEventListener('change', (e) => { AdmP.tpl = e.target.value; muatTpl(); });
    $('#tsubj').addEventListener('input', pratinjauEmail); $('#tbody').addEventListener('input', pratinjauEmail);
    on(el, 'click', '[data-var]', (e, t) => { const ta = $('#tbody'); const s = ta.selectionStart; ta.value = ta.value.slice(0, s) + t.dataset.var + ta.value.slice(s); ta.focus(); ta.selectionStart = ta.selectionEnd = s + t.dataset.var.length; pratinjauEmail(); tandai(); });
    $('#tplreset').addEventListener('click', () => { const b = d.template_bawaan; $('#tsubj').value = b['email_' + AdmP.tpl + '_subjek']; $('#tbody').value = b['email_' + AdmP.tpl + '_isi']; pratinjauEmail(); tandai(); });
  }
  async function gantiSandiModal() {
    const v = await modal(`<h3>Ubah Kata Sandi Admin</h3><div class="field"><label>Kata Sandi Lama</label><input class="input" type="password" id="m_lama"></div><div class="field"><label>Kata Sandi Baru <span class="hint">(minimal 8 karakter)</span></label><input class="input" type="password" id="m_baru"></div><div class="act"><button class="btn btn-secondary" data-m="no">Batal</button><button class="btn btn-primary" data-m="ok">Simpan</button></div>`, { ambil: (m) => { const l = $('#m_lama', m).value, b = $('#m_baru', m).value; if (!l || b.length < 8) { toast('Isi kata sandi lama dan baru (minimal 8 karakter).', 'warn'); return false; } return { l, b }; } });
    if (!v) return;
    try { await ambil('adminChangePassword', { lama: v.l, baru: v.b }); toast('Kata sandi berhasil diubah.', 'ok'); } catch (e) { toast(e.message, 'err'); }
  }
  gambarPanel();
  on(el, 'click', '[data-ptab]', (e, t) => { AdmP.tab = t.dataset.ptab; gambarPanel(); });
  on(el, 'change', '[data-tgl-kupon]', (e, t) => {
    const idx = +t.dataset.tglKupon;
    if (kuponList[idx]) {
      kuponList[idx].aktif = t.checked;
      V.kupon_promo = JSON.stringify(kuponList);
      tandai();
      gambarKupon();
      toast(t.checked ? 'Kupon diaktifkan.' : 'Kupon dinonaktifkan.', 'info');
    }
  });
  on(el, 'click', '[data-edit-kupon]', (e, t) => {
    const idx = +t.dataset.editKupon;
    if (kuponList[idx]) modalKupon(kuponList[idx], idx);
  });
  on(el, 'click', '[data-rm-kupon]', async (e, t) => {
    const idx = +t.dataset.rmKupon;
    const item = kuponList[idx];
    if (!item) return;
    const ok = await konfirmasi('Hapus kupon ini?', 'Kupon <b>' + esc(item.kode) + '</b> akan dihapus.', { ok: 'Ya, Hapus', bahaya: true });
    if (!ok) return;
    kuponList.splice(idx, 1);
    V.kupon_promo = JSON.stringify(kuponList);
    tandai();
    gambarKupon();
    toast('Kupon dihapus.', 'ok');
  });
  on(el, 'input', '[data-faq-k]', (e, t) => { faq[+t.dataset.faqK].kategori = t.value; });
  on(el, 'input', '[data-faq-q]', (e, t) => { faq[+t.dataset.faqQ].pertanyaan = t.value; });
  on(el, 'input', '[data-faq-a]', (e, t) => { faq[+t.dataset.faqA].jawaban = t.value; });
  on(el, 'click', '[data-rmfaq]', (e, t) => { faq.splice(+t.dataset.rmfaq, 1); gambarFaq(); tandai(); });
  $('#uji-email').addEventListener('click', async (e) => { const b = e.currentTarget; tombolBusy(b, true, 'Mengirim...'); try { const r = await ambil('adminTestEmail'); toast(r.pesan, 'ok'); } catch (err) { toast(err.message, 'err'); } finally { tombolBusy(b, false); } });
  $('#simpan').addEventListener('click', async () => {
    const btn = $('#simpan'); tombolBusy(btn, true, 'Menyimpan...');
    try {
      await ambil('adminSaveSettings', { nilai: V });
      const faqBersih = faq.filter((f) => f.pertanyaan.trim() && f.jawaban.trim());
      await ambil('adminSaveFaq', { items: faqBersih });
      toast('Pengaturan berhasil disimpan.', 'ok'); kotor = false; $('#dirty').classList.remove('dirty'); $('#dirty').innerHTML = '<i></i> Tersimpan';
      bersihkanCachePublik(); S.pengaturan = Object.assign({}, S.pengaturan, V);
    } catch (e) { toast(e.message, 'err', 6000); } finally { tombolBusy(btn, false); }
  });
}
