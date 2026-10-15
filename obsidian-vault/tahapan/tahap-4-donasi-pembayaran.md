# Tahap 4: Donasi & Pembayaran Lokal

## Deskripsi
Implementasi alur donasi lokal tanpa gateway pembayaran real. Finance staff melakukan konfirmasi manual untuk mengubah status donasi dari "pending" ke "paid".

## Requirements
- ✅ Form donasi publik di `/kampanye/[slug]`
- ✅ API endpoint POST `/api/donations` untuk create donation
- ✅ Halaman sukses dengan tracking token
- ✅ Halaman tracking `/lacak/[token]`
- ✅ Admin panel `/admin/donations` dengan list dan tombol konfirmasi
- ✅ Finance dapat konfirmasi via PATCH endpoint
- ✅ Enkripsi data kontak donor (email/phone)
- ✅ Audit log untuk setiap perubahan status
- ✅ Biaya operasional otomatis dihitung (5%)

## Deliverables
- ✅ `app/kampanye/[slug]/_components/DonationForm.tsx` - Form client-side dengan validasi Zod
- ✅ `app/api/donations/route.ts` - API create donation
- ✅ `app/donasi/sukses/page.tsx` - Success page dengan token & instruksi lokal
- ✅ `app/lacak/[token]/page.tsx` - Tracking page dengan status, kontak masked, audit log
- ✅ `app/admin/donations/page.tsx` - Admin list donasi dengan mask kontak
- ✅ `app/admin/donations/_components/ConfirmButton.tsx` - Client button konfirmasi
- ✅ `app/api/admin/donations/[id]/confirm/route.ts` - Finance confirmation endpoint
- ✅ `lib/validations/donation.ts` - Zod schema validasi
- ✅ `lib/crypto.ts` - Enkripsi AES-256-GCM untuk kontak donor

## Implementation

### Completed
- ✅ DonationForm component dengan field: amount, displayName, isAnonymous, email/phone, message
- ✅ POST `/api/donations`: buat donor_contacts (encrypted), donation (pending), payment (local mode), tracking token (SHA256 hash)
- ✅ Success page: tampil tracking link, instruksi mode lokal, timer countdown
- ✅ Tracking page: tampil detail donasi, status badge, kontak ter-mask, audit log, payment info
- ✅ Admin donations list: fetch donations dengan join campaigns/donor_contacts/payments, mask email/phone via decrypt
- ✅ Finance confirm button: PATCH status → paid, update paid_at, hitung operational fee (5%), insert receipt notification, audit log
- ✅ Type casting fix untuk Supabase joins (array → single object dengan `?.[0]`)
- ✅ Build passed setelah semua fix type errors

## Testing Steps

1. **Buat Donasi Publik**
   - Buka halaman kampanye `/kampanye/[slug]`
   - Klik tombol **Donasi Sekarang**
   - Isi form: jumlah (min 10k), nama, email, pesan
   - Submit → redirect ke `/donasi/sukses`
   - Copy tracking token link
   - Verifikasi instruksi mode lokal muncul

2. **Tracking Donasi**
   - Buka link tracking `/lacak/[token]`
   - Verifikasi:
     - Status badge: **pending** (yellow)
     - Jumlah donasi tampil
     - Kontak email/phone ter-mask (jika diisi)
     - Payment info: method "local", status "pending"
     - Audit log: entry "create" oleh sistem
   - Tidak ada error atau missing data

3. **Finance Konfirmasi**
   - Login sebagai finance (`/admin/login`)
   - Buka `/admin/donations`
   - Verifikasi donasi baru muncul di tabel
   - Email/phone ter-mask dengan format `b***@example.com` atau `+62***456`
   - Klik tombol **Konfirmasi Pembayaran**
   - Status berubah menjadi **paid** (green)
   - Halaman reload, entry "confirm_payment" di audit log

4. **Verifikasi Dana Kampanye**
   - Buka halaman kampanye `/kampanye/[slug]`
   - Sidebar transparansi:
     - **Terkumpul** naik sesuai donasi
     - **Biaya Operasional** bertambah 5% dari donasi
     - **Sisa Dana** = Terkumpul - Operasional - Dicairkan
   - Tidak ada dana negatif atau inkonsistensi

## Related Files
- `app/kampanye/[slug]/_components/DonationForm.tsx`
- `app/api/donations/route.ts`
- `app/donasi/sukses/page.tsx`
- `app/lacak/[token]/page.tsx`
- `app/admin/donations/page.tsx`
- `app/admin/donations/_components/ConfirmButton.tsx`
- `app/api/admin/donations/[id]/confirm/route.ts`
- `lib/validations/donation.ts`
- `lib/crypto.ts`
- `lib/auth/staff.ts`

## Decisions & Notes
- **Mode lokal**: tidak ada integrasi payment gateway real; finance manual konfirmasi via UI
- **Enkripsi donor**: AES-256-GCM dengan key dari `ENCRYPTION_KEY` env var; hash SHA256 untuk tracking token
- **Biaya operasional**: 5% otomatis terpotong saat konfirmasi; dapat dikonfigurasi via env
- **Type casting**: Supabase join mengembalikan array meskipun 1:1; selalu gunakan `?.[0]` atau handle array
- **Tracking token**: SHA256 hash disimpan di DB untuk lookup, plaintext token hanya dikirim ke donatur sekali
- **RLS bypass**: gunakan `createAdminClient()` untuk operasi staff; `createClient()` untuk publik

## Links
- [[Tahap 3: Kampanye]]
- [[Tahap 5: Dashboard & Pencairan]]
- [[Database Schema]]
