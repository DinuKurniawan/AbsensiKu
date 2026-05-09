# 🕐 AbsensiKu

Aplikasi absensi karyawan modern dengan foto selfie, validasi lokasi (GPS + radius kantor), manajemen izin/sakit/cuti, dan laporan export PDF/Excel.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8)

---

## ✨ Fitur Utama

### Admin
- Dashboard statistik (total karyawan, hadir, terlambat, izin, alpa)
- Grafik absensi mingguan & bulanan
- CRUD karyawan (tambah, edit, hapus, toggle status aktif)
- Manajemen absensi seluruh karyawan dengan filter & export **PDF/Excel**
- Lihat foto selfie dan koordinat absensi (dengan link Google Maps)
- Approve/reject pengajuan izin, sakit, dan cuti
- Pengaturan kantor: lokasi (latitude/longitude), radius, jam kerja
- Activity logs

### Karyawan
- Dashboard pribadi (status hari ini, statistik bulan ini)
- **Absen masuk/pulang** dengan:
  - Live preview kamera + foto selfie
  - Deteksi GPS otomatis
  - Validasi radius kantor (Haversine formula)
  - Penolakan otomatis jika di luar area
- Riwayat absensi dengan filter tanggal & status
- Pengajuan izin/sakit/cuti dengan lampiran
- Edit profil & ubah password

### Security
- ✅ Password di-hash dengan bcrypt (10 rounds)
- ✅ Validasi input dengan Zod
- ✅ Proteksi route berbasis role via middleware NextAuth
- ✅ `user_id` diambil dari session, bukan dari client
- ✅ Validasi ukuran & format upload
- ✅ Activity log untuk aktivitas penting
- ✅ CSRF protection bawaan NextAuth

---

## 🧱 Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials + JWT) |
| Form | React Hook Form + Zod |
| Chart | Recharts |
| Export | exceljs, jsPDF |
| Icons | Lucide React |
| Notifikasi | Sonner |

---

## 📁 Struktur Folder

```
absensiku/
├── prisma/
│   ├── schema.prisma          # Data model
│   └── seed.ts                # Seed data awal
├── public/
│   └── uploads/               # Folder foto selfie
├── src/
│   ├── app/
│   │   ├── actions/           # Server Actions
│   │   ├── admin/             # Halaman admin (dashboard, employees, dll)
│   │   ├── api/               # API routes (nextauth, export)
│   │   ├── employee/          # Halaman karyawan
│   │   ├── login/             # Halaman login
│   │   ├── globals.css
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Auto-redirect by role
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   ├── camera-capture.tsx
│   │   ├── geolocation-box.tsx
│   │   ├── employee-form.tsx
│   │   ├── office-setting-form.tsx
│   │   ├── profile-form.tsx
│   │   ├── leave-request-form.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   ├── session.ts         # Session helpers
│   │   ├── haversine.ts       # Perhitungan jarak
│   │   ├── upload.ts          # Simpan base64 ke file
│   │   ├── utils.ts
│   │   └── validations.ts     # Zod schemas
│   ├── types/
│   │   └── next-auth.d.ts
│   └── middleware.ts          # Route protection
├── .env
├── .env.example
├── components.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Panduan Instalasi

### 1. Prasyarat
- Node.js 18.17+ atau 20+
- npm / pnpm / yarn
- Akun Neon PostgreSQL: https://neon.tech (gratis)

### 2. Clone / Buka Project
```bash
cd absensiku
```

### 3. Install Dependencies
```bash
npm install
```

> Catatan: script `postinstall` akan otomatis menjalankan `prisma generate`.

### 4. Setup Neon PostgreSQL
1. Buat akun di https://neon.tech
2. Buat project baru → ambil **connection string** berformat:
   ```
   postgresql://user:password@ep-xxxxx.xxx.neon.tech/dbname?sslmode=require
   ```
3. Salin ke file `.env`.

### 5. Konfigurasi Environment Variable
Salin `.env.example` menjadi `.env` lalu ubah nilainya:

```env
DATABASE_URL="postgresql://user:password@ep-xxxxx.neon.tech/absensiku?sslmode=require"
NEXTAUTH_SECRET="ganti-dengan-secret-random-minimal-32-karakter"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_DIR="/uploads"
```

Generate `NEXTAUTH_SECRET` dengan:
```bash
# Linux / macOS
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
```

### 6. Push Schema ke Database
```bash
npm run db:push
```

### 7. Seed Data Awal
```bash
npm run db:seed
```

Akun default yang dibuat:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@absensiku.com` | `password123` |
| **Karyawan** | `karyawan@absensiku.com` | `password123` |

Plus 4 karyawan dummy (`budi`, `siti`, `agus`, `dewi` @absensiku.com — semua password `password123`) dan 1 office setting default (lokasi Jakarta, radius 100m, jam kerja 07:00–09:00 masuk, 16:00–18:00 pulang).

### 8. Jalankan Development Server
```bash
npm run dev
```

Buka: <http://localhost:3000>

### 9. Build untuk Production
```bash
npm run build
npm start
```

---

## 📋 Scripts

| Script | Keterangan |
|---|---|
| `npm run dev` | Jalankan dev server |
| `npm run build` | Build production |
| `npm start` | Jalankan production server |
| `npm run lint` | Jalankan ESLint |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema ke DB (tanpa migration) |
| `npm run db:migrate` | Buat & apply migration |
| `npm run db:seed` | Jalankan seeder |
| `npm run db:studio` | Buka Prisma Studio |

---

## 🧭 Rute Aplikasi

### Publik
- `/login` — Halaman login

### Admin (role `ADMIN`)
- `/admin/dashboard` — Statistik & grafik
- `/admin/employees` — Daftar karyawan
- `/admin/employees/create` — Tambah karyawan
- `/admin/employees/[id]/edit` — Edit karyawan
- `/admin/attendances` — Daftar semua absensi + export
- `/admin/leave-requests` — Approve/reject pengajuan
- `/admin/settings` — Pengaturan kantor
- `/admin/profile` — Profil admin

### Karyawan (role `EMPLOYEE`)
- `/employee/dashboard` — Dashboard pribadi
- `/employee/attendance` — Absen masuk/pulang
- `/employee/history` — Riwayat absensi
- `/employee/leave-request` — Pengajuan izin
- `/employee/profile` — Profil & ubah password

---

## 🗃️ Database Schema (Ringkas)

- **users** — data admin & karyawan (role, employee_code, is_active)
- **attendances** — absensi harian (`@@unique([userId, date])`, status, foto, koordinat, jarak)
- **leave_requests** — pengajuan izin/sakit/cuti (status: PENDING/APPROVED/REJECTED)
- **office_settings** — lokasi kantor, radius, jam kerja
- **activity_logs** — audit log aktivitas penting

---

## 🧮 Aturan Bisnis Absensi

1. Karyawan **hanya bisa absen masuk 1× per hari**.
2. Absen pulang **hanya bisa** jika sudah absen masuk, dan tidak bisa 2×.
3. Jika absen masuk **setelah `check_in_end`** → status `TERLAMBAT`.
4. Jika absen sebelum atau tepat batas → status `HADIR`.
5. Jika tidak absen & tidak ada pengajuan → status `ALPA`.
6. Jika pengajuan izin/sakit/cuti **disetujui admin**, sistem otomatis membuat entri absensi dengan status `IZIN`/`SAKIT`/`CUTI` untuk setiap tanggal dalam rentang pengajuan.
7. Validasi lokasi: karyawan harus **berada dalam radius kantor** (default 100m) berdasarkan perhitungan **Haversine**.
8. Wajib: **kamera aktif + foto terambil + lokasi GPS aktif**.

---

## 🔒 Keamanan

- Password di-hash menggunakan **bcrypt** (salt rounds 10).
- Session menggunakan **JWT** (NextAuth) dengan masa berlaku 7 hari.
- Proteksi route dilakukan di dua lapisan:
  1. `src/middleware.ts` — guard berdasarkan role.
  2. Helper `requireAdmin()` / `requireEmployee()` di setiap page.
- **Semua server actions** memvalidasi session & mengambil `user_id` dari session (tidak dari client).
- Input divalidasi dengan **Zod** sebelum masuk database.
- Upload foto dibatasi maksimum **5MB** dan hanya menerima data URL image.

---

## 🧩 Kustomisasi

### Mengubah Branding
- Warna: edit CSS variables di `src/app/globals.css`
- Nama aplikasi: edit `metadata` di `src/app/layout.tsx` & komponen sidebar/topbar
- Logo: ganti icon `Fingerprint` pada `src/components/sidebar.tsx`, `src/components/topbar.tsx`, `src/app/login/page.tsx`

### Menambah Field Karyawan
1. Edit `prisma/schema.prisma`
2. Jalankan `npm run db:push`
3. Update `src/lib/validations.ts`
4. Update `src/components/employee-form.tsx`

---

## 🩺 Troubleshooting

**Kamera tidak menyala** → Browser membutuhkan HTTPS untuk akses kamera di production. Saat development (localhost) aman. Cek permission di address bar.

**Lokasi tidak terdeteksi** → Pastikan izin GPS diaktifkan. Di Chrome: Settings → Privacy → Site settings → Location.

**Error `prisma: command not found`** → Jalankan `npx prisma <command>` atau gunakan script `npm run db:*`.

**Database connection timeout** → Neon gratis auto-sleep setelah idle. Request pertama akan memicu wake-up (beberapa detik).

---

## 📄 Lisensi

MIT — silakan gunakan untuk keperluan belajar, perusahaan, atau komersial.

---

Dibuat dengan ❤️ menggunakan Next.js, Prisma, dan Shadcn UI.
