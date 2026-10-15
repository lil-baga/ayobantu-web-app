# AyoBantu - Platform Donasi Online

Platform donasi online lokal untuk proyek kuliah. Berbasis Next.js + Supabase.

## Setup Lokal

### Prerequisites
- Node.js 20+
- Akun Supabase (gratis di supabase.com)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase Cloud

1. Buat project di [supabase.com](https://supabase.com)
2. Di dashboard → **Settings** → **API**, copy:
   - **Project URL**
   - **anon public key**
   - **service_role key**

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Generate encryption key (PowerShell):
```powershell
-join ((1..32 | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) }))
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-anon-key
SUPABASE_SERVICE_ROLE_KEY=paste-service-role-key
PAYMENT_MODE=local
ENCRYPTION_KEY=paste-hasil-generate
```

### 4. Run Migrations

Di **Supabase Dashboard → SQL Editor**:

1. Copy isi `supabase/all_migrations.sql`
2. Paste dan **Run**

**Verifikasi:** Table Editor harus ada 11 tables + 1 view + 2 storage buckets.

### 5. Create Staff Users

**Authentication → Users → Add user**:
- Email: `admin@ayobantu.test`, Password: `password123`, **Auto Confirm: YES**
- Email: `admin@ayobantu.test`, Password: `password123`, **Auto Confirm: YES**

Copy UUID masing-masing, edit `supabase/seed_manual.sql` dengan UUID tersebut, lalu run di SQL Editor.

### 6. Start Dev

```bash
npm run dev
```

Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Login: `admin@ayobantu.test` / `password123`

## Progress

- [x] **Tahap 1:** Setup lokal
- [x] **Tahap 2:** Database & auth ← **SELESAI**
- [ ] **Tahap 3:** Kampanye CRUD
- [ ] **Tahap 4:** Donasi & pembayaran
- [ ] **Tahap 5:** Dashboard & pencairan
- [ ] **Tahap 6:** Testing

## Stack

- Next.js 16 (App Router)
- TypeScript strict
- Tailwind CSS 4
- Supabase (PostgreSQL + Auth + Storage)
- Zod

## Mode Lokal

Pembayaran **tidak sungguhan**. Donasi dikonfirmasi manual oleh Finance. Badge **MODE LOKAL** tampil di admin UI.

## Troubleshooting

**Invalid API key:** Periksa `.env.local`, restart dev server.

**Login gagal:** Pastikan user di Authentication sudah **Auto Confirmed** dan `supabase/seed_manual.sql` sudah dijalankan dengan UUID yang benar.

**Infinite recursion:** Migration `000017_fix_rls_recursion.sql` harus sudah dijalankan.
