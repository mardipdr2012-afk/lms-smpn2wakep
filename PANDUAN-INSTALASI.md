# Panduan Instalasi — LMS SMPN 2 Walea Kepulauan

Urutan wajib: **Backend dulu → isi config.js → baru push ke GitHub.**

## A. Backend (Google Apps Script)
1. Buka https://script.google.com → Proyek Baru.
2. Ganti isi `Code.gs` dengan isi berkas `Kode.gs` (rename file menjadi `Kode`).
3. Jalankan `setupAppEnvironment` **satu kali** (▶ Run) → izinkan akses. Lihat Execution Log untuk URL Spreadsheet.
   Akun contoh (PIN `123456`, wajib diganti): siswa `202408001`, wali kelas `198504122009022004`, kepsek `196801012000011001`.
4. Deploy → New Deployment → Web App → Execute as **Me**, Who has access **Anyone** → salin URL `/exec`.
5. Tes: buka URL `/exec` di browser, harus muncul JSON berisi `"pong"`.
> Setiap mengubah `Kode.gs`, buat **New Deployment** baru dan perbarui URL di `config.js`.

## B. Frontend
1. Ekstrak ZIP. Folder hasil ekstraksi **`lms-smpn2-walea`** adalah folder yang nanti di-`git init`.
2. Buka `js/config.js`, ganti `ISI_URL_EXEC_DI_SINI` dengan URL `/exec` dari langkah A4 (tetap di dalam tanda kutip).
3. Buka terminal **di dalam** folder `lms-smpn2-walea`. Pastikan `dir` (Windows) / `ls` (Mac/Linux) menampilkan `index.html`, `css`, `js`.
4. Push ke GitHub (repo **Public**, tanpa README/.gitignore saat membuat):
```
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/lms-smpn2-walea.git
git push -u origin main
```
   Saat diminta password, gunakan **Personal Access Token** (scope `repo`). Layar tidak menampilkan apa pun saat Anda menempel token — itu normal.
5. GitHub → repo → Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.
6. Tunggu 1–2 menit; situs di `https://USERNAME.github.io/lms-smpn2-walea/`.

## C. Update di kemudian hari
```
git add .
git commit -m "Pembaruan"
git push
```

## D. Masalah umum
| Gejala | Solusi |
|---|---|
| 404 di GitHub Pages | `index.html` tidak ada di root repo → ulangi dari folder yang benar |
| Halaman tanpa warna | Folder `css/` `js/` tidak ikut → jangan pakai "Upload files" di web GitHub |
| "Tidak ada koneksi ke server" | `GAS_URL` salah/belum diisi, atau deployment bukan **Anyone** |
| Perubahan tidak tampil | Ctrl+Shift+R |

## E. Akun Admin & peran
- Instalasi **baru**: `setupAppEnvironment` otomatis membuat admin (NIP `999999`, PIN `123456`).
- Database **sudah ada**: jalankan fungsi `tambahAdmin` **satu kali** di editor Apps Script.
- Login admin → menu **Pengguna** (tambah akun, reset PIN, aktif/nonaktif) dan **Kelola** (kelas, wali kelas, mapel & guru pengampu).
- Guru hanya melihat mapel yang ditugaskan admin; tambah materi, tugas, dan kuis dari menu **Mapel → pilih mapel**.
- Segera ganti PIN semua akun contoh lewat tombol **Ubah PIN** (atau Reset PIN oleh admin).
