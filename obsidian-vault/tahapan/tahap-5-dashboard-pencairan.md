# Tahap 5: Dashboard & Pencairan

## Deskripsi
Implementasi dashboard admin dengan statistik, manajemen pencairan dana, campaign updates, laporan, dan export CSV.

## Requirements
- ✅ Dashboard admin dengan card stats (kampanye, donasi, dana)
- ✅ Manajemen disbursement (buat, ubah status, upload bukti)
- ✅ Campaign updates dengan notifikasi email ke donatur
- ✅ Export CSV donasi tanpa data sensitif
- ✅ Manajemen laporan kampanye dari publik

## Deliverables
- ✅ `app/admin/page.tsx` - Dashboard dengan stats & recent activity
- ✅ `app/admin/disbursements/page.tsx` - List pencairan
- ✅ `app/admin/disbursements/new/page.tsx` - Form buat pencairan
- ✅ `app/admin/disbursements/[id]/page.tsx` - Detail & upload bukti
- ✅ `app/api/admin/disbursements/route.ts` - POST create disbursement
- ✅ `app/api/admin/disbursements/[id]/status/route.ts` - PATCH status
- ✅ `app/api/admin/disbursements/[id]/proof/upload/route.ts` - POST upload proof ke storage
- ✅ `app/admin/campaign-updates/page.tsx` - List updates
- ✅ `app/admin/campaign-updates/new/page.tsx` - Form buat update
- ✅ `app/admin/campaign-updates/[id]/page.tsx` - Detail update
- ✅ `app/api/admin/campaign-updates/route.ts` - POST update dengan email notif
- ✅ `app/api/admin/donations.csv/route.ts` - GET CSV export
- ✅ `app/admin/reports/page.tsx` - List laporan kampanye
- ✅ `app/api/admin/reports/[id]/route.ts` - PATCH status laporan
- ✅ `lib/email.ts` - Email notification stub (console log mode lokal)
- ✅ `lib/validations/disbursement.ts` - Zod schema

## Implementation

### Completed
- ✅ Dashboard query stats parallel: campaigns, donations (total/pending/paid), disbursements, collected amount, disbursed amount
- ✅ Dashboard cards: 8 stat cards dengan icon, warna, format Rupiah
- ✅ Recent activity: 5 donasi terbaru + 5 pencairan terbaru dengan link ke detail
- ✅ Disbursement CRUD: create (planned status), update status (planned → disbursed → reported), upload proof (multipart to Supabase Storage)
- ✅ Proof upload: parse FormData, generate unique filename, upload ke bucket `disbursement-proofs`, insert record ke DB
- ✅ Campaign updates: form dengan campaign_id, title, body, image_urls, disbursement_id; POST ke API → email donatur
- ✅ Email notification: fetch donor emails, decrypt, kirim via `sendCampaignUpdateEmail()` (console log lokal)
- ✅ CSV export: query donations join campaigns/donor_contacts, decrypt email/phone, build CSV dengan proper escaping, set header Content-Disposition
- ✅ Reports management: list dengan status badge, action buttons (Review/Selesai/Kembalikan), PATCH endpoint
- ✅ Build passed setelah type fixes (filter null dengan type guard `e is string`)

## Testing Steps

### 1. Dashboard
- **URL**: `/admin`
- Verifikasi:
  - 8 stat cards tampil dengan angka yang benar (tidak hardcoded)
  - Card "Dana Tersedia" = Total Terkumpul - Total Dicairkan
  - Recent donations table: max 5 entry, ada link "Lihat semua"
  - Recent disbursements table: max 5 entry, ada link "Lihat semua"
  - Tidak ada error di console

### 2. Pencairan (Disbursements)
#### a. Create
- Klik **+ Buat Pencairan** di `/admin/disbursements`
- Isi form: kampanye, jumlah (min 1k), kategori, penerima, deskripsi, tanggal
- Submit → redirect ke list, entry baru muncul dengan status **Rencana**

#### b. Update Status
- Klik **Detail** pada pencairan
- Panel status: tombol Rencana/Dicairkan/Dilaporkan
- Klik **Dicairkan** → konfirmasi → status berubah, tanggal dicairkan terisi
- Panel **Unggah Bukti** muncul setelah status Dicairkan

#### c. Upload Proof
- Pilih jenis: Nota/Transfer/Foto
- Pilih file (image/PDF < 5MB)
- Klik **Unggah** → halaman refresh, bukti muncul di list dengan link "Lihat"
- Klik link → file terbuka di tab baru (Supabase Storage URL)
- Ubah status ke **Dilaporkan** → panel upload hilang

### 3. Campaign Updates
#### a. Create Update
- Buka `/admin/campaign-updates`
- Klik **+ Buat Update**
- Isi: kampanye, judul, isi, URL gambar (comma-separated), ID pencairan (opsional)
- Submit → redirect ke list, entry baru muncul

#### b. Email Notification
- Buka browser console (F12 → Console tab)
- Setelah submit, harus ada log:
  ```
  === Campaign Update Email Notification ===
  Campaign: [judul kampanye]
  Update Title: [judul update]
  Sent to X donors: [list email]
  ```
- Verifikasi jumlah email = jumlah donasi paid untuk kampanye tersebut

#### c. Public View
- Buka halaman kampanye publik `/kampanye/[slug]`
- Scroll ke **Update Kampanye** section
- Update baru muncul dengan tanggal, judul, isi
- Jika ada image_urls, tampil sebagai link

### 4. CSV Export
- Buka `/admin/donations`
- Klik **📥 Export CSV** (tombol hijau)
- File `donasi-YYYY-MM-DD.csv` terdownload
- Buka dengan Excel/LibreOffice/text editor:
  - Header: ID, Kampanye, Nama Donatur, Email, Telepon, Jumlah, Status, Tanggal Donasi, Tanggal Bayar
  - Email/phone ter-decrypt (tidak encrypted), atau `-` jika kosong
  - Tidak ada error parsing CSV

### 5. Reports Management
- Buka `/admin/reports`
- Tabel tampil dengan kolom: Kampanye, Alasan, Deskripsi, Dilaporkan Oleh, Status, Tanggal, Aksi
- Untuk report **pending**:
  - Klik **Review** → status berubah ke **reviewed**
  - Klik **Selesai** → status berubah ke **closed**
- Untuk report **closed**:
  - Klik **Kembalikan** → status kembali ke **reviewed**
- Tidak ada error API

### 6. Build & Lint
```bash
npm run build
npm run lint
```
- Build harus pass (TypeScript no errors)
- Lint warnings boleh, errors tidak boleh

## Related Files
- `app/admin/page.tsx`
- `app/admin/disbursements/**`
- `app/admin/campaign-updates/**`
- `app/admin/reports/**`
- `app/api/admin/disbursements/**`
- `app/api/admin/campaign-updates/route.ts`
- `app/api/admin/donations.csv/route.ts`
- `app/api/admin/reports/[id]/route.ts`
- `lib/email.ts`
- `lib/validations/disbursement.ts`

## Decisions & Notes
- **Dashboard stats**: parallel query dengan `Promise.all()` untuk performance
- **Disbursement proof upload**: gunakan Supabase Storage API, private bucket, signed URL untuk akses
- **Email notification**: mode lokal = console.log; production = ganti dengan SendGrid/SMTP
- **CSV export**: decrypt donor contacts untuk admin, tapi mask dengan format readable (tidak full expose)
- **Status flow disbursement**: planned → disbursed → reported (one-way, kecuali admin bisa rollback manual)
- **Report actions**: hanya admin yang bisa handle reports (finance tidak bisa)

## Links
- [[Tahap 4: Donasi & Pembayaran]]
- [[Tahap 5.1: Obsidian Vault Setup]]
- [[Tahap 6: Testing & Verifikasi]]
- [[Database Schema]]
