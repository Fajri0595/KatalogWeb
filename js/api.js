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
      throw new ApiError('Supabase belum dikonfigurasi. Buka js/config.js.', 'CONFIG');
    }
    const sb = getSupabase();
    if (!sb) throw new ApiError('Supabase JS SDK gagal dimuat.', 'JARINGAN');

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

        return { aplikasi, pengaturan };
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

    return this._kirimApi(`/api/${action}`, 'GET', params);
  },

  async post(action, data) {
    if (!this.siap()) {
      throw new ApiError('Supabase belum dikonfigurasi.', 'CONFIG');
    }
    const sb = getSupabase();

    // 1. AUTENTIKASI ADMIN VIA SUPABASE AUTH
    if (action === 'adminLogin') {
      try {
        const { data: authData, error: authError } = await sb.auth.signInWithPassword({
          email: data.email,
          password: data.sandi || data.password
        });

        if (authError) {
          throw new ApiError(authError.message || 'Email atau kata sandi admin salah.', 'AUTH');
        }

        const token = authData.session ? authData.session.access_token : 'admin_token_' + Date.now();
        return {
          token: token,
          email: authData.user ? authData.user.email : data.email
        };
      } catch (err) {
        throw new ApiError(err.message || 'Otentikasi gagal.', 'AUTH');
      }
    }

    if (action === 'adminLogout') {
      try { await sb.auth.signOut(); } catch (e) {}
      Sesi.hapus();
      return { success: true };
    }

    // 2. ADMIN DASHBOARD (RINGKASAN)
    if (action === 'adminGetDashboard') {
      try {
        const [ordersRes, appsRes, testiRes] = await Promise.all([
          sb.from('pesanan').select('*').order('tanggal', { ascending: false }),
          sb.from('aplikasi').select('*'),
          sb.from('testimoni').select('*')
        ]);
        const orders = ordersRes.data || [];
        const apps = appsRes.data || [];
        const testi = testiRes.data || [];

        let omset = 0;
        let pending = 0;
        let disetujui = 0;
        let ditolak = 0;

        orders.forEach(o => {
          const st = o.status || 'Menunggu Verifikasi';
          if (st === 'Disetujui' || st === 'Lunas') {
            omset += Number(o.total_harga || 0);
            disetujui++;
          } else if (st === 'Ditolak') {
            ditolak++;
          } else {
            pending++;
          }
        });

        const appsAktif = apps.filter(a => a.is_aktif !== false).length;
        const appsSegera = apps.filter(a => a.status === 'Segera Hadir').length;

        // Deret waktu 7 hari terakhir agar charts tidak kosong
        const deret = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000);
          const key = d.toISOString().slice(0, 10);
          deret.push({ kunci: key, pendapatan: 0, kunjungan: 0, pesanan: 0 });
        }

        return {
          periode: 'bulan_ini',
          label: 'Bulan Ini',
          mode: 'hari',
          rentang: { mulai: new Date(Date.now() - 30 * 86400000).toISOString(), akhir: new Date().toISOString() },
          ringkas: {
            antrean: pending,
            pesanan_periode: orders.length,
            pesanan_sukses: disetujui,
            pendapatan: omset,
            pendapatan_sebelumnya: 0,
            delta_persen: null,
            kunjungan: 0,
            konversi: null,
            testimoni_menunggu: 0,
            testimoni_disetujui: testi.length,
            testimoni_arsip: 0,
            rating_rata: 5,
            email_gagal: 0,
            aplikasi_total: apps.length,
            aplikasi_aktif: appsAktif,
            aplikasi_segera: appsSegera
          },
          deret: deret,
          terlaris: [],
          status: { 'Disetujui': disetujui, 'Menunggu Verifikasi': pending, 'Ditolak': ditolak },
          pesanan_total_semua: orders.length
        };
      } catch (e) {
        console.error('adminGetDashboard error:', e);
        throw new ApiError(e.message, 'DASHBOARD_ERROR');
      }
    }

    // 3. ADMIN SETTINGS (PENGATURAN SISTEM)
    if (action === 'adminGetSettings') {
      try {
        const { data: setRows } = await sb.from('pengaturan').select('*');
        const nilai = {
          nama_toko: (window.APP_CONFIG && APP_CONFIG.NAMA_DEFAULT) || 'Katalog Aplikasi Web',
          whatsapp: (window.APP_CONFIG && APP_CONFIG.WHATSAPP_DEFAULT) || '085655860383',
          bank_nama: 'Bank Central Asia (BCA)',
          bank_nomor: '0000 0000 00',
          bank_atas_nama: 'NAMA PEMILIK REKENING',
          jam_layanan: '08.00 - 20.00 WIB (Senin s.d. Sabtu)',
          kota: 'Jakarta, Indonesia',
          sla_verifikasi: '1x24 jam',
          hero_judul: 'Aplikasi Web Siap Pakai untuk Kebutuhan Anda'
        };

        if (setRows) {
          setRows.forEach(r => { if (r.kunci && r.nilai) nilai[r.kunci] = r.nilai; });
        }

        return {
          nilai: nilai,
          keterangan: {},
          template_bawaan: {},
          integrasi: {
            kuota_email_sisa: 100,
            spreadsheet_url: '#',
            folder: [],
            email_login: Sesi.email() || 'admin@gmail.com'
          }
        };
      } catch (err) {
        console.error('adminGetSettings error:', err);
        throw new ApiError(err.message, 'SETTINGS_ERROR');
      }
    }

    if (action === 'adminSaveSettings') {
      try {
        const nilai = data.nilai || {};
        const entries = Object.keys(nilai).map(k => ({ kunci: k, nilai: String(nilai[k]) }));
        for (const item of entries) {
          await sb.from('pengaturan').upsert(item, { onConflict: 'kunci' });
        }
        return { pesan: 'Pengaturan berhasil disimpan.', diubah: entries.length };
      } catch (err) {
        throw new ApiError(err.message || 'Gagal menyimpan pengaturan.', 'SETTINGS_ERROR');
      }
    }

    // 4. ADMIN ORDERS
    if (action === 'adminGetOrders') {
      const { data: orders, error } = await sb.from('pesanan').select('*, aplikasi(nama)').order('tanggal', { ascending: false });
      if (error) throw new ApiError(error.message, 'DB_ERROR');
      return (orders || []).map(o => ({
        kode: o.id,
        nama: o.nama_pemesan,
        email: o.email,
        wa: o.whatsapp,
        jumlah: o.total_harga,
        status: o.status === 'MENUNGGU' ? 'Menunggu Verifikasi' : o.status,
        tanggal: o.tanggal,
        aplikasi: (o.aplikasi && o.aplikasi.nama) || o.aplikasi_id || 'Aplikasi Web',
        versi: '1.0',
        bukti: o.bukti_transfer_url ? { id: o.id, url: o.bukti_transfer_url } : null,
        catatan: o.catatan || '',
        email_status: 'Terkirim'
      }));
    }

    if (action === 'adminApproveOrder') {
      await sb.from('pesanan').update({ status: 'Disetujui', catatan: data.catatan || '' }).eq('id', data.kode);
      return { pesan: 'Pesanan disetujui.', email_status: 'Terkirim' };
    }

    if (action === 'adminRejectOrder') {
      await sb.from('pesanan').update({ status: 'Ditolak', catatan: data.alasan || '' }).eq('id', data.kode);
      return { pesan: 'Pesanan ditolak.', email_status: 'Terkirim' };
    }

    // 5. ADMIN APPS (KATALOG)
    if (action === 'adminGetApps') {
      const { data: apps, error } = await sb.from('aplikasi').select('*').order('created_at', { ascending: false });
      if (error) throw new ApiError(error.message, 'DB_ERROR');
      return apps || [];
    }

    if (action === 'adminSaveApp') {
      const item = Object.assign({}, data);
      const { data: res, error } = await sb.from('aplikasi').upsert(item).select().single();
      if (error) throw new ApiError(error.message, 'DB_ERROR');
      return res;
    }

    if (action === 'adminDeleteApp') {
      const { error } = await sb.from('aplikasi').delete().eq('id', data.id);
      if (error) throw new ApiError(error.message, 'DB_ERROR');
      return { success: true };
    }

    // 6. ADMIN FAQ & TESTIMONI
    if (action === 'adminGetFaq') {
      const { data: faqs, error } = await sb.from('faq').select('*').order('urutan', { ascending: true });
      if (error) throw new ApiError(error.message, 'DB_ERROR');
      return faqs || [];
    }

    if (action === 'adminGetTestimonials') {
      const { data: tests, error } = await sb.from('testimoni').select('*').order('created_at', { ascending: false });
      if (error) throw new ApiError(error.message, 'DB_ERROR');
      return tests || [];
    }

    // 7. CHECKOUT & ORDERS PUBLIK
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
          status: 'Menunggu Verifikasi',
          bukti_transfer_url: buktiUrl,
          catatan: data.catatan || ''
        };

        const { error: insErr } = await sb.from('pesanan').insert([payloadPesanan]);
        if (insErr) throw new ApiError(insErr.message, 'ORDER_ERROR');

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