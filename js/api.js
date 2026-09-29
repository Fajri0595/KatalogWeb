/* ============================================================
   api.js — Layanan Komunikasi Data Terintegrasi (Supabase & Vercel API)
   ============================================================ */

class ApiError extends Error {
  constructor(message, code, extra) {
    super(message);
    this.code = code || 'ERROR';
    this.extra = extra || {};
  }
}

// Inisialisasi Supabase Client
let _supabaseClient = null;
function getSupabase() {
  if (_supabaseClient) return _supabaseClient;
  if (!window.APP_CONFIG || !window.APP_CONFIG.SUPABASE_URL || window.APP_CONFIG.SUPABASE_URL.includes('GANTI-DENGAN')) {
    return null;
  }
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    _supabaseClient = supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
    return _supabaseClient;
  }
  return null;
}

const Sesi = {
  kunci: 'kaw_admin_token',
  ambil() { try { return sessionStorage.getItem(this.kunci) || ''; } catch (e) { return ''; } },
  simpan(t, email) {
    try {
      sessionStorage.setItem(this.kunci, t);
      sessionStorage.setItem('kaw_admin_email', email || '');
    } catch (e) {}
  },
  hapus() {
    try {
      sessionStorage.removeItem(this.kunci);
      sessionStorage.removeItem('kaw_admin_email');
    } catch (e) {}
  },
  email() { try { return sessionStorage.getItem('kaw_admin_email') || ''; } catch (e) { return ''; } }
};

const API = {
  siap() {
    const cfg = window.APP_CONFIG || {};
    return cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('GANTI-DENGAN');
  },

  async get(action, params) {
    if (!this.siap()) {
      throw new ApiError('Supabase belum dikonfigurasi. Buka js/config.js dan masukkan SUPABASE_URL serta ANON_KEY.', 'CONFIG');
    }
    const sb = getSupabase();
    if (!sb) throw new ApiError('Supabase JS SDK gagal dimuat. Periksa koneksi internet Anda.', 'JARINGAN');

    // Handler Query Cepat Langsung ke Supabase
    if (action === 'getBootstrap') {
      try {
        const [appRes, setRes] = await Promise.all([
          sb.from('aplikasi').select('*').order('created_at', { ascending: false }),
          sb.from('pengaturan').select('*')
        ]);

        const pengaturan = {
          nama_toko: (window.APP_CONFIG && APP_CONFIG.NAMA_DEFAULT) || 'Katalog Aplikasi Web',
          whatsapp: (window.APP_CONFIG && APP_CONFIG.WHATSAPP_DEFAULT) || '085655860383',
          hero_judul: 'Aplikasi Web Siap Pakai untuk Kebutuhan Anda',
          hero_subjudul: 'Koleksi aplikasi web berkualitas karya developer independen. Sumber kode penuh dan verifikasi pesanan terpercaya.'
        };

        if (setRes && setRes.data) {
          setRes.data.forEach(row => {
            if (row.kunci && row.nilai) pengaturan[row.kunci] = row.nilai;
          });
        }

        const rawApps = (appRes && appRes.data) ? appRes.data : [];
        const aplikasi = rawApps.map(a => Object.assign({}, a, {
          status: a.status || (a.is_aktif ? 'Tersedia' : 'Segera Hadir')
        }));

        return {
          aplikasi: aplikasi,
          pengaturan: pengaturan
        };
      } catch (err) {
        console.error('getBootstrap error:', err);
        return {
          aplikasi: [],
          pengaturan: {
            nama_toko: (window.APP_CONFIG && APP_CONFIG.NAMA_DEFAULT) || 'Katalog Aplikasi Web',
            whatsapp: (window.APP_CONFIG && APP_CONFIG.WHATSAPP_DEFAULT) || '085655860383'
          }
        };
      }
    }

    if (action === 'getCatalog') {
      const { data, error } = await sb.from('aplikasi').select('*').eq('is_aktif', true).order('created_at', { ascending: false });
      if (error) throw new ApiError(error.message, 'DB_ERROR');
      return data || [];
    }

    if (action === 'getApp') {
      const id = params && params.id;
      const { data, error } = await sb.from('aplikasi').select('*').eq('id', id).single();
      if (error) throw new ApiError(error.message || 'Aplikasi tidak ditemukan.', 'TIDAK_ADA');
      return data;
    }

    if (action === 'getFaq') {
      const { data, error } = await sb.from('faq').select('*').order('urutan', { ascending: true });
      if (error) throw new ApiError(error.message, 'DB_ERROR');
      return data || [];
    }

    if (action === 'getSettings') {
      const { data, error } = await sb.from('pengaturan').select('*');
      if (error) throw new ApiError(error.message, 'DB_ERROR');
      const hasil = {};
      (data || []).forEach(r => { hasil[r.kunci] = r.nilai; });
      return hasil;
    }

    // Default Fallback kirim ke Serverless Function Vercel
    return this._kirimApi(`/api/${action}`, 'GET', params);
  },

  async post(action, data) {
    if (!this.siap()) {
      throw new ApiError('Supabase belum dikonfigurasi. Buka js/config.js.', 'CONFIG');
    }
    const sb = getSupabase();

    // Logika upload bukti pembayaran ke Supabase Storage
    if (action === 'createOrder') {
      try {
        let buktiUrl = '';
        if (data.bukti && data.bukti.base64) {
          const mime = data.bukti.mime || 'image/jpeg';
          const ext = mime.split('/')[1] || 'jpg';
          const byteCharacters = atob(data.bukti.base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mime });

          const fileName = `bukti/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
          const bucket = (window.APP_CONFIG && APP_CONFIG.STORAGE_BUCKET) || 'media';
          const uploadRes = await sb.storage.from(bucket).upload(fileName, blob, { contentType: mime });
          
          if (!uploadRes.error) {
            const { data: pubData } = sb.storage.from(bucket).getPublicUrl(fileName);
            buktiUrl = pubData ? pubData.publicUrl : '';
          }
        }

        const kodePesanan = 'INV-' + Date.now().toString(36).toUpperCase();
        const payloadPesanan = {
          id: kodePesanan,
          nama_pemesan: data.nama,
          email: data.email,
          whatsapp: data.whatsapp || data.wa,
          aplikasi_id: data.id_aplikasi || data.aplikasi_id,
          total_harga: data.total || data.harga,
          status: 'MENUNGGU',
          bukti_transfer_url: buktiUrl,
          catatan: data.catatan || ''
        };

        const { error: insErr } = await sb.from('pesanan').insert([payloadPesanan]);
        if (insErr) throw new ApiError(insErr.message, 'ORDER_ERROR');

        // Picu notifikasi / email resi lewat Vercel Serverless (async)
        fetch('/api/notify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadPesanan)
        }).catch(() => {});

        return { kode: kodePesanan, pesanan: payloadPesanan };
      } catch (err) {
        throw new ApiError(err.message || 'Gagal membuat pesanan.', 'ORDER_ERROR');
      }
    }

    if (action === 'checkOrder') {
      const { data: order, error } = await sb.from('pesanan')
        .select('*, aplikasi(*)')
        .eq('id', data.kode)
        .eq('email', data.email)
        .single();
      if (error || !order) throw new ApiError('Pesanan tidak ditemukan atau data email tidak cocok.', 'NOT_FOUND');
      return order;
    }

    if (action === 'submitTestimonial') {
      const { error } = await sb.from('testimoni').insert([{
        nama: data.nama_tampil || data.nama,
        profesi: data.peran || '',
        rating: data.rating || 5,
        pesan: data.isi,
        is_aktif: true
      }]);
      if (error) throw new ApiError(error.message, 'DB_ERROR');
      return { success: true };
    }

    if (action === 'trackView') {
      return { success: true };
    }

    // Aksi admin atau lainnya diarahkan ke Vercel Serverless
    return this._kirimApi(`/api/${action}`, 'POST', data);
  },

  admin(action, data, opsi) {
    return this.post(action, data, Object.assign({ admin: true }, opsi || {}));
  },

  async _kirimApi(endpoint, method, payload) {
    try {
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Sesi.ambil()}`
        }
      };
      if (method === 'POST') {
        options.body = JSON.stringify(payload || {});
      }
      const res = await fetch(endpoint, options);
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new ApiError(json.message || 'Gagal memproses permintaan.', json.code || 'API_ERROR');
      }
      return json.data || json;
    } catch (e) {
      throw new ApiError(e.message || 'Terjadi kesalahan koneksi server.', 'JARINGAN');
    }
  }
};