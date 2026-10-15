# Tahap 2: Database & Auth

## Deskripsi
Setup database schema lengkap, migrasi, RLS policies, storage buckets, seed data, dan autentikasi staff (admin/finance).

## Requirements
- ✅ 17 file migrasi SQL
- ✅ 11 tabel + 1 view + 2 storage buckets
- ✅ RLS policies pada semua tabel
- ✅ Triggers: `update_updated_at`, `donation_after_payment`
- ✅ Enkripsi donor contacts (AES-256-GCM)
- ✅ Auth staff dengan JWT role claims
- ✅ Seed data: 1 admin, 1 finance, 3 kampanye sample

## Deliverables
- ✅ `supabase/migrations/20240101000001_create_staff_profiles.sql`
- ✅ `supabase/migrations/20240101000002_create_campaigns.sql`
- ✅ `supabase/migrations/20240101000003_create_donations.sql`
- ✅ `supabase/migrations/20240101000004_create_donor_contacts.sql`
- ✅ `supabase/migrations/20240101000005_create_payments.sql`
- ✅ `supabase/migrations/20240101000006_create_disbursements.sql`
- ✅ `supabase/migrations/20240101000007_create_disbursement_proofs.sql`
- ✅ `supabase/migrations/20240101000008_create_campaign_updates.sql`
- ✅ `supabase/migrations/20240101000009_create_reports.sql`
- ✅ `supabase/migrations/20240101000010_create_receipt_notifications.sql`
- ✅ `supabase/migrations/20240101000011_create_audit_logs.sql`
- ✅ `supabase/migrations/20240101000012_create_campaign_funds_view.sql`
- ✅ `supabase/migrations/20240101000013_create_storage_buckets.sql`
- ✅ `supabase/migrations/20240101000014_create_rls_policies.sql`
- ✅ `supabase/migrations/20240101000015_create_triggers.sql`
- ✅ `supabase/migrations/20240101000016_create_encryption_functions.sql`
- ✅ `supabase/migrations/20240101000017_seed_data.sql`

## Implementation

### Completed
- ✅ **staff_profiles**: id, user_id (auth.uid), name, role (admin/finance), created_at
- ✅ **campaigns**: id, title, slug, story, cover_image_url, beneficiary_name, target_amount, status (draft/active/closed), created_by, created_at, updated_at
- ✅ **donations**: id, campaign_id, amount, display_name, is_anonymous, message, status (pending/paid/failed/refunded), donor_contact_id, tracking_token_hash, created_at, paid_at, refunded_at, refund_amount, refund_note
- ✅ **donor_contacts**: id, email_enc, phone_enc, created_at
- ✅ **payments**: id, donation_id, method (local/manual), gateway_order_id, status (pending/paid/expired/failed), amount, expires_at, paid_at, created_at
- ✅ **disbursements**: id, campaign_id, amount, category, description, recipient_name, status (planned/disbursed/reported), disbursed_at, created_by, created_at
- ✅ **disbursement_proofs**: id, disbursement_id, file_url, kind (nota/transfer/foto), uploaded_by, uploaded_at
- ✅ **campaign_updates**: id, campaign_id, title, body, image_urls, posted_by, posted_at
- ✅ **reports**: id, campaign_id, reason, description, status (pending/reviewed/closed), handled_by, created_at
- ✅ **receipt_notifications**: id, donation_id, email_sent, sent_at, error
- ✅ **audit_logs**: id, user_id, action, entity_type, entity_id, changes, created_at
- ✅ **campaign_funds view**: collected, operational, disbursed, remaining, unreported per campaign
- ✅ **Storage buckets**: campaign-images (public), disbursement-proofs (private)
- ✅ **RLS**: policies untuk public read campaigns, donor insert contacts/donations/payments, staff full access via helper functions
- ✅ **Triggers**: `update_updated_at` untuk updated_at, `donation_after_payment` untuk update campaign_funds
- ✅ **Seed**: 2 admin accounts (admin@ayobantu.local + finance→admin), 3 kampanye aktif

## Testing Steps

1. **Reset Database**
   ```bash
   npm run db:reset
   # atau
   supabase db reset
   ```
   - Migrasi semua berjalan tanpa error
   - Seed data ter-insert

2. **Verifikasi Tabel**
   ```sql
   -- Di Supabase SQL Editor
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```
   - Harus ada 11 tabel + 1 view

3. **Verifikasi Storage**
   - Buka Supabase Dashboard → Storage
   - Bucket `campaign-images` (public) dan `disbursement-proofs` (private) ada

4. **Verifikasi RLS**
   - Coba query `campaigns` tanpa auth → harus bisa read (active only)
   - Coba insert `donations` tanpa auth → harus bisa (public donation)
   - Coba insert `donor_contacts` tanpa auth → harus bisa
   - Coba query `staff_profiles` tanpa auth → harus **gagal** (RLS)

5. **Verifikasi Auth Staff**
   - Login dengan admin@ayobantu.local / password dari seed
   - JWT claim `role` = 'admin'
   - Akses `/admin` → redirect ke dashboard (bukan login)

6. **Verifikasi View campaign_funds**
   ```sql
   SELECT * FROM campaign_funds;
   ```
   - Kolom: campaign_id, collected, operational, disbursed, remaining, unreported
   - Semua numeric, calculated correctly

## Related Files
- `supabase/migrations/*.sql` (17 files)
- `lib/supabase/admin.ts` - Admin client
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `lib/auth/staff.ts` - Staff auth guards
- `lib/crypto.ts` - Encryption helpers
- `lib/env.ts` - Env validation

## Decisions & Notes
- **RLS recursion fix**: gunakan `SECURITY DEFINER` helper functions (`is_admin()`, `is_finance()`) daripada recursive policies
- **Encryption**: `encrypt()` / `decrypt()` di `lib/crypto.ts` menggunakan AES-256-GCM dengan key dari `ENCRYPTION_KEY` (32 bytes base64)
- **Tracking token**: SHA256 hash disimpan di `tracking_token_hash`, plaintext hanya dikirim sekali ke donatur
- **PAYMENT_MODE=local**: payments method = 'local', gateway_order_id = 'local_' + uuid, status manual
- **Operational fee**: 5% (konfigurasi via `OPERATIONAL_FEE_PERCENT` env), dihitung saat finance confirm
- **Supabase CLI**: lokal development, tidak pakai Docker; migrasi apply ke Supabase Cloud project

## Links
- [[Tahap 1: Lokal Setup]]
- [[Tahap 3: Kampanye]]
- [[Database Schema]]