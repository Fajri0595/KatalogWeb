/* ============================================================
   api.js — komunikasi ke Google Apps Script (fetch + JSON)
   Semua permintaan tulis memakai POST "text/plain" supaya browser
   tidak mengirim preflight CORS (Apps Script tidak menjawabnya).
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

const API = {
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
    try { json = await res.json(); } catch (e) { throw new ApiError('Respons server tidak valid. Pastikan Web App di-deploy dengan akses "Anyone".', 'RESPONS'); }
    if (!json.success) {
      if (json.code === 'AUTH') { Sesi.hapus(); if (location.hash.indexOf('#/admin') === 0 && location.hash !== '#/admin') { toast('Sesi admin berakhir. Silakan masuk lagi.', 'warn'); location.hash = '#/admin'; } }
      throw new ApiError(json.message || 'Permintaan gagal.', json.code, json);
    }
    return json.data;
  },
  async get(action, params) {
    const q = new URLSearchParams(Object.assign({ action }, params || {})).toString();
    const url = APP_CONFIG.GAS_URL + '?' + q;
    try { return await this._kirim(url, { cache: 'no-store' }, 30000); }
    catch (e) { if (e.code === 'JARINGAN') { await sleep(800); return this._kirim(url, { cache: 'no-store' }, 30000); } throw e; }
  },
  async post(action, data, opsi) {
    opsi = opsi || {};
    const body = { action, data: data || {} };
    if (opsi.admin) body.token = Sesi.ambil();
    return this._kirim(APP_CONFIG.GAS_URL, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }, opsi.timeout || 60000);
  },
  admin(action, data, opsi) { return this.post(action, data, Object.assign({ admin: true }, opsi || {})); }
};
