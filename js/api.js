/* ============================================================
   api.js — komunikasi ke Google Apps Script (fetch + JSON)
   Semua permintaan tulis memakai POST "text/plain" supaya browser
   tidak mengirim preflight CORS (Apps Script tidak menjawabnya).

   Perbaikan v1.7:
   - Antrean permintaan (maks 3 paralel; prefetch latar belakang hanya
     jalan saat tidak ada permintaan lain) -> Apps Script tidak kewalahan.
   - Permintaan baca yang sama dan sedang berjalan digabung (tidak dobel).
   - Permintaan baca otomatis diulang bila server membalas 404/HTML
     sesaat (gejala Apps Script sibuk), bukan langsung tampil galat.
   ============================================================ */
class ApiError extends Error {
  constructor(message, code, extra) { super(message); this.code = code || 'ERROR'; this.extra = extra || {}; }
}

const Sesi = {
  kunci: 'kaw_admin_token',
  ambil() { try { return sessionStorage.getItem(this.kunci) || ''; } catch (e) { return ''; } },
  simpan(t, email) { try { sessionStorage.setItem(this.kunci, t); sessionStorage.setItem('kaw_admin_email', email || ''); } catch (e) { /* abaikan */ } },
  hapus() { try { sessionStorage.removeItem(this.kunci); sessionStorage.removeItem('kaw_admin_email'); } catch (e) { /* abaikan */ } },
  email() { try { return sessionStorage.getItem('kaw_admin_email') || ''; } catch (e) { return ''; } }
};

// Aksi POST yang hanya MEMBACA data (aman diulang & digabung). Aksi tulis TIDAK boleh diulang otomatis.
const AKSI_BACA = new Set([
  'adminGetDashboard', 'adminGetOrders', 'adminGetFile', 'adminGetApps', 'adminGetApp',
  'adminGetTestimonials', 'adminGetSettings', 'adminGetFaq', 'checkOrder', 'getReceipt', 'getReceiptPdf'
]);

// Antrean: prioritas normal dulu; prioritas rendah (prefetch) hanya saat benar-benar idle.
const Antrean = {
  maks: 3, jalan: 0, tinggi: [], rendah: [],
  tambah(fn, rendah) {
    const item = { fn, rendah: !!rendah };
    item.p = new Promise((res, rej) => { item.res = res; item.rej = rej; });
    (item.rendah ? this.rendah : this.tinggi).push(item);
    this._pompa();
    return item;
  },
  naikkan(item) {
    const i = this.rendah.indexOf(item);
    if (i >= 0) { this.rendah.splice(i, 1); item.rendah = false; this.tinggi.push(item); this._pompa(); }
  },
  _pompa() {
    while (this.jalan < this.maks) {
      let item = this.tinggi.shift();
      if (!item && this.jalan === 0) item = this.rendah.shift();
      if (!item) return;
      this.jalan++;
      item.fn().then(item.res, item.rej).finally(() => { this.jalan--; this._pompa(); });
    }
  }
};

const API = {
  _terbang: {},
  siap() {
    const u = String((window.APP_CONFIG && APP_CONFIG.GAS_URL) || '');
    return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec\/?$/.test(u) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(u);
  },
  async _kirim(url, init, timeout) {
    if (!this.siap()) throw new ApiError('Alamat Web App belum diisi. Buka js/config.js lalu isi GAS_URL.', 'CONFIG');
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout || 45000);
    let res;
    try { res = await fetch(url, Object.assign({ signal: ctrl.signal, redirect: 'follow' }, init)); }
    catch (e) {
      throw new ApiError(e.name === 'AbortError' ? 'Server terlalu lama menjawab. Coba lagi.' : 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', 'JARINGAN');
    } finally { clearTimeout(t); }
    let json;
    try { json = await res.json(); }
    catch (e) {
      if (res.status === 404) {
        throw new ApiError('Server Google (Apps Script) sedang sibuk dan mengembalikan HTTP 404. Biasanya sementara — coba lagi. Jika terus terjadi, pastikan GAS_URL di js/config.js adalah URL Deployment (/exec).', 'NOT_FOUND');
      }
      throw new ApiError('Respons server tidak valid' + (res.status ? ' (' + res.status + ')' : '') + '. Pastikan Web App di-deploy dengan akses "Anyone".', 'RESPONS');
    }
    if (!json.success) {
      if (json.code === 'AUTH') { Sesi.hapus(); if (location.hash.indexOf('#/admin') === 0 && location.hash !== '#/admin') { toast('Sesi admin berakhir. Silakan masuk lagi.', 'warn'); location.hash = '#/admin'; } }
      throw new ApiError(json.message || 'Permintaan gagal.', json.code, json);
    }
    return json.data;
  },
  // Ulangi hanya untuk galat sementara (jaringan / 404 / HTML sesaat) pada permintaan BACA.
  async _denganUlang(fn, bisaUlang) {
    const jeda = [700, 1600];
    for (let i = 0; ; i++) {
      try { return await fn(); }
      catch (e) {
        const sementara = e.code === 'JARINGAN' || e.code === 'NOT_FOUND' || e.code === 'RESPONS';
        if (!bisaUlang || !sementara || i >= jeda.length) throw e;
        await sleep(jeda[i]);
      }
    }
  },
  // Antre + gabungkan permintaan baca yang identik.
  _jadwal(kunci, fn, opsi) {
    opsi = opsi || {};
    if (kunci && this._terbang[kunci]) {
      const ada = this._terbang[kunci];
      if (!opsi.low) Antrean.naikkan(ada.item);
      return ada.item.p;
    }
    const item = Antrean.tambah(fn, opsi.low);
    if (kunci) {
      this._terbang[kunci] = { item };
      const bersih = () => { if (this._terbang[kunci] && this._terbang[kunci].item === item) delete this._terbang[kunci]; };
      item.p.then(bersih, bersih);
    }
    return item.p;
  },
  get(action, params, opsi) {
    const q = new URLSearchParams(Object.assign({ action }, params || {})).toString();
    const url = APP_CONFIG.GAS_URL + '?' + q;
    return this._jadwal('G|' + q, () => this._denganUlang(() => this._kirim(url, { cache: 'no-store' }, 30000), true), opsi);
  },
  post(action, data, opsi) {
    opsi = opsi || {};
    const body = { action, data: data || {} };
    if (opsi.admin) body.token = Sesi.ambil();
    const baca = AKSI_BACA.has(action);
    const kirim = () => this._kirim(APP_CONFIG.GAS_URL, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }, opsi.timeout || 60000);
    // Unggahan/berkas besar jangan digabung; aksi tulis tidak diulang otomatis.
    const kunci = baca && action !== 'adminGetFile' && action !== 'getReceiptPdf' ? 'P|' + action + '|' + JSON.stringify(data || {}) : '';
    return this._jadwal(kunci, () => this._denganUlang(kirim, baca), opsi);
  },
  admin(action, data, opsi) { return this.post(action, data, Object.assign({ admin: true }, opsi || {})); }
};