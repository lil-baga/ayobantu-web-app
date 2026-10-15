# Tahap 7: CI/CD, Deployment & Audit Perbaikan

## Deskripsi
Konfigurasi CI/CD GitHub Actions, konfigurasi Vercel deployment, audit kesesuaian PRD, perbaikan error linting, perbaikan Jest test suite, dan implementasi fitur refund yang tertunda.

## Requirements
- ✅ GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- ✅ Vercel deployment configuration (`vercel.json`)
- ✅ Audit PRD: Endpoint `POST /admin/donations/{id}/refund`
- ✅ UI Refund untuk staf Finance
- ✅ Zero lint errors
- ✅ Automated unit/integration tests running & passing
- ✅ Build Next.js 16 lulus

## Deliverables
- ✅ `.github/workflows/ci.yml` - CI pipeline (lint, test, build di Node 22)
- ✅ `vercel.json` - Deployment config untuk Vercel
- ✅ `jest.setup.js` - Auto-load environment variables lokal untuk Jest
- ✅ `app/api/admin/donations/[id]/refund/route.ts` - Endpoint refund manual
- ✅ `app/admin/donations/_components/RefundButton.tsx` - Tombol modal refund
- ✅ `obsidian-vault/docs/` - Updated auto-generated routes & schemas

## Temuan Audit & Perbaikan (Bug Fixes)

1. **Jest Test Suite Gagal (Module Resolution & Env)**
   - *Masalah:* Jest tidak mengenali path alias `@/*` dan tidak membaca `.env.local` saat dieksekusi via `npm test`.
   - *Solusi:* Tambah `moduleNameMapper` di `jest.config.cjs` dan buat `jest.setup.js` yang otomatis mem-parsing variabel environment tanpa dependensi tambahan.

2. **Database Constraint & Enkripsi pada Test**
   - *Masalah:* Column `disbursed_at` pada tabel `disbursements` memiliki constraint `NOT NULL`, dan `lib/crypto.ts` mengharuskan panjang key 32 bytes spesifik.
   - *Solusi:* Perbaiki `lib/crypto.ts` agar mendukung derivasi key SHA-256 yang aman, perbaiki payload `disbursed_at` saat insert status planned, dan update test helper donasi dengan tracking token hash.

3. **Duplikasi Endpoint CSV**
   - *Masalah:* Terdapat file duplikat `app/admin/donations.csv/route.ts` dan `app/api/admin/donations.csv/route.ts` yang menyebabkan konflik linting TypeScript.
   - *Solusi:* Hapus versi duplikat di `app/admin/donations.csv/`, jadikan `app/api/admin/donations.csv` sebagai single source of truth dengan typing eksplisit.

4. **ESLint Errors (19 Errors Tereliminasi)**
   - Memperbaiki react unescaped entities (`"` menjadi `&quot;`).
   - Menghapus unused variables/imports di route handlers.
   - Mengganti `any` dengan typed interfaces.
   - Menambahkan ignore config untuk file toolings di `eslint.config.mjs`.

5. **Fitur Refund Sesuai PRD**
   - *PRD Requirement:* Finance dapat melakukan refund manual dengan memeriksa sisa dana kampanye tidak boleh negatif, membekukan/membatalkan operational fee jika refund penuh, dan mencatat audit log.
   - *Solusi:* Implementasikan endpoint `POST /api/admin/donations/[id]/refund` dan komponen UI `RefundButton.tsx`.

## Testing Steps

```bash
# 1. Jalankan test otomatis
npm test

# 2. Jalankan linter
npm run lint

# 3. Jalankan production build
npm run build
```

Semua perintah di atas harus lulus tanpa error.

## Links
- [[Tahap 5: Dashboard & Pencairan]]
- [[Tahap 6: Testing & Verifikasi]]
