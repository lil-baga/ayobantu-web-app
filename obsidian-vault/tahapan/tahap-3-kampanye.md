# Tahap 3: Kampanye

## Deskripsi
Implementasi CRUD kampanye, publikasi kampanye, halaman detail kampanye, daftar kampanye, dan integrasi dengan donasi.

## Requirements
- ✅ Public list page `/kampanye`
- ✅ Detail page `/kampanye/[slug]`
- ✅ Admin CRUD (list, create, edit, delete) di `/admin/campaigns`
- ✅ Campaign cover image upload (Supabase storage bucket `campaign-images`)
- ✅ SEO metadata (title, description, og:image)
- ✅ Campaign calculations: target amount, collected, operational fee, disbursed, remaining, unreported
- ✅ RLS: publik dapat read kampanye yang status `active`
- ✅ Staff (admin/finance) dapat create/update/delete kampanye
- ✅ Audit log untuk setiap perubahan kampanye

## Deliverables
- ✅ `app/kampanye/page.tsx` - Public list dengan pagination
- ✅ `app/kampanye/[slug]/page.tsx` - Detail page, progress bar, donation form, update section, transparency panel
- ✅ `app/admin/campaigns/page.tsx` - Admin list with status badges
- ✅ `app/admin/campaigns/new/page.tsx` - Form buat kampanye baru (title, slug, story, target, cover image)
- ✅ `app/admin/campaigns/[id]/edit/page.tsx` - Edit form pre‑filled
- ✅ `app/admin/campaigns/_components/CampaignForm.tsx` - Reusable form component
- ✅ `app/api/admin/campaigns/route.ts` - POST create campaign
- ✅ `app/api/admin/campaigns/[id]/route.ts` - PATCH update, DELETE remove
- ✅ `lib/validations/campaign.ts` - Zod schema untuk kampanye
- ✅ `lib/crypto.ts` - Image upload util (Supabase storage)
- ✅ RLS policies for campaigns (public read active, staff full access)
- ✅ Audit log entries on create/update/delete

## Implementation

### Completed
- ✅ **Public list** (`app/kampanye/page.tsx`): fetch campaigns where status='active', paginasi simple, card view dengan cover image.
- ✅ **Detail page** (`app/kampanye/[slug]/page.tsx`):
  - Fetch campaign data + `campaign_funds` view for calculations.
  - Render metadata (title, description, og image) via `generateMetadata`.
  - Show cover image, story, progress bar (percentage).
  - Include **DonationForm** component (already built in Tahap 4).
  - Show **Campaign Updates** section (list of recent updates, fetched from `campaign_updates`).
  - Transparency panel: collected, operational, disbursed, remaining, unreported.
  - Report button (`ReportButton` component) untuk publik melaporkan kampanye.
- ✅ **Admin list** (`app/admin/campaigns/page.tsx`):
  - Table dengan kolom: Judul, Slug, Status badge, Target, Dibuat, Aksi (Edit/Delete).
  - Badge warna: active (green), draft (yellow), closed (gray).
- ✅ **Create/Edit forms** (`app/admin/campaigns/new/page.tsx`, `app/admin/campaigns/[id]/edit/page.tsx`):
  - Reuse `CampaignForm` component.
  - Image upload: pilih file → upload to Supabase bucket `campaign-images` → store public URL in `cover_image_url`.
- ✅ **API endpoints**:
  - POST `/api/admin/campaigns` – parse Zod schema, insert, return created record.
  - PATCH `/api/admin/campaigns/[id]` – update fields (title, story, target, cover_image_url, status).
  - DELETE `/api/admin/campaigns/[id]` – soft delete (set status='closed') + audit log.
- ✅ **Zod validation** (`lib/validations/campaign.ts`): required fields, slug format, target amount positive integer.
- ✅ **RLS**:
  - `public_read_active` policy on `campaigns` (allow SELECT where status='active').
  - `admin_full_access` policy on `campaigns` (allow all ops for role `admin`).
  - `finance_full_access` policy (allow all ops for role `finance`).
- ✅ **Audit log**: Insert on each create/update/delete with `action` field (`create`, `update`, `delete`).

## Testing Steps

1. **Public List**
   - Buka `/kampanye`.
   - Pastikan hanya kampanye dengan `status='active'` muncul.
   - Klik kartu kampanye → navigasi ke detail page.

2. **Detail Page**
   - Verifikasi metadata (title, description, og image) di source page.
   - Progress bar mengisi sesuai `collected / target` (capped 100%).
   - Transparency panel menampilkan angka yang konsisten dengan `campaign_funds` view.
   - Donation form muncul dan dapat di‑submit (Tahap 4 flow).
   - Updates section menampilkan list update (max 10) dari DB.
   - Report button dapat klik → buka laporan modal (atau redirect ke report page).

3. **Admin CRUD**
   - Login sebagai admin (`/admin/login`).
   - Buka `/admin/campaigns` → tabel list kampanye.
   - Klik **+ Buat Kampanye** → isi semua field termasuk upload cover image (png/jpg < 2 MB).
   - Submit → redirect ke list, entry baru muncul dengan badge **active** (default).
   - Klik **Edit** → form ter‑prefill, ubah title atau target, submit → data berubah di list.
   - Klik **Delete** → konfirmasi → status berubah ke **closed**, tidak muncul lagi di publik.
   - Cek audit_log table: ada 3 entri (create, update, delete) dengan `entity_type='campaign'`.

4. **RLS Enforcement**
   - Dengan anonim (tanpa auth), query `/api/admin/campaigns` → harus **403** (admin route protected).
   - Public fetch kampanye via `/api/public/campaigns` (internal) – hanya yang `active`.
   - Finance login, edit campaign – harus berhasil (role finance allowed).

5. **Image Upload**
   - Pada form create/edit, pilih file `cover.jpg`.
   - Submit → after response, check Supabase Storage bucket `campaign-images` – file ada, URL stored in DB.
   - Public list page displays image via that URL.

6. **Build & Lint**
   ```bash
   npm run build
   npm run lint
   ```
   - No TypeScript errors, lint warnings acceptable.

## Related Files
- `app/kampanye/**`
- `app/admin/campaigns/**`
- `app/api/admin/campaigns/**`
- `lib/validations/campaign.ts`
- `lib/crypto.ts` (image upload helper)
- `supabase/migrations/*campaigns*`
- `supabase/migrations/*rls*`
- `supabase/migrations/*triggers*`

## Decisions & Notes
- **Slug generation**: admin must provide unique slug (validated via Zod + DB unique constraint).
- **Cover image**: stored public, no extra auth needed; CDN caching via Supabase.
- **Progress calculation**: derived from `campaign_funds` view (collected/target) – ensures fee & disbursement accounted.
- **RLS**: using `jwt.claims.role` for staff; public read limited to active campaigns.
- **Audit**: store `changes` JSON with before/after snapshot (optional, simplified to passed fields).
- **SEO**: `generateMetadata` adds Open Graph image from campaign cover.

## Links
- [[Tahap 2: Database & Auth]]
- [[Tahap 4: Donasi & Pembayaran]]
- [[Database Schema]]
