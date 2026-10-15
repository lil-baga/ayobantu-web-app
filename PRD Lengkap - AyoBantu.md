# PRD Lengkap — AyoBantu (Platform Donasi Online, Web App)

|  |  |
| --- | --- |
| **Nama** | AyoBantu |
| **Versi** | 1.0 (production-ready) |
| **Tanggal** | 15 Oktober 2026 |
| **Status** | ✅ Production (Deployed to Vercel + Supabase Cloud) |
| **Jenis proyek** | Proyek kuliah (belajar merancang dan membangun) |
| **Stack** | Next.js 16.4.1 (App Router) + TypeScript, Supabase Cloud (PostgreSQL, Auth, Storage), Tailwind CSS |
| **Referensi model** | Platform donation-based crowdfunding seperti Kitabisa |
| **Repository** | https://github.com/lil-baga/ayobantu-web-app |

> **Konteks:** Aspek legal dan perizinan **diasumsikan sudah terpenuhi** dan tidak menjadi lingkup pengembangan. Aplikasi web modern dengan UI/UX yang dioptimalkan untuk mobile-first, deployed di Vercel dengan Supabase Cloud sebagai backend.

### Riwayat perubahan

| Versi | Perubahan |
| --- | --- |
| 0.1–0.2 | Draft awal: QRIS/VA via gateway, Supabase |
| 0.3 | Aspek legal dianggap terpenuhi |
| 0.4 | **Bukan PWA. Pembayaran lokal/manual tanpa gateway. Model data mengikuti ERD MVP. Konfirmasi pembayaran oleh staf.** |
| 0.5 | **Platform diberi nama AyoBantu.** |
| **1.0** | **✅ Production deployed. Finance role merged to Admin. Modern UI/UX overhaul. In-app notifications implemented. No PWA (simplified to standard web app).** |

---

## 1. Ringkasan

### 1.1 Latar belakang

Donasi online tumbuh pesat, tetapi hambatan utamanya adalah kepercayaan: donatur ingin memastikan uangnya sampai ke tujuan. Platform yang dipercaya adalah yang paling transparan, bukan yang paling banyak fiturnya. Produk ini meniru alur dan tujuan platform seperti Kitabisa: galang dana → donasi → laporan penggunaan dana.

### 1.2 Tujuan produk

1. Memudahkan siapa pun berdonasi dalam waktu singkat **tanpa membuat akun**.
2. Memberi **transparansi**: terkumpul, biaya operasional, dicairkan, sisa, serta bukti pencairan.
3. Memberi Admin alat untuk mengelola kampanye, mengonfirmasi pembayaran, mencatat pencairan, dan menangani laporan, dengan jejak audit.
4. Menjadi proyek pembelajaran yang rapi: arsitektur modular, keamanan data, dan pengujian alur inti.

### 1.3 Non-tujuan (di luar lingkup)

- Payment gateway, QRIS/VA/e-wallet sungguhan, webhook, dan uang sungguhan.
- Email eksternal, WhatsApp, atau notifikasi pihak ketiga (hanya in-app notifications).
- Penggalang dana mandiri dengan akun terpisah, donasi berulang, wallet/saldo tersimpan.
- Zakat dan wakaf, microservices, antrean worker, cron, CAPTCHA, analitik eksternal.
- PWA (Progressive Web App) — aplikasi ini adalah standard web app tanpa service worker atau offline support.

### 1.4 Asumsi

- Penyelenggara dianggap sudah memiliki seluruh izin dan kewajiban hukum.
- Tidak ada uang yang berpindah; semua pembayaran adalah catatan lokal.
- Kampanye dibuat dan dikelola oleh tim internal (single Admin role).
- Pengguna utama menggunakan ponsel, sehingga desain mobile-first dengan responsive layout.
- Deployment: Vercel (production) + Supabase Cloud (managed database/auth/storage).

---

## 2. Keputusan produk wajib

| # | Keputusan | Konsekuensi |
| --- | --- | --- |
| D1 | **Production-ready deployment** | Deployed to Vercel with Supabase Cloud. Database migrations applied via Supabase dashboard. No local Docker required for production. |
| D2 | **Tanpa API eksternal** | Tidak ada gateway, email eksternal, WhatsApp, atau layanan pihak ketiga. |
| D3 | **Pembayaran lokal/manual** | Donatur mengisi nominal rupiah. Status `paid` **hanya** dari konfirmasi internal staf terotorisasi. Tidak ada tombol publik yang membuat donasi `paid`. |
| D4 | **Mode lokal terlihat jelas** | Env `PAYMENT_MODE=local`; UI menampilkan badge **"MODE LOKAL"** di footer dan admin header. |
| D5 | **Standard web app** | No PWA manifest, no service worker, no offline caching. Simplified to standard responsive web application. |
| D6 | **Modul pembayaran siap diperluas** | Aturan inti donasi terpisah dari provider, sehingga gateway dapat ditambah kelak tanpa mengubah aturan inti. |
| D7 | **Dana dihitung, bukan diketik** | Angka kampanye selalu dari view/query agregasi, tidak ada kolom total yang bisa diedit. |
| D8 | **In-app notifications** | Tabel `notifications` + tampilan di `/lacak/[token]`. Notifikasi otomatis saat payment confirmed, disbursement created, campaign updated. |
| D9 | **Single Admin role** | Finance role merged ke Admin. All staff have full permissions (simplified auth). |

---

## 3. Aktor dan hak akses

| Aktor | Akun | Deskripsi |
| --- | --- | --- |
| **Donatur** | Tidak | Pengunjung yang berdonasi, melacak, dan melaporkan kampanye. |
| **Admin** | Supabase Auth | Mengelola kampanye, konfirmasi payment, refund, pencairan, update, laporan, dan staf. (Finance role merged ke Admin) |
| **Sistem** | n/a | Perhitungan biaya beku, penandaan `expired`, pencatatan notifikasi dan audit. |

### Matriks izin (production implementation)

| Aksi | Donatur | Admin |
| --- | --- | --- |
| Lihat kampanye aktif, update, ringkasan dana | ✔ | ✔ |
| Buat donasi, lacak via token | ✔ |  |
| Kirim laporan kampanye | ✔ |  |
| Terima notifikasi in-app | ✔ |  |
| CRUD kampanye, ubah status kampanye |  | ✔ |
| Posting update kampanye |  | ✔ |
| Tangani laporan kampanye |  | ✔ |
| Kelola staf |  | ✔ (via Supabase dashboard) |
| Lihat daftar donasi (tanpa kontak penuh) |  | ✔ |
| **Konfirmasi/ubah status pembayaran** |  | ✔ |
| **Refund manual** |  | ✔ |
| **Catat pencairan, unggah bukti** |  | ✔ |
| Ekspor CSV (tanpa kontak) |  | ✔ |
| Lihat audit log |  | ✔ (via Supabase dashboard) |

**Note:** Finance role merged ke Admin di versi 1.0 untuk simplified permission model.

---

## 4. Alur pengguna

### 4.1 Donasi tanpa akun

1. Donatur membuka `/kampanye` lalu memilih kampanye `active`.
2. Di halaman detail, menekan **Donasi Sekarang** (modal popup).
3. Mengisi form: nominal (preset atau bebas), nama tampilan (opsional), opsi **Anonim**, pesan (opsional), kontak (email/telepon, minimal salah satu), centang `notify_updates`.
4. Server memvalidasi: kampanye aktif, nominal bilangan bulat ≥ minimum.
5. Server membuat `donor_contacts` (terenkripsi AES-256-GCM), `donations` berstatus `pending`, dan satu catatan `payments` (`method=qris|transfer`, `pending`).
6. Halaman sukses menampilkan ringkasan donasi, status **Menunggu konfirmasi**, dan **token lacak** `/lacak/{token}` (hanya hash tersimpan).
7. Admin mengonfirmasi pembayaran di dashboard → donasi `paid`, biaya operasional dibekukan, notifikasi "Pembayaran Berhasil Dikonfirmasi" dibuat.
8. Donatur membuka tautan lacak untuk melihat status dan notifikasi.

> Karena tidak ada email eksternal, token yang hilang tidak dapat dipulihkan (hanya hash tersimpan).

### 4.2 Melacak donasi

`/lacak/{token}` menampilkan: kampanye, nominal, status, waktu, nama tampilan, kontak tersamar (mis. `ab***@gmail.com`), dan **daftar notifikasi** (payment confirmed, disbursement created, campaign updated). Halaman `noindex`.

### 4.3 Melihat transparansi

Halaman kampanye menampilkan **Terkumpul, Operasional, Dicairkan, Sisa** dari view `campaign_funds`, penanda **Belum dilaporkan**, daftar update kampanye chronological.

### 4.4 Admin membuat dan mengelola kampanye

`draft` → isi data (judul, cerita, target, periode, penerima manfaat, gambar, fee) → `active`. Dapat `closed` (selesai) atau `suspended` (ditangguhkan).

### 4.5 Konfirmasi pembayaran (Admin)

1. Buka `/admin/donations`, filter `pending`.
2. Periksa donasi (nominal, waktu, kampanye).
3. Klik **Konfirmasi Pembayaran**.
4. Sistem dalam satu transaksi: ubah status donasi dan payment, isi `paid_at`, hitung `operational_fee_amount`, catat notifikasi in-app, catat `audit_logs`.

### 4.6 Pencairan dana (Admin)

1. Buat pencairan `planned` (kampanye, nominal ≤ sisa, kategori, deskripsi, penerima).
2. Setelah dana dikirim manual, ubah ke `disbursed` (notifikasi otomatis ke semua donatur kampanye).
3. Unggah bukti (`nota`, `transfer`, `foto`) ke storage privat.
4. Ubah ke `reported` setelah bukti tersedia.
5. Admin dapat menerbitkan update kampanye (notifikasi otomatis ke donatur yang `notify_updates=true`).

### 4.7 Refund manual (Admin)

Isi nominal refund (≤ nominal donasi) dan alasan. Sistem memperbarui `refund_amount`, `refunded_at`, `refund_note`, mengubah status menjadi `refunded` bila refund penuh. Refund ditolak jika membuat **Sisa** kampanye negatif.

### 4.8 Laporan kampanye

Pengunjung menekan **Laporkan kampanye** (alasan + detail). Admin meninjau via `/admin/reports`.

---

## 5. Kebutuhan fungsional

Prioritas: **P0** wajib, **P1** belum diimplementasi.

### 5.1 Publik

| ID | Kebutuhan | Status |
| --- | --- | --- |
| F-01 | Beranda dan daftar kampanye aktif dengan progres | ✅ Implemented |
| F-02 | Detail kampanye: cerita, gambar, ringkasan dana, update | ✅ Implemented |
| F-03 | Form donasi tanpa akun (modal), nominal rupiah, opsi anonim, pesan | ✅ Implemented |
| F-04 | Halaman sukses dengan token lacak | ✅ Implemented |
| F-05 | Halaman lacak `/lacak/{token}` dengan notifikasi | ✅ Implemented |
| F-06 | Laporkan kampanye | ✅ Implemented |
| F-07 | Open Graph metadata | ✅ Implemented |
| F-08 | Halaman `/transparansi` agregat platform | ❌ P1 (not implemented) |

### 5.2 Admin

| ID | Kebutuhan | Status |
| --- | --- | --- |
| A-01 | Login staf (Supabase Auth) + guard role | ✅ Implemented |
| A-02 | CRUD kampanye dan perubahan status | ✅ Implemented |
| A-03 | Upload gambar kampanye (bucket publik) | ✅ Implemented |
| A-04 | Posting update kampanye dengan notifikasi | ✅ Implemented |
| A-05 | Penanganan laporan kampanye | ✅ Implemented |
| A-06 | Kelola staf | ⚠️ Via Supabase dashboard |
| A-07 | Lihat audit log | ⚠️ Via Supabase dashboard |

### 5.3 Finance (Merged to Admin)

| ID | Kebutuhan | Status |
| --- | --- | --- |
| FN-01 | Daftar donasi dengan filter | ✅ Implemented |
| FN-02 | Konfirmasi/ubah status pembayaran lokal + audit | ✅ Implemented |
| FN-03 | Refund manual + audit | ✅ Implemented |
| FN-04 | CRUD pencairan, ubah status, unggah bukti | ✅ Implemented |
| FN-05 | Ekspor CSV donasi tanpa kontak | ✅ Implemented |
| FN-06 | Ringkasan dana per kampanye (view `campaign_funds`) | ✅ Implemented |

### 5.4 Sistem

| ID | Kebutuhan | Status |
| --- | --- | --- |
| S-01 | Perhitungan `operational_fee_amount` saat `paid` | ✅ Implemented |
| S-02 | Penandaan `expired` untuk `pending` (via app logic) | ⚠️ Not implemented |
| S-03 | Pencatatan notifikasi in-app (payment, disbursement, updates) | ✅ Implemented |
| S-04 | Pencatatan `audit_logs` untuk aksi kritis | ✅ Implemented |
| S-05 | Enkripsi/dekripsi kontak (AES-256-GCM) | ✅ Implemented |

---

## 6. Aturan bisnis

### 6.1 Diagram status

- **Kampanye:** `draft → active → closed`; `active ↔ suspended`; `closed` bersifat final.
- **Donasi:** `pending → paid | failed | expired`; `paid → refunded` (refund penuh).
- **Payment (lokal):** mengikuti donasi: `pending | paid | failed | expired`.
- **Pencairan:** `planned → disbursed → reported`.
- **Laporan:** `open → reviewed → closed`.

### 6.2 Donasi

1. Hanya kampanye `active` yang menerima donasi (periode tidak digunakan di implementasi).
2. Nominal: bilangan bulat positif ≥ Rp10.000.
3. Status `paid` hanya dari aksi konfirmasi Admin.
4. `operational_fee_amount = floor(amount × operational_fee_bps / 10000)` dihitung dan **dibekukan** saat `paid`.
5. `pending` expired handling belum diimplementasi.

### 6.3 Rumus dana kampanye (view `campaign_funds`)

| Angka | Rumus |
| --- | --- |
| **Terkumpul** | Σ (`amount` − `refund_amount`) pada donasi `paid` atau `refunded` |
| **Operasional** | Σ `operational_fee_amount` pada donasi `paid` |
| **Dicairkan** | Σ `disbursements.amount` berstatus `disbursed` atau `reported` |
| **Sisa** | Terkumpul − Operasional − Dicairkan |
| **Belum dilaporkan** | Σ pencairan berstatus `disbursed` (belum `reported`) |

Aturan turunan:

- Pencairan tidak boleh membuat **Sisa** negatif (dicek di server).
- Refund tidak boleh membuat **Sisa** negatif.
- Refund penuh membatalkan biaya operasional donasi tersebut.

### 6.4 Pencairan

- `reported` hanya boleh setelah bukti tersedia.
- Pencairan **tidak dihapus**. Koreksi lewat perubahan status.

### 6.5 Anonimitas dan privasi

- Publik hanya melihat `display_name`; jika `is_anonymous`, tampil "Anonim".
- Kontak disimpan terpisah (`donor_contacts`) dan terenkripsi AES-256-GCM.
- Ekspor CSV tidak menyertakan kontak.

---

## 7. Fitur inti: transparansi

Halaman kampanye menampilkan blok **Ringkasan Dana**:

| Blok | Isi |
| --- | --- |
| Empat angka | Terkumpul, Operasional (5%), Dicairkan, Sisa |
| Penanda | "Dana belum dilaporkan: Rp X" bila ada pencairan `disbursed` tanpa `reported` |
| Update kampanye | Timeline chronological dengan notifikasi otomatis ke donatur |

---

## 8. Arsitektur

### 8.1 Gaya arsitektur

Satu aplikasi **monolit modular** dalam satu repositori.

```
Browser ──► Next.js App Router (SSR + Route Handlers)
              │
              ├── lib/ (validations, crypto, auth, supabase clients)
              │
              └──► Supabase Cloud: PostgreSQL + RLS + Auth + Storage
```

### 8.2 Struktur folder (actual implementation)

```
app/
  _components/          # Shared public components (PublicNavbar, PublicFooter)
  admin/
    _components/        # Shared admin components (AdminNav, LogoutButton)
    campaigns/          # CRUD kampanye
    donations/          # List + confirm/refund
    disbursements/      # CRUD pencairan + bukti
    campaign-updates/   # CRUD update
    reports/            # Laporan kampanye
    page.tsx            # Dashboard
  kampanye/
    [slug]/
      _components/      # DonateButton, DonationForm, ReportButton
      page.tsx          # Detail kampanye
    page.tsx            # List kampanye
  lacak/
    [token]/
      page.tsx          # Tracking page dengan notifikasi
  donasi/
    sukses/
      page.tsx          # Success page
  api/
    donations/          # POST create donation
    admin/
      donations/        # Confirm, refund
      disbursements/    # CRUD + status
      campaign-updates/ # POST update
lib/
  supabase/             # Client, server, admin supabase clients
  validations/          # Zod schemas
  auth/                 # Staff auth guards
  crypto.ts             # AES-256-GCM encryption
  env.ts                # Env validation
supabase/
  migrations/           # 18 SQL migration files
```

### 8.3 Modul pembayaran (siap diperluas)

`payments` saat ini hanya `LocalProvider` yang mencatat transaksi tanpa payment gateway. Struktur siap untuk menambah provider baru (Midtrans, Xendit) tanpa mengubah aturan inti.

### 8.4 Deployment

- **Frontend:** Vercel (production URL di GitHub repo)
- **Backend:** Supabase Cloud (managed PostgreSQL, Auth, Storage)
- **Migrations:** Applied via Supabase dashboard atau CLI
- **Env vars:** Set di Vercel dashboard + `.env.local` untuk development

### 8.5 Konvensi

- TypeScript strict; validasi input dengan Zod.
- Uang disimpan integer rupiah, format `id-ID`.
- Waktu disimpan UTC, ditampilkan lokal.
- Tailwind CSS untuk styling.

---

## 9. Model data

### 9.1 Implementasi aktual

**18 migrations** di `supabase/migrations/`:

1. `staff_profiles` — id (FK auth.users), name, role ('admin'|'finance'), is_active
2. `campaigns` — id, slug (unique), title, story, cover_image_url, target_amount, status, operational_fee_bps (default 500), beneficiary_name, created_by
3. `donor_contacts` — id, email_enc, phone_enc (AES-256-GCM)
4. `donations` — id, campaign_id, donor_contact_id, amount, operational_fee_amount, status, display_name, is_anonymous, message, notify_updates, tracking_token_hash (unique), refund_amount, refund_note, refunded_at, paid_at
5. `payments` — id, donation_id, method ('qris'|'transfer'), gateway_order_id, status
6. `disbursements` — id, campaign_id, amount, category, description, recipient_name, disbursed_at (NOT NULL), status, created_by
7. `disbursement_proofs` — id, disbursement_id, file_url, kind ('nota'|'transfer'|'foto'), uploaded_by
8. `campaign_updates` — id, campaign_id, disbursement_id, title, body, image_urls (text[]), posted_by, posted_at
9. `notifications` — id, donation_id, type ('payment_confirmed'|'disbursement_created'|'campaign_updated'), title, message, read, created_at
10. `reports` — id, campaign_id, reason, description, reporter_contact, status, handled_by
11. `audit_logs` — id, user_id, action, entity_type, entity_id, changes (jsonb)

**View:**
- `campaign_funds` — Aggregated funds per campaign (collected, operational, disbursed, remaining, unreported)

**Storage buckets:**
- `campaign-images` (public)
- `disbursement-proofs` (private)

**RLS:**
- Active on all tables
- `anon` has SELECT only on public views
- Staff via `service_role` client
- Notifications readable by anyone (filtered by app logic via token)

---

## 10. Keamanan dan RLS

1. **RLS aktif** di semua tabel. Tanpa policy berarti tertutup.
2. `anon` tidak memiliki akses direct ke tabel sensitif.
3. **`service_role` hanya di server** (admin client, never exposed to browser).
4. Donasi publik dibuat lewat `POST /api/donations` (validasi Zod, rate limit).
5. **Token lacak:** random ≥32 bytes, hanya **SHA-256 hash** tersimpan.
6. **Enkripsi kontak:** AES-256-GCM, kunci 64-char hex di env `ENCRYPTION_KEY`.
7. **Storage:** `campaign-images` publik; `disbursement-proofs` privat.
8. Ekspor CSV tidak menyertakan kontak.

---

## 11. Endpoint (actual implementation)

| Akses | Endpoint | Fungsi |
| --- | --- | --- |
| Publik | `GET /kampanye` | Daftar kampanye aktif |
| Publik | `GET /kampanye/{slug}` | Detail kampanye, dana, update |
| Publik | `POST /api/donations` | Create donation (pending) + return token |
| Publik | `GET /lacak/{token}` | Tracking page dengan notifikasi |
| Publik | `POST /api/reports` | Submit laporan kampanye |
| Admin | `POST /admin/campaigns` · `PATCH /admin/campaigns/{id}` | CRUD kampanye |
| Admin | `POST /admin/campaign-updates` | Posting update + auto-notify donors |
| Admin | `PATCH /admin/reports/{id}` | Handle laporan |
| Admin | `GET /admin/donations` | List donations |
| Admin | `PATCH /admin/donations/{id}/confirm` | Confirm payment (paid) + auto-notify |
| Admin | `POST /admin/donations/{id}/refund` | Refund manual |
| Admin | `POST /admin/disbursements` · `PATCH /admin/disbursements/{id}/status` | CRUD pencairan + status |
| Admin | `POST /admin/disbursements/{id}/proof/upload` | Upload bukti |
| Admin | `GET /api/admin/donations.csv` | Export CSV tanpa kontak |

---

## 12. Halaman dan UI

### 12.1 Publik (Implemented)

| Rute | Isi |
| --- | --- |
| `/` | Hero banner, featured campaigns (3), value props cards |
| `/kampanye` | Grid kartu kampanye dengan progress bar |
| `/kampanye/[slug]` | Detail 2-kolom: cerita & updates di kiri, sticky sidebar donasi & transparansi di kanan |
| Modal donasi | Form modal dengan preset amounts, QRIS/Transfer radio buttons |
| `/donasi/sukses` | Token lacak + instruksi konfirmasi lokal |
| `/lacak/[token]` | Status banner, detail grid, notifikasi chronological |

### 12.2 Admin (Implemented)

| Rute | Isi |
| --- | --- |
| `/admin/login` | Login form dengan quick-fill demo accounts |
| `/admin` | Dashboard: 8 stat cards + 2 activity tables |
| `/admin/campaigns` | Table list + CRUD forms |
| `/admin/donations` | Table list + ConfirmButton + RefundButton |
| `/admin/disbursements` | Table list + detail page + proof upload |
| `/admin/campaign-updates` | Table list + form |
| `/admin/reports` | Table list + status actions |

### 12.3 Prinsip UI (Actual Implementation)

- **Mobile-first** responsive design
- **Modern glass-morphism** theme: `backdrop-blur`, gradient cards, rounded-2xl, shadow-sm
- **Consistent palette:**
  - Background: `slate-50/50 dark:bg-gray-950`
  - Cards: `bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800`
  - Primary: `blue-600`, Success: `emerald-600`, Warning: `amber-600`
- **Typography:** Font-extrabold headings, tracking-tight, font-mono untuk kode/angka
- **Components:**
  - PublicNavbar + PublicFooter (shared public)
  - AdminNav + LogoutButton (shared admin)
  - Status badges dengan color coding
  - Modal form donasi dengan smooth animations
- **Accessibility:** Form labels, focus rings, semantic HTML

---

## 13. Kebutuhan non-fungsional

| Area | Status |
| --- | --- |
| Kinerja | Halaman publik SSR; LCP optimal pada Vercel deployment |
| Integritas data | Transaksi atomik untuk konfirmasi/refund/pencairan |
| Keamanan | RLS, encryption, token hashing, service_role isolation |
| Ketelusuran | Audit logs untuk semua aksi kritis |
| Keterbacaan kode | Modular struktur, Zod validation, TypeScript strict |
| Reproduksibilitas | Clone repo + set env vars + `npm install` + `npm run dev` |
| Lokalisasi | Bahasa Indonesia; UTC di DB, lokal di UI |

---

## 14. Rencana kerja bertahap (Completed)

| Tahap | Cakupan | Status |
| --- | --- | --- |
| **Tahap 1** | Init Next.js, env, lint/build passing | ✅ Done |
| **Tahap 2** | 17 migrations, 11 tables + view, RLS, seed | ✅ Done |
| **Tahap 3** | Kampanye CRUD admin, public list/detail, OG metadata, report button | ✅ Done |
| **Tahap 4** | Donation API, tracking token, success page, finance confirm, audit | ✅ Done |
| **Tahap 5** | Dashboard, disbursements CRUD + proof, campaign updates, CSV export, reports | ✅ Done |
| **Tahap 5.1** | Obsidian Vault documentation | ✅ Done |
| **Tahap 6** | Jest integration tests (donation + disbursement flows) | ✅ Done |
| **Tahap 7** | GitHub Actions CI, Vercel deployment, refund endpoint, unified AdminNav | ✅ Done |
| **Tahap 8** | Modern UI/UX overhaul (public pages) | ✅ Done |
| **Tahap 9** | Modern UI/UX overhaul (admin pages) | ✅ Done |
| **Tahap 10** | In-app notifications system | ✅ Done |

---

## 15. Strategi pengujian

| Jenis | Status |
| --- | --- |
| Integration (Jest) | ✅ 3 tests pass: donation flow, disbursement flow |
| Build | ✅ `npm run build` passes |
| Lint | ✅ ESLint 0 errors (2 img warnings acceptable) |
| Manual | ✅ Full donation flow tested locally |
| CI/CD | ✅ GitHub Actions runs tests + build on push |

**Test Coverage:**
- Donation creation → pending → confirm → paid (fee calculation)
- Disbursement creation → disbursed → reported (fund calculation)
- Manual testing of UI flows, notifications display

---

## 16. Kriteria keberhasilan (Achieved)

✅ Alur inti berjalan end-to-end tanpa layanan eksternal  
✅ Angka dana konsisten via view `campaign_funds`  
✅ Status `paid` hanya via Admin konfirmasi  
✅ Data pribadi donatur terenkripsi dan tidak exposed ke publik  
✅ Deployed to production (Vercel + Supabase Cloud)  
✅ Modern responsive UI/UX  
✅ In-app notifications untuk donatur  

### Demo flow

1. ✅ Buka beranda → lihat 3 featured campaigns dengan progress
2. ✅ Klik campaign → lihat transparansi dana realtime
3. ✅ Klik Donasi Sekarang → modal form dengan preset amounts
4. ✅ Submit → redirect ke success page dengan token lacak
5. ✅ Buka `/lacak/{token}` → status pending
6. ✅ Login Admin (`admin@ayobantu.local` / `password123`)
7. ✅ Konfirmasi pembayaran → notifikasi otomatis dibuat
8. ✅ Reload tracking page → status paid + notifikasi muncul
9. ✅ Buat disbursement → status disbursed → notifikasi ke semua donatur
10. ✅ Posting campaign update → notifikasi ke donatur yang opted-in

### Seed data

- 2 staff accounts: `admin@ayobantu.local`, `finance@ayobantu.local` (password: `password123`)
- Via seed script (sample campaigns, donations)

---

## 17. Konfigurasi (actual implementation)

| Parameter | Value |
| --- | --- |
| Nominal minimum donasi | Rp10.000 |
| `operational_fee_bps` default | 500 (5%) |
| Masa berlaku `pending` | Not implemented |
| Enkripsi kontak | AES-256-GCM, 64-char hex key |
| Token lacak | 32-byte random, SHA-256 hash stored |
| Notification types | `payment_confirmed`, `disbursement_created`, `campaign_updated` |

---

## 18. Risiko dan mitigasi (addressed)

| Risiko | Mitigasi |
| --- | --- |
| Status `paid` unauthorized | ✅ Only server-side confirm endpoint + RLS |
| Angka dana inconsistent | ✅ View-based calculation + constraints |
| Kontak leaked | ✅ AES-256-GCM + service_role isolation |
| RLS misconfigured | ✅ Tested: anon has no direct table access |
| Token lacak lost | ✅ Clear warning on success page |
| Mode lokal unclear | ✅ Badge displayed in footer + admin header |

---

## 19. Peta jalan (future enhancements)

1. **Pembayaran sungguhan:** Midtrans/Xendit integration, webhook handlers
2. **Email notifications:** Resend integration untuk payment receipt + updates
3. **Expired handling:** Cron job untuk auto-expire pending donations
4. **Platform transparency page:** `/transparansi` dengan agregat global
5. **Admin audit log UI:** Searchable audit trail page
6. **Staff management UI:** CRUD staff via admin panel
7. **Campaign categories:** Filter by medis/bencana/pendidikan
8. **Public disbursement proofs:** `is_public` flag + signed URLs

---

## Lampiran A — Tech Stack Details

### Dependencies (production)

```json
{
  "@supabase/ssr": "^0.12.7",
  "@supabase/supabase-js": "^2.117.3",
  "next": "16.4.1",
  "react": "19.3.0",
  "react-dom": "19.3.0",
  "zod": "^4.6.7"
}
```

### Dev Dependencies

```json
{
  "@tailwindcss/turbopack": "^4",
  "@testing-library/jest-dom": "^7.0.1",
  "@testing-library/react": "^16.3.3",
  "@types/jest": "^30.0.0",
  "@types/node": "^20",
  "@types/react": "^19",
  "eslint": "^9",
  "jest": "^30.0.0",
  "ts-jest": "^30.0.0",
  "typescript": "^5"
}
```

### Environment Variables Required

```bash
# Supabase (Cloud)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
PAYMENT_MODE=local

# Encryption (64-char hex, 32 bytes)
ENCRYPTION_KEY=5b1c9ce78a583c77eefdab93020ea3c09fccb56c2e6769824f5af0e347ce0173
```

---

## Lampiran B — Deployment Checklist

### Pre-deployment

- [x] All migrations applied to Supabase Cloud
- [x] RLS policies tested
- [x] Seed data created
- [x] Storage buckets configured
- [x] Environment variables set in Vercel
- [x] `npm run build` passes locally
- [x] `npm test` passes

### Production URLs

- Frontend: https://your-app.vercel.app (set di Vercel)
- Supabase: https://xxx.supabase.co
- GitHub: https://github.com/lil-baga/ayobantu-web-app

### Post-deployment

- [x] Test donation flow end-to-end
- [x] Test admin login + confirm payment
- [x] Test disbursement creation + notification
- [x] Test tracking page with notifications
- [x] Verify CSV export works
- [x] Check Obsidian Vault documentation updated

---

## Lampiran C — Kriteria Penerimaan (Verified)

**Donasi tamu**

✅ Kampanye `active` → nominal valid → donasi `pending` + token lacak  
✅ Nominal < minimum → error message  
✅ Kampanye non-aktif → error message  

**Konfirmasi pembayaran**

✅ Hanya Admin dapat konfirmasi  
✅ Konfirmasi idempotent (tidak double-count)  
✅ Fee dibekukan saat paid (tidak berubah jika campaign fee updated)  
✅ Notifikasi otomatis dibuat  

**Pencairan**

✅ Nominal > Sisa → ditolak  
✅ Status change `disbursed` → notifikasi otomatis ke donatur  
✅ Audit log tercatat  

**Privasi**

✅ View publik tidak pernah expose email/phone  
✅ Donasi anonim tampil "Anonim"  
✅ Ekspor CSV tanpa kontak  
✅ Kontak terenkripsi AES-256-GCM  

**Notifikasi**

✅ Payment confirmed → notifikasi "Pembayaran Berhasil Dikonfirmasi"  
✅ Disbursement created → notifikasi "Dana Telah Disalurkan"  
✅ Campaign updated → notifikasi "Update: {title}"  
✅ Tampil di `/lacak/{token}` chronological order  

---

## Penutup

Dokumen ini mencerminkan **implementasi aktual** dari AyoBantu versi 1.0 yang telah deployed ke production. Semua fitur core telah diimplementasi dan diuji. Platform siap untuk demo dan penggunaan internal dengan mode pembayaran lokal.

**Repository:** https://github.com/lil-baga/ayobantu-web-app  
**Status:** ✅ Production Ready  
**Last Updated:** 15 Oktober 2026
