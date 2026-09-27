# Katalog Aplikasi Web

Katalog aplikasi web siap pakai untuk pemesanan lisensi dengan verifikasi transfer bank manual. Frontend statis (HTML/CSS/JS murni, tanpa build step) yang berkomunikasi dengan backend **Google Apps Script** sebagai REST API.

## Struktur folder

```
index.html          ← halaman utama (wajib ada di ROOT repo GitHub Pages)
css/style.css        ← seluruh gaya visual (token warna, tipografi, komponen)
js/config.js         ← SATU-SATUNYA berkas yang perlu Anda edit (isi URL Web App)
js/utils.js          ← ikon, format angka/tanggal, toast, kompresi gambar
js/api.js            ← komunikasi fetch() ke Google Apps Script
js/charts.js         ← grafik SVG ringan untuk dashboard admin
js/public.js         ← seluruh halaman publik (katalog, detail, pemesanan, status, testimoni, bantuan)
js/admin.js          ← shell admin, login, dashboard, verifikasi pembayaran
js/admin2.js         ← kelola aplikasi, moderasi testimoni, pengaturan sistem
assets/              ← logo & favicon SVG
```

## Sebelum online

1. Selesaikan setup backend di Google Apps Script (lihat **PANDUAN-INSTALASI.md**) sampai Anda mendapatkan URL Web App yang diakhiri `/exec`.
2. Buka `js/config.js`, ganti `GANTI_DENGAN_URL_WEB_APP_ANDA` dengan URL tersebut.
3. Deploy folder ini ke GitHub Pages (langkah lengkap ada di **PANDUAN-INSTALASI.md**).
4. Buka halaman **Pengaturan Sistem** di dashboard admin, isi kolom **Alamat Situs** dengan URL GitHub Pages Anda (diakhiri `/`) — ini dipakai untuk menyusun tautan di email otomatis.

## Login admin

Buka `<url-situs-anda>/#/admin`. Email dan kata sandi awal sesuai yang Anda isi di `EMAIL_ADMIN_AWAL` dan `KATA_SANDI_AWAL` pada `Kode.gs` sebelum menjalankan `setupAppEnvironment()`.

## Rute halaman (SPA berbasis hash)

| Rute | Halaman |
|---|---|
| `#/` | Katalog |
| `#/aplikasi/:id` | Detail aplikasi |
| `#/pesan/:id` | Form pemesanan |
| `#/status` | Cek status pesanan |
| `#/testimoni` | Kirim testimoni |
| `#/bantuan` | Bantuan & FAQ |
| `#/admin` | Login / Dashboard admin |
| `#/admin/aplikasi` | Kelola katalog |
| `#/admin/pesanan` | Verifikasi pembayaran |
| `#/admin/testimoni` | Moderasi testimoni |
| `#/admin/pengaturan` | Pengaturan sistem |

Karena memakai rute hash (`#/...`), situs ini berfungsi penuh di GitHub Pages tanpa konfigurasi server tambahan.
