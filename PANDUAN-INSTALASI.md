# 📋 Panduan Instalasi — Katalog Aplikasi Web

Panduan ini mengasumsikan Anda **belum pernah** memakai Google Apps Script atau Git/GitHub. Ikuti berurutan dari atas ke bawah — jangan lompat tahap.

Ringkasan arsitektur: **frontend** (file yang Anda pegang sekarang: `index.html`, `css/`, `js/`) berjalan di GitHub Pages dan berbicara lewat internet ke **backend** (3 berkas `.gs` yang Anda tempel ke Google Apps Script), yang menyimpan semua data di Google Sheets & Google Drive milik Anda sendiri — tanpa biaya server bulanan.

```
Browser pengunjung  →  GitHub Pages (frontend statis)  →  fetch()  →  Google Apps Script (backend)  →  Google Sheets + Drive + Gmail
```

---

## TAHAP A — Backend: Google Apps Script

### A1. Buat proyek

1. Buka **[script.google.com](https://script.google.com)**, masuk dengan akun Google Anda.
2. Klik **Proyek Baru**.
3. Beri nama proyek (misalnya "Katalog Aplikasi Web"), lewat menu **File → Rename** di kiri atas.

### A2. Tempel 3 berkas kode

Proyek baru punya satu berkas bernama `Code.gs`. Anda memerlukan **3 berkas**. Lakukan ini:

1. Klik nama `Code.gs`, ganti jadi **`Kode`** (ekstensi `.gs` otomatis, tidak perlu diketik).
2. Hapus seluruh isi bawaan, lalu **salin-tempel seluruh isi `Kode.gs`** yang diberikan di chat ke sini.
3. Klik ikon **+** di samping "Files" → **Script** → beri nama **`Katalog`** → tempel seluruh isi `Katalog.gs`.
4. Klik ikon **+** lagi → **Script** → beri nama **`Pesanan`** → tempel seluruh isi `Pesanan.gs`.
5. Klik ikon disket (💾) atau `Ctrl+S` untuk menyimpan.

> Nama berkas di editor Apps Script **boleh apa saja** — yang penting isinya benar. Tiga berkas ini saling memanggil fungsi satu sama lain secara otomatis, tidak perlu import apa pun.

### A3. Isi 2 baris konfigurasi wajib

Buka berkas **Kode**, cari 2 baris paling atas (di bawah judul "EDIT 2 BARIS INI"):

```javascript
const EMAIL_ADMIN_AWAL = 'emailanda@gmail.com';
const KATA_SANDI_AWAL  = 'GANTI-DENGAN-KATA-SANDI-ANDA';
```

Ganti:
- `EMAIL_ADMIN_AWAL` → email Google Anda sendiri (ini jadi email login admin & penerima notifikasi).
- `KATA_SANDI_AWAL` → kata sandi bebas minimal 8 karakter untuk masuk ke dashboard admin situs (**beda** dari kata sandi akun Google Anda).

Simpan lagi (`Ctrl+S`).

### A4. Jalankan setup — HANYA SEKALI

1. Di dropdown fungsi (toolbar atas, biasanya bertuliskan nama fungsi terakhir), pilih **`setupAppEnvironment`**.
2. Klik tombol **▶ Run**.
3. Akan muncul jendela **Authorization required** → klik **Review permissions**.
4. Pilih akun Google Anda → akan ada peringatan "Google hasn't verified this app" → klik **Advanced** → **Go to [nama proyek] (unsafe)**. Ini normal untuk skrip pribadi buatan sendiri, bukan tanda bahaya.
5. Klik **Allow** / **Izinkan** agar skrip boleh mengakses Sheets, Drive, dan Gmail Anda.
6. Tunggu proses selesai (sekitar 10–20 detik), lalu buka **Execution log** (ikon di bawah, atau menu View → Logs).
7. Pastikan muncul baris **`✅ Setup selesai!`** beserta link Spreadsheet dan Drive Folder.

**Verifikasi:**
- Buka **[Google Drive](https://drive.google.com)** Anda → harus ada folder baru **"📁 Katalog Aplikasi Web"** berisi sub-folder Uploads, BuktiTransfer, TandaTerima, Exports, dan satu Spreadsheet database.
- Buka spreadsheet-nya → harus ada sheet `AppConfig`, `Aplikasi` (3 baris contoh), `Pesanan`, `Testimoni`, `Statistik`, `Pengaturan`, `FAQ`, `LogAdmin`.

> ⚠️ **Jangan jalankan `setupAppEnvironment` lagi setelah ini.** Fungsi ini sengaja menolak berjalan dua kali (Anda akan melihat pesan "Setup SUDAH PERNAH dijalankan" di log) supaya folder dan sheet tidak dobel. Kalau lupa kata sandi nanti, ada cara memperbaikinya tanpa mengulang setup — lihat bagian **Lupa Kata Sandi Admin** di bawah.

### A5. Deploy sebagai Web App

1. Klik tombol biru **Deploy** (kanan atas) → **New deployment**.
2. Klik ikon gerigi ⚙️ di samping "Select type" → pilih **Web app**.
3. Isi:
   - **Description**: bebas, misalnya "v1"
   - **Execute as**: **Me (email Anda)**
   - **Who has access**: **Anyone**
4. Klik **Deploy**.
5. Akan muncul jendela authorization lagi (kalau belum pernah) → ulangi izinkan seperti A4.
6. Salin **Web app URL** yang tampil — bentuknya seperti:
   ```
   https://script.google.com/macros/s/AKfycb........................./exec
   ```
   Simpan URL ini, dipakai di Tahap B.

> Setiap kali Anda mengubah isi `Kode.gs`/`Katalog.gs`/`Pesanan.gs` di kemudian hari, ulangi langkah ini tapi pilih **Manage deployments → ✏️ Edit → New version → Deploy**, supaya URL `/exec` yang sama tetap berlaku (tidak perlu ganti URL di frontend setiap kali).

---

## TAHAP B — Isi konfigurasi frontend

1. Buka berkas `js/config.js` di dalam folder frontend yang Anda unduh.
2. Ganti baris:
   ```javascript
   GAS_URL: 'GANTI_DENGAN_URL_WEB_APP_ANDA',
   ```
   menjadi:
   ```javascript
   GAS_URL: 'https://script.google.com/macros/s/URL_ANDA_DARI_TAHAP_A5/exec',
   ```
3. Simpan berkas.

Ini satu-satunya berkas yang perlu diedit di sisi frontend.

---

## TAHAP C — Deploy Frontend ke GitHub Pages

### C1. Install Git

- **Windows:** unduh dari [git-scm.com/download/win](https://git-scm.com/download/win), install dengan pengaturan default. Setelah selesai, buka **Git Bash** dari Start Menu.
- **Mac:** buka Terminal, ketik `git --version` — kalau belum ada, macOS akan menawarkan instalasi otomatis.
- **Linux:** `sudo apt install git` (Debian/Ubuntu) atau setara.

Cek dengan:
```bash
git --version
```

### C2. Buat akun GitHub

Daftar gratis di **[github.com](https://github.com)** kalau belum punya. Username Anda akan menjadi bagian alamat situs (`username.github.io`), pilih dengan sadar.

### C3. Setup identitas Git (sekali saja per komputer)

```bash
git config --global user.name "Nama Anda"
git config --global user.email "email-akun-github@anda.com"
```

### C4. Buat repository baru

Di GitHub: klik **+** (kanan atas) → **New repository** →
- Nama bebas, misalnya `katalog-aplikasi-web`
- Pilih **Public** (wajib, agar GitHub Pages gratis bisa dipakai — aman, karena tidak ada kredensial rahasia di frontend, hanya alamat API yang memang publik)
- **Jangan** centang "Add a README file"

Biarkan halaman berikutnya (berisi instruksi command line) tetap terbuka.

### C5. Masuk ke folder frontend yang BENAR

Ekstrak ZIP yang Anda unduh. **Pastikan** Anda masuk ke folder yang isinya langsung `index.html` di baris teratas — BUKAN folder pembungkus di luarnya.

```bash
cd path/ke/folder/hasil-ekstrak
dir
```
(di Mac/Linux pakai `ls` bukan `dir`)

Anda harus melihat `index.html`, `css`, `js`, `README.md` langsung di hasil `dir`/`ls`. Kalau yang terlihat malah satu folder lain yang harus dibuka lagi, `cd` masuk dulu ke folder itu.

### C6. Push pertama kali

```bash
git init
git add .
git commit -m "Upload pertama katalog aplikasi web"
git branch -M main
git remote add origin https://github.com/USERNAME/katalog-aplikasi-web.git
git push -u origin main
```
Ganti `USERNAME` dan nama repo sesuai punya Anda.

Saat push, terminal akan minta **username** dan **password** GitHub:
- Username: username GitHub Anda.
- Password: **BUKAN** password akun biasa (GitHub menolaknya). Anda perlu **Personal Access Token**:
  1. Buka **[github.com/settings/tokens](https://github.com/settings/tokens)** → **Generate new token (classic)**.
  2. Centang scope **repo**. Klik **Generate token**.
  3. Salin token (hanya tampil sekali!) → tempel sebagai "password" saat diminta terminal.

> Saat mengetik/menempel token, layar terminal **tidak menampilkan karakter apa pun** — ini normal, bukan error. Tetap tempel lalu tekan Enter.

### C7. Aktifkan GitHub Pages

1. Di halaman repo GitHub → **Settings** → **Pages** (menu kiri).
2. **Source**: pilih **Deploy from a branch**.
3. **Branch**: pilih **main**, folder **/ (root)** → **Save**.
4. Tunggu 1–2 menit, refresh halaman ini — akan muncul link hijau seperti:
   ```
   https://USERNAME.github.io/katalog-aplikasi-web/
   ```

### C8. Isi "Alamat Situs" di dashboard admin

Buka situs Anda → `#/admin` → login → **Pengaturan Sistem** → tab **Kontak & Bantuan** → isi **Alamat Situs GitHub Pages** dengan URL di atas (diakhiri `/`) → **Simpan Pengaturan**. Ini dipakai untuk menyusun tautan "Cek Status Pesanan" di email otomatis.

---

## TAHAP D — Uji coba end-to-end

Lakukan urutan ini sebagai pembeli sungguhan (pakai email Anda sendiri):

1. Buka situs → katalog tampil dengan 3 aplikasi contoh.
2. Klik salah satu aplikasi berstatus **Tersedia** → **Pesan Sekarang**.
3. Isi form, unggah foto apa saja sebagai "bukti transfer" (untuk uji coba) → **Kirim Pesanan**.
4. Catat **kode pesanan** yang muncul.
5. Buka `#/admin`, login dengan email & kata sandi dari Tahap A3.
6. Buka **Status Pesanan** → cari pesanan tadi → **Setujui Pembayaran**.
7. Cek email Anda (juga folder Spam) — harus ada 2 email: pesanan diterima (langkah 3) dan pembayaran disetujui (langkah 6, dengan lampiran PDF tanda terima).
8. Buka `#/status` di situs, masukkan kode pesanan + email → status harus **Disetujui**.
9. Klik **Tulis Testimoni Sekarang** → kirim testimoni.
10. Kembali ke dashboard admin → **Moderasi Testimoni** → **Setujui & Publikasikan**.
11. Buka lagi halaman detail aplikasi tadi → testimoni harus tampil.

Kalau semua langkah ini berhasil, aplikasi Anda sudah berfungsi penuh.

---

## Mengisi katalog dengan aplikasi Anda sendiri

1. Dashboard admin → **Kelola Katalog** → **+ Tambah Aplikasi Baru**.
2. Isi nama, kategori, harga, deskripsi, unggah thumbnail, isi fitur & langkah instalasi.
3. Paling penting: kolom **Link Akses Privat** — isi dengan link Google Drive/GitHub tempat Anda menaruh source code aplikasi tersebut. Link ini **tidak pernah** tampil publik, hanya dikirim ke pembeli lewat email setelah pembayaran disetujui.
4. Simpan. Aplikasi contoh bawaan boleh dihapus lewat tombol 🗑️ di tabel Kelola Katalog.

---

## Update kode di kemudian hari

**Backend:** edit langsung di editor Apps Script → **Deploy → Manage deployments → ✏️ → New version → Deploy**. URL `/exec` tidak berubah.

**Frontend:** edit file lokal → jalankan:
```bash
git add .
git commit -m "Deskripsi perubahan"
git push
```
Tunggu 1 menit, lalu buka situs dan tekan **Ctrl+Shift+R** (hard refresh) untuk memastikan tidak melihat versi lama dari cache browser.

---

## Lupa Kata Sandi Admin

Tidak perlu mengulang `setupAppEnvironment()`. Di editor Apps Script:
1. Buka berkas `Kode`, ganti nilai `KATA_SANDI_AWAL` di baris atas dengan kata sandi baru.
2. Jalankan fungsi **`aturUlangKataSandiAdmin`** (pilih dari dropdown fungsi → ▶ Run).
3. Cek log memastikan muncul "✅ Kata sandi admin diatur ulang." Sekarang login pakai kata sandi baru.

---

## Troubleshooting cepat

| Gejala | Kemungkinan sebab | Solusi |
|---|---|---|
| Halaman tampil tapi data tidak muncul / muncul pesan "Alamat Web App belum diisi" | `js/config.js` belum diisi atau salah | Cek lagi Tahap B, pastikan URL diakhiri `/exec` |
| Semua permintaan gagal dengan pesan jaringan | Deployment Apps Script belum "Anyone" akses | Deploy ulang (Tahap A5), pastikan "Who has access: Anyone" |
| CSS/JS tidak termuat, halaman polos tanpa gaya | Struktur folder tidak terjaga (upload lewat "Add file" di web GitHub, bukan lewat `git push`) | Selalu pakai `git push` dari terminal, jangan upload manual lewat website GitHub |
| Halaman GitHub Pages 404 | `index.html` tidak ada tepat di root repo, atau Settings → Pages belum disimpan | Pastikan `git init` dijalankan tepat di folder yang isinya `index.html`, cek lagi Tahap C7 |
| Email tidak terkirim | Kuota Gmail harian habis (akun gratis terbatas) atau alamat "Alamat Situs" belum diisi | Cek dashboard admin, kolom Kuota Email; coba lagi besok atau pakai tombol "Kirim Ulang" |
| `Password authentication is not supported` saat `git push` | GitHub menolak password akun biasa | Buat Personal Access Token (lihat Tahap C6) |
| Login admin bilang "Terlalu banyak percobaan" | 5x salah kata sandi berturut-turut | Tunggu 15 menit, atau reset lewat cara di atas |

---

## Keamanan

- Jangan pernah membagikan **Personal Access Token** GitHub atau kata sandi admin ke orang lain.
- URL Web App (`/exec`) memang bisa dilihat siapa saja yang membuka kode sumber situs — ini normal dan aman, karena backend memvalidasi semua input dan tidak ada data rahasia yang bisa diakses tanpa login admin.
- Kata sandi admin tersimpan di server sebagai *hash* (bukan teks polos), jadi aman meski seseorang membuka spreadsheet Anda.
