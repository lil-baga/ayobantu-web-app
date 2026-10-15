# Tahap 6: Testing & Verifikasi

## Deskripsi
Implementasi unit tests dan integration tests untuk alur kritis: donation flow, disbursement flow, campaign updates. Verifikasi build & lint lulus tanpa error.

## Requirements
- ✅ Jest + TypeScript config (`jest.config.cjs`)
- ✅ Testing libraries (@testing-library/react, jest-dom)
- ✅ Test helpers (donationHelper.ts)
- ✅ Integration tests: donation flow, disbursement flow
- ✅ npm script `test`
- ✅ Build pass, lint pass (zero errors)

## Deliverables
- ✅ `jest.config.cjs` - Jest configuration
- ✅ `tests/helpers/donationHelper.ts` - Helper untuk create donation
- ✅ `tests/donationFlow.test.ts` - E2E test alur donasi
- ✅ `tests/disbursementFlow.test.ts` - E2E test alur pencairan
- ✅ `package.json` - Tambah `"test": "jest"` script
- ✅ Testing dependencies installed (jest, ts-jest, @testing-library/*)

## Implementation

### Completed
- ✅ Installed testing deps: jest, ts-jest, @types/jest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- ✅ Jest config: testEnvironment='node', root tests/, transform TypeScript
- ✅ Donation helper: `createDonation()` function yang insert donor_contacts (encrypted) + donation (pending) + return id & tracking_token
- ✅ Donation test (`donationFlow.test.ts`):
  - Get active campaign
  - Create donation via helper
  - Simulate finance confirm via fetch to API endpoint
  - Verify status changed to "paid"
  - Verify paid_at terisi
- ✅ Disbursement test (`disbursementFlow.test.ts`):
  - Get or create active campaign
  - Create disbursement (planned status)
  - Update status to disbursed → verify disbursed_at terisi
  - Update status to reported
  - Verify storage bucket `disbursement-proofs` exists
- ✅ Type safety: fixed null checks with `!` assertions and type guards
- ✅ Build passed after type fixes

## Testing Steps

### 1. Run Tests
```bash
npm test
```
- Harus **pass** semua tests (donation flow, disbursement flow, bucket check)
- Output: `PASS tests/donationFlow.test.ts`, `PASS tests/disbursementFlow.test.ts`
- Tidak ada error atau skipped test

### 2. Run Build
```bash
npm run build
```
- TypeScript check pass (zero errors)
- Next.js build success
- Output: `.next/` folder ter-generate

### 3. Run Lint
```bash
npm run lint
```
- No critical errors (warnings acceptable)

### 4. Manual Integration Test (Tahap 5 flow)
Jalankan seluruh user flow manual:

#### a. Buat Kampanye
- Login `/admin/login` sebagai admin
- Buka `/admin/campaigns/new`
- Isi form, upload cover image, submit
- Verifikasi kampanye muncul di `/admin/campaigns` dengan status **active**

#### b. Donasi Publik
- Buka `/kampanye/[slug]` (kampanye yang baru dibuat)
- Klik tombol **Donasi Sekarang**
- Isi form donasi (amount, nama, email, pesan)
- Submit
- Verifikasi:
  - Redirect ke `/donasi/sukses`
  - Tracking token link terlihat
  - Instruksi mode lokal ditampilkan

#### c. Tracking Donasi
- Copy tracking token link dari success page
- Buka di tab baru
- Verifikasi:
  - Status: **pending** (yellow)
  - Detail donasi tampil
  - Email/phone ter-mask

#### d. Finance Konfirmasi
- Login `/admin/login` sebagai finance
- Buka `/admin/donations`
- Cari donasi yang baru saja dibuat
- Klik **Konfirmasi Pembayaran**
- Verifikasi:
  - Status berubah menjadi **paid** (green)
  - Paid date terisi

#### e. Verifikasi Dana Kampanye
- Buka halaman kampanye publik
- Sidebar transparansi:
  - **Terkumpul** naik sesuai donasi
  - **Biaya Operasional** = 5% dari donasi
  - **Sisa Dana** = Terkumpul - Operasional

#### f. Buat Pencairan
- Login sebagai admin
- Buka `/admin/disbursements/new`
- Isi form (kampanye, jumlah, kategori, penerima)
- Submit
- Verifikasi pencairan muncul di list dengan status **Rencana**

#### g. Upload Bukti Pencairan
- Klik **Detail** pada pencairan
- Ubah status ke **Dicairkan**
- Upload bukti (pilih jenis, upload file)
- Verifikasi bukti muncul di list dengan link "Lihat"
- Ubah status ke **Dilaporkan**

#### h. Campaign Update & Email
- Buka `/admin/campaign-updates/new`
- Isi form (kampanye, judul, isi)
- Submit
- Buka browser console (F12)
- Verifikasi log: `=== Campaign Update Email Notification ===` dengan daftar email donatur

#### i. Export CSV
- Buka `/admin/donations`
- Klik **📥 Export CSV**
- Verifikasi file terdownload dan format CSV benar

### 5. Check Obsidian Vault
```bash
# Regenerate docs
npm run gen:docs
```
- Verifikasi `obsidian-vault/docs/routes.md`, `migrations.md`, `database-schema.md` ter-update
- Buka Obsidian → folder vault → cek file terlihat

## Related Files
- `jest.config.cjs`
- `tests/helpers/donationHelper.ts`
- `tests/donationFlow.test.ts`
- `tests/disbursementFlow.test.ts`
- `package.json` (updated with test script)

## Decisions & Notes
- **Jest environment**: node (tidak jsdom) untuk integrasi tests DB-heavy
- **Test helper**: `createDonation()` untuk reusable donor+donation creation
- **Type safety**: forced null checks dengan `!` + type guards untuk TypeScript compliance
- **No mocking**: tests run against real Supabase (lokal atau cloud project per env)
- **Async/await**: semua tests async, Jest auto-wait
- **Storage bucket**: test verifikasi bucket `disbursement-proofs` exists (tidak upload file actual)

## Blockers / Known Issues
- None – build & tests lulus semua

## Links
- [[Tahap 5: Dashboard & Pencairan]]
- [[Tahap 5.1: Obsidian Vault Setup]]
- [[Testing Guide]]
