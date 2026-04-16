# Yoga Studio - Services Documentation

Dokumentasi lengkap untuk service tambahan yang dapat di-deploy terpisah ke Railway.

## Daftar Service

| Service                | Direktori             | Fungsi                                                             |
| ---------------------- | --------------------- | ------------------------------------------------------------------ |
| Push Notification Cron | `services/push-cron/` | Mengirim push notification pengingat kelas 30 menit sebelum jadwal |
| Database Backup        | `services/db-backup/` | Backup harian database PostgreSQL ke Google Drive                  |

---

## 1. Push Notification Cron Service

### Deskripsi

Service ini menjalankan cron job setiap 5 menit (default) untuk memeriksa jadwal kelas yang dimulai dalam 25-35 menit ke depan, lalu mengirim web push notification ke member yang sudah mengaktifkan reminder.

### Alur Kerja

1. Cron berjalan setiap 5 menit
2. Mengambil semua schedule yang aktif
3. Filter schedule yang jadwalnya 25-35 menit dari sekarang
4. Kirim push notification ke setiap member yang punya reminder aktif (belum dikirim)
5. Tandai reminder sebagai sudah dikirim (`sentAt`)
6. Hapus subscription yang sudah tidak valid (410/404)

### Environment Variables

| Variable                       | Wajib | Default       | Deskripsi                                    |
| ------------------------------ | ----- | ------------- | -------------------------------------------- |
| `DATABASE_URL`                 | ✅    | -             | PostgreSQL connection string dari Railway    |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ✅    | -             | VAPID public key (sama dengan di app utama)  |
| `VAPID_PRIVATE_KEY`            | ✅    | -             | VAPID private key (sama dengan di app utama) |
| `CRON_SCHEDULE`                | ❌    | `*/5 * * * *` | Jadwal cron (format cron standard)           |

### Deploy ke Railway

#### Step 1: Buat Project/Service Baru di Railway

1. Buka [Railway Dashboard](https://railway.app/dashboard)
2. Klik **"New Project"** → **"Empty Project"**
3. Atau buka project yang sudah ada, klik **"+ New"** → **"Empty Service"**

#### Step 2: Connect Repository

1. Klik service yang baru dibuat
2. Pilih **"Settings"** → **"Source"**
3. Connect ke Git repository
4. Set **Root Directory**: `services/push-cron`
5. Set **Build Command**: _(kosongkan, Docker akan dipakai)_

#### Step 3: Pilih Dockerfile

1. Di **Settings** → **Build**
2. Pilih **"Dockerfile"** sebagai builder
3. Set **Dockerfile Path**: `Dockerfile`

#### Step 4: Set Environment Variables

1. Buka tab **"Variables"**
2. Tambahkan semua variabel di atas:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
   VAPID_PRIVATE_KEY=your-private-key
   CRON_SCHEDULE=*/5 * * * *
   ```
   > ⚠️ Gunakan DATABASE_URL yang sama dengan app utama (dari Railway PostgreSQL service)

#### Step 5: Deploy

1. Railway akan otomatis build dan deploy saat push ke repository
2. Atau klik **"Deploy"** manual di dashboard

#### Step 6: Verifikasi

1. Buka tab **"Logs"** di Railway
2. Pastikan tampil log seperti:
   ```
   [push-cron] Starting push notification cron service...
   [push-cron] Schedule: */5 * * * *
   [push-cron] Done: 0 sent, 0 failed at 2026-04-16T02:00:00.000Z
   ```

---

## 2. Database Backup Service (ke Google Drive)

### Deskripsi

Service ini menjalankan backup otomatis database PostgreSQL setiap hari (default: 02:00 UTC) dan mengupload file backup terkompresi (`.sql.gz`) ke Google Drive menggunakan OAuth2.

### Alur Kerja

1. Cron berjalan sesuai jadwal (default: harian pukul 02:00 UTC)
2. Jalankan `pg_dump` dan compress dengan gzip
3. Upload file backup ke Google Drive
4. Hapus backup lama (default: simpan 7 backup terakhir)
5. Bersihkan file temporary

### Environment Variables

| Variable                 | Wajib | Default                          | Deskripsi                                  |
| ------------------------ | ----- | -------------------------------- | ------------------------------------------ |
| `DATABASE_URL`           | ✅    | -                                | PostgreSQL connection string               |
| `GOOGLE_CLIENT_ID`       | ✅    | -                                | OAuth2 Client ID dari Google Cloud Console |
| `GOOGLE_CLIENT_SECRET`   | ✅    | -                                | OAuth2 Client Secret                       |
| `GOOGLE_TOKEN_JSON`      | ✅\*  | -                                | Token JSON (hasil dari `npm run auth`)     |
| `GOOGLE_REDIRECT_URI`    | ❌    | `http://localhost:3100/callback` | Redirect URI untuk OAuth                   |
| `GOOGLE_DRIVE_FOLDER_ID` | ❌    | -                                | ID folder Google Drive tujuan backup       |
| `BACKUP_CRON_SCHEDULE`   | ❌    | `0 2 * * *`                      | Jadwal backup (cron format)                |
| `BACKUP_KEEP_COUNT`      | ❌    | `7`                              | Jumlah backup yang disimpan                |
| `BACKUP_ON_START`        | ❌    | `false`                          | Jalankan backup saat service start         |

> \* `GOOGLE_TOKEN_JSON` wajib di Railway. Secara lokal bisa menggunakan file `token.json`.

### Setup Google OAuth2 (Langkah-langkah Detail)

#### Step 1: Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **"Select a project"** → **"New Project"**
3. Beri nama: `Yoga Studio Backup`
4. Klik **"Create"**

#### Step 2: Aktifkan Google Drive API

1. Buka **"APIs & Services"** → **"Library"**
2. Cari **"Google Drive API"**
3. Klik **"Enable"**

#### Step 3: Buat OAuth Consent Screen

1. Buka **"APIs & Services"** → **"OAuth consent screen"**
2. Pilih **"External"** → **"Create"**
3. Isi:
   - App name: `Yoga Studio Backup`
   - User support email: email Anda
   - Developer contact: email Anda
4. Klik **"Save and Continue"**
5. Di halaman **Scopes**, klik **"Add or Remove Scopes"**
   - Tambahkan: `https://www.googleapis.com/auth/drive.file`
   - Klik **"Update"** → **"Save and Continue"**
6. Di halaman **Test users**, klik **"Add Users"**
   - Tambahkan email Google yang akan digunakan untuk menyimpan backup
   - Klik **"Save and Continue"**

#### Step 4: Buat OAuth2 Credentials

1. Buka **"APIs & Services"** → **"Credentials"**
2. Klik **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Yoga Backup Client`
5. Authorized redirect URIs: tambahkan `http://localhost:3100/callback`
6. Klik **"Create"**
7. **Salin Client ID dan Client Secret**

#### Step 5: Setup Token di Lokal

1. Masuk ke direktori service:

   ```bash
   cd services/db-backup
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Buat file `.env` (salin dari `.env.example`):

   ```bash
   cp .env.example .env
   ```

4. Isi `.env` dengan credentials:

   ```env
   DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/railway"
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

5. Jalankan script autentikasi:

   ```bash
   npm run auth
   ```

6. Browser akan terbuka → Login dengan Google → Izinkan akses
7. Setelah berhasil, file `token.json` akan terbuat

#### Step 6: (Opsional) Buat Folder di Google Drive

1. Buka [Google Drive](https://drive.google.com)
2. Buat folder baru: `Yoga Studio Backups`
3. Buka folder tersebut
4. Salin **folder ID** dari URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_ADA_DISINI
   ```
5. Tambahkan ke `.env`:
   ```env
   GOOGLE_DRIVE_FOLDER_ID="your-folder-id"
   ```

#### Step 7: Test Backup Secara Lokal

```bash
# Jalankan test backup
BACKUP_ON_START=true npm run dev
```

Jika berhasil, Anda akan melihat:

```
[db-backup] Starting database backup cron service...
[db-backup] Running initial backup on startup...
[db-backup] Starting pg_dump...
[db-backup] Dump complete: yoga_studio_backup_2026-04-16T02-00-00.sql.gz (0.05 MB)
[db-backup] Uploading to Google Drive...
[gdrive] Uploaded: yoga_studio_backup_2026-04-16T02-00-00.sql.gz (ID: xxx)
[db-backup] Backup completed successfully
```

### Deploy ke Railway

#### Step 1: Buat Service Baru

1. Di Railway project yang sama, klik **"+ New"** → **"Empty Service"**
2. Beri nama: `db-backup`

#### Step 2: Connect Repository

1. **Settings** → **Source** → Connect ke Git repo yang sama
2. Set **Root Directory**: `services/db-backup`

#### Step 3: Pilih Dockerfile

1. **Settings** → **Build** → Pilih **"Dockerfile"**
2. Dockerfile Path: `Dockerfile`

#### Step 4: Set Environment Variables

1. Buka tab **"Variables"**
2. Tambahkan variabel berikut:

```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_TOKEN_JSON=<isi seluruh konten token.json sebagai satu baris>
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
BACKUP_CRON_SCHEDULE=0 2 * * *
BACKUP_KEEP_COUNT=7
```

> ⚠️ Untuk `GOOGLE_TOKEN_JSON`, salin seluruh isi file `token.json` sebagai satu baris string.
> Contoh mendapatkan isi `token.json`:
>
> ```bash
> cat token.json | tr -d '\n'
> ```

#### Step 5: Deploy & Verifikasi

1. Deploy akan otomatis saat push ke repository
2. Cek **Logs** di Railway:
   ```
   [db-backup] Starting database backup cron service...
   [db-backup] Schedule: 0 2 * * *
   ```

---

## 3. Perubahan pada AI Service (Refactor)

### Apa yang Berubah

- `lib/api/ai-service.ts` di-refactor dari menggunakan `fetch` menjadi menggunakan library resmi `@google/genai`
- Mendukung model terbaru **Gemini 2.5 Flash**
- Error handling yang lebih robust dengan pesan user-friendly

### Error Handling Baru

Sekarang setiap error dari AI service akan menampilkan pesan yang jelas kepada user:

| Kondisi                | Pesan Toast                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| API Key belum diset    | "Fitur AI belum tersedia saat ini. Silakan hubungi admin."               |
| Rate limited (429)     | "Layanan AI sedang ramai. Silakan tunggu beberapa saat dan coba lagi."   |
| Server error (500/503) | "Server AI sedang dalam pemeliharaan. Silakan coba beberapa menit lagi." |
| Content blocked/safety | "Permintaan tidak dapat diproses. Coba ubah pertanyaan Anda."            |
| Error lainnya          | "Fitur AI sedang tidak tersedia. Silakan coba lagi nanti."               |
| Batas harian tercapai  | "Batas AI harian tercapai (X/Y). Coba lagi besok."                       |

### File yang Diubah

- `lib/api/ai-service.ts` — Refactor ke `@google/genai` SDK
- `app/api/ai/library/route.ts` — Error handling menggunakan `AiServiceError`
- `app/api/ai/meditation/route.ts` — Error handling menggunakan `AiServiceError`
- `app/api/ai/pose-scan/route.ts` — Error handling menggunakan `AiServiceError`
- `app/api/ai/sequence/route.ts` — Error handling menggunakan `AiServiceError`
- `components/member/tab-library.tsx` — Toast menampilkan pesan dari server
- `components/member/tab-meditation.tsx` — Toast menampilkan pesan dari server
- `components/member/tab-guide.tsx` — Toast menampilkan pesan dari server

### Package Baru

- `@google/genai` — SDK resmi Google untuk Generative AI

---

## Troubleshooting

### Push Cron: Tidak ada notifikasi terkirim

1. Pastikan `VAPID_PUBLIC_KEY` dan `VAPID_PRIVATE_KEY` sama dengan app utama
2. Pastikan `DATABASE_URL` sudah benar dan bisa diakses
3. Cek di database apakah ada `schedule_reminders` dengan `sentAt` = null
4. Pastikan jadwal kelas dimulai dalam 25-35 menit dari sekarang

### DB Backup: Google Drive error

1. Pastikan Google Drive API sudah di-enable di Google Cloud Console
2. Pastikan token belum expired — jalankan `npm run auth` ulang jika perlu
3. Untuk Railway, update `GOOGLE_TOKEN_JSON` dengan token baru
4. Pastikan email yang digunakan untuk auth sudah ditambahkan sebagai Test User di OAuth Consent Screen

### DB Backup: pg_dump error

1. Pastikan `DATABASE_URL` menggunakan format yang benar
2. Di Railway, gunakan **internal URL** untuk koneksi database jika backup service ada di project yang sama
3. Pastikan database bisa diakses dari service container

### AI Service: Error setelah refactor

1. Pastikan `@google/genai` sudah terinstall: `npm install @google/genai`
2. Pastikan `GEMINI_API_KEY` di `.env` valid
3. Pastikan `GEMINI_MODEL` disetel ke `gemini-2.5-flash` (atau model yang tersedia)
