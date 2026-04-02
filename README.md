# 🧘 Yoga Virtual Studio

Aplikasi web yoga virtual studio dengan fitur kelas live, rekaman, meditasi AI, perpustakaan yoga AI, pose scanner, dan sequence builder. Dibangun dengan Next.js 15 App Router, TypeScript, Tailwind CSS 4, TanStack Query, Prisma ORM 7.4.2, dan PostgreSQL.

## Tech Stack

- **Framework:** Next.js 15.3.1 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4.0
- **State Management:** TanStack Query 5.62
- **ORM:** Prisma 7.4.2
- **Database:** PostgreSQL
- **Auth:** JWT (jose) + bcryptjs
- **Validation:** Zod + react-hook-form
- **Icons:** Lucide React
- **Notifications:** Sonner
- **AI:** Google Gemini API

## Prerequisites

- Node.js 18+
- PostgreSQL database (local atau Railway)
- Google Gemini API Key (opsional, untuk fitur AI)

## Setup & Instalasi

### 1. Clone & Install Dependencies

```bash
cd yoga_apps
npm install
```

### 2. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit `.env` dan isi:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"
JWT_SECRET="your-random-secret-key-min-32-chars"
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_APP_NAME="Yoga Virtual Studio"
NEXT_PUBLIC_WA_ADMIN="6281234567890"
```

### 3. Setup Database (Prisma)

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrasi untuk membuat tabel
npx prisma migrate dev --name init

# Seed data awal (admin, member, jadwal contoh)
npm run db:seed
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Akun Default (Seeder)

### Admin

- **Email:** admin@yogastudio.com
- **Password:** admin123456
- **Login URL:** `/admin-login`

### Member

- **Email:** sari@example.com / dewi@example.com / budi@example.com
- **Password:** member1234
- **Login URL:** `/login`

## Struktur Folder

```
yoga_apps/
├── app/
│   ├── (auth)/           # Login & Register pages
│   ├── (member)/         # Member dashboard
│   ├── (admin)/          # Admin dashboard & login
│   ├── api/              # API routes
│   │   ├── auth/         # Member auth endpoints
│   │   ├── admin/        # Admin CRUD endpoints
│   │   ├── ai/           # AI endpoints (Gemini)
│   │   ├── schedules/    # GET schedules
│   │   ├── recordings/   # GET recordings
│   │   └── announcements/# GET announcements
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/               # Reusable UI components
│   ├── member/           # Member-specific components
│   └── admin/            # Admin-specific components
├── hooks/                # TanStack Query hooks
├── lib/
│   ├── auth/             # Password hashing & JWT sessions
│   ├── api/              # AI service abstraction
│   ├── db/               # Prisma client singleton
│   ├── utils.ts          # Utility functions
│   └── validators/       # Zod schemas
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seeder
├── providers/            # React providers
├── types/                # TypeScript types
├── middleware.ts          # Route protection
└── package.json
```

## Fitur

### Member

- **Login / Register** — Email & password
- **Jadwal Kelas Live** — Lihat jadwal, copy Meeting ID/Pass, join Zoom
- **Rekaman Kelas** — Tonton rekaman kelas sebelumnya
- **Meditasi AI** — Generate meditasi terpandu via Gemini
- **Perpustakaan Yoga AI** — Tanya jawab seputar yoga
- **Pose Scan** — Upload foto pose, dapatkan analisis AI
- **Sequence Builder** — Buat urutan pose yoga dengan AI
- **Pengumuman** — Info terbaru dari admin
- **WhatsApp** — Tombol kontak admin

### Admin

- **Dashboard** — Overview statistik
- **Members** — CRUD, search, edit membership
- **Schedules** — CRUD jadwal kelas
- **Recordings** — CRUD rekaman kelas
- **Announcements** — CRUD pengumuman
- **App Config** — Key-value konfigurasi aplikasi

## Deploy ke Railway

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/yoga-studio.git
git push -u origin main
```

### 2. Setup Railway

1. Buka [railway.app](https://railway.app) dan buat project baru
2. Tambahkan **PostgreSQL** service
3. Tambahkan **GitHub Repo** service (connect repo)
4. Set environment variables:
   - `DATABASE_URL` — Dari PostgreSQL service (gunakan internal URL)
   - `JWT_SECRET` — Generate random string 32+ karakter
   - `GEMINI_API_KEY` — API key dari Google AI Studio
   - `NEXT_PUBLIC_APP_NAME` — Nama studio
   - `NEXT_PUBLIC_WA_ADMIN` — Nomor WA admin
5. Railway akan otomatis build dan deploy

### 3. Build Command (sudah di package.json)

```bash
npx prisma generate && next build
```

### 4. Jalankan Migrasi di Railway

```bash
npx prisma migrate deploy
npm run db:seed
```

## Scripts

| Script               | Deskripsi                            |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Development server                   |
| `npm run build`      | Production build (+ prisma generate) |
| `npm start`          | Start production server              |
| `npm run lint`       | Lint check                           |
| `npm run db:migrate` | Prisma migrate dev                   |
| `npm run db:seed`    | Seed database                        |

## API Endpoints

### Auth

| Method | Path                 | Deskripsi          |
| ------ | -------------------- | ------------------ |
| POST   | `/api/auth/login`    | Member login       |
| POST   | `/api/auth/register` | Member register    |
| POST   | `/api/auth/logout`   | Member logout      |
| GET    | `/api/auth/session`  | Get member session |

### Member Data

| Method | Path                 | Deskripsi              |
| ------ | -------------------- | ---------------------- |
| GET    | `/api/schedules`     | List jadwal aktif      |
| GET    | `/api/recordings`    | List rekaman published |
| GET    | `/api/announcements` | List pengumuman aktif  |

### AI

| Method | Path                 | Deskripsi               |
| ------ | -------------------- | ----------------------- |
| POST   | `/api/ai/meditation` | Generate meditasi       |
| POST   | `/api/ai/library`    | Tanya perpustakaan yoga |
| POST   | `/api/ai/pose-scan`  | Analisis pose dari foto |
| POST   | `/api/ai/sequence`   | Buat sequence yoga      |

### Admin

| Method     | Path                            | Deskripsi                    |
| ---------- | ------------------------------- | ---------------------------- |
| POST       | `/api/admin/auth/login`         | Admin login                  |
| GET        | `/api/admin/auth/session`       | Get admin session            |
| POST       | `/api/admin/auth/logout`        | Admin logout                 |
| GET        | `/api/admin/stats`              | Dashboard statistics         |
| GET/POST   | `/api/admin/members`            | List / Create member         |
| PUT/DELETE | `/api/admin/members/[id]`       | Update / Delete member       |
| GET/POST   | `/api/admin/schedules`          | List / Create schedule       |
| PUT/DELETE | `/api/admin/schedules/[id]`     | Update / Delete schedule     |
| GET/POST   | `/api/admin/recordings`         | List / Create recording      |
| PUT/DELETE | `/api/admin/recordings/[id]`    | Update / Delete recording    |
| GET/POST   | `/api/admin/announcements`      | List / Create announcement   |
| PUT/DELETE | `/api/admin/announcements/[id]` | Update / Delete announcement |
| GET/POST   | `/api/admin/config`             | List / Upsert config         |
| DELETE     | `/api/admin/config/[id]`        | Delete config                |
