# PRD (Ringkas) — AyoBantu (Platform Donasi Online, Web App)

> Dokumen untuk **Claude Code**. Kerjakan berurutan sesuai Tahap (Bagian 10). Selesaikan satu tahap, jalankan test, lalu berhenti dan laporkan sebelum lanjut.
> Dokumen pendamping: **PRD Lengkap** (`PRD Lengkap - AyoBantu.md`, detail ERD dan aturan). Jika ada pertentangan, PRD Lengkap menjadi acuan.

## 1. Tujuan & konteks
Aplikasi web donasi seperti Kitabisa: orang bisa **berdonasi tanpa akun** dan melihat **laporan transparansi** (terkumpul, biaya operasional, dicairkan, sisa, bukti pencairan). Staf (Admin, Finance) mengelola kampanye, konfirmasi pembayaran, dan pencairan.

Proyek kuliah. Aspek legal/perizinan dianggap sudah terpenuhi, abaikan. **Berbasis web biasa, bukan PWA.**

## 2. Keputusan wajib (prioritas tertinggi)
**2.1 Lokal dulu.** Bangun dan jalankan di lingkungan lokal. Periksa repo/stack yang ada sebelum memilih teknologi. Jangan menambah infrastruktur tanpa kebutuhan. Opsi database lokal: Supabase CLI (`supabase start`, butuh Docker) agar Postgres, Auth, dan Storage berjalan di mesin sendiri.

**2.2 Tanpa API eksternal.** Tidak ada payment gateway, email, WhatsApp, notifikasi pihak ketiga, QRIS/VA/e-wallet sungguhan, atau webhook.

**2.3 Pembayaran lokal/manual.**
- Donatur hanya mengisi nominal rupiah di form. Tidak ada uang yang berpindah.
- Donasi lahir berstatus `pending`. Status `paid` **hanya** dari aksi konfirmasi internal oleh staf terotorisasi. Tidak ada tombol publik yang bisa membuatnya `paid`.
- Metode (`transfer`/`qris`) hanya label pilihan, jangan mengklaim terintegrasi. UI staf harus menampilkan penanda **"MODE LOKAL"** (env var `PAYMENT_MODE=local`).
- Modul `payments` dirancang agar gateway bisa ditambah kelak tanpa mengubah aturan inti, tetapi **jangan membangun integrasinya sekarang**.

**2.4 Bukan PWA.** Jangan buat manifest, service worker, offline cache, atau prompt install. Cukup web responsif (mobile-first), SSR/ISR untuk halaman publik, dan metadata Open Graph untuk berbagi.

**2.5 Notifikasi** hanya dicatat di tabel `notifications` dan/atau ditampilkan di aplikasi (halaman sukses dan halaman lacak). Tidak ada pengiriman.

**2.6 Ditunda:** antrean worker, cron, CAPTCHA, analitik, pemantauan eksternal, microservices, optimasi skala.

## 3. Stack
- Next.js (App Router) + TypeScript strict + Tailwind (atau ikuti stack repo yang sudah ada)
- Supabase: PostgreSQL, Auth (staf), Storage
- Zod untuk validasi; Vitest (unit/integrasi), Playwright (e2e alur donasi)
- Monolit modular, satu repo: `campaigns`, `donations`, `payments`, `disbursements`, `campaign-updates`, `notifications`, `reports`, `audit-logs`, `staff/auth`

## 4. Aktor & hak akses
| Aktor | Akun | Hak (default, dapat disesuaikan) |
|---|---|---|
| Donatur | Tidak | Lihat kampanye, donasi, lacak via token, laporkan kampanye |
| Admin | Supabase Auth | CRUD kampanye + status, posting update, tangani laporan, kelola staf, lihat donasi |
| Finance | Supabase Auth | Konfirmasi pembayaran, refund manual, catat pencairan, unggah bukti, ekspor CSV |

- RLS aktif di semua tabel `public`. `anon` hanya boleh membaca kampanye `active`, update terbit, dan angka dana aman (lewat view).
- Tabel sensitif (`donations`, `donor_contacts`, `payments`, `notifications`, `reports`, `audit_logs`) tertutup untuk `anon`. Akses lewat server dengan otorisasi role.
- **`service_role` hanya di server**, jangan pernah di browser atau `NEXT_PUBLIC_*`.

## 5. Halaman & endpoint
**Publik:** `/` · `/kampanye` · `/kampanye/[slug]` (cerita, update, donatur, ringkasan dana, tombol Laporkan) · `/lacak/[token]` (noindex)
**Staf:** `/admin/login` · `/admin/campaigns` · `/admin/donations` (konfirmasi pembayaran, refund) · `/admin/disbursements` (+ unggah bukti) · `/admin/updates` · `/admin/reports` · `/admin/staff`

| Akses | Endpoint | Fungsi |
|---|---|---|
| Publik | `POST /api/donations` | Validasi, buat donor_contact + donasi `pending` + catatan payment `local`, kembalikan token lacak |
| Publik | `POST /api/reports` | Kirim laporan kampanye |
| Admin | `POST /admin/campaigns`, `PATCH /admin/campaigns/{id}` | Buat/ubah kampanye dan status |
| Admin | `POST /admin/campaign-updates` | Posting update (+ catat notifikasi) |
| Admin | `PATCH /admin/reports/{id}` | Tangani laporan |
| Finance | `PATCH /admin/donations/{id}/payment-status` | Konfirmasi/ubah status pembayaran lokal + audit log |
| Finance | `POST /admin/donations/{id}/refund` | Catat refund manual + audit log |
| Finance | `POST /admin/disbursements`, `POST /admin/disbursements/{id}/proofs` | Catat pencairan, unggah bukti |
| Finance | `GET /admin/donations.csv` | Ekspor tanpa data kontak secara default |

Tidak ada `POST /api/webhooks/payment`.

## 6. Alur
**Donasi:** daftar kampanye → detail (aktif) → form (nominal, nama tampilan opsional, anonim, pesan, kontak, `notify_updates`) → server validasi (kampanye aktif, nominal ≥ minimum) → donasi `pending` → halaman sukses menampilkan **link lacak sekali tampil** (simpan token; hanya hash disimpan) → staf konfirmasi → `paid`, biaya operasional dihitung dan **dibekukan** → catatan notifikasi `receipt` → donatur melihat status di `/lacak/[token]`.

**Pencairan:** Finance buat pencairan `planned` → `disbursed` → unggah bukti (`nota`/`transfer`/`foto`) → boleh `reported` hanya jika bukti wajib ada → Admin boleh posting update terkait.

**Laporan kampanye:** pengunjung kirim → Admin ubah status `open → reviewed → closed`.

## 7. Data model (ringkas)
Aturan: PK `id` UUID; uang `BIGINT` rupiah; `created_at` di semua tabel; FK, constraint, dan indeks dipakai penuh; migrasi lewat `supabase/migrations`.

- `staff_profiles`: id (= auth.users.id), nama, role[`admin`|`finance`], is_active
- `campaigns`: slug unik, title, story, cover_image_url, target_amount, status[`draft`|`active`|`closed`|`suspended`], starts_at, ends_at, operational_fee_bps (500 = 5%, CHECK ≤ 1000), beneficiary_name, created_by
- `donor_contacts`: email_enc, phone_enc (terenkripsi AES-GCM, kunci dari env)
- `donations`: campaign_id, donor_contact_id, amount, operational_fee_amount, status[`pending`|`paid`|`failed`|`expired`|`refunded`], display_name, is_anonymous, message, notify_updates, tracking_token_hash unik, refund_amount, refunded_at, refund_note, paid_at
- `payments`: donation_id, gateway (= `local`), gateway_order_id unik internal, method, gross_amount, status, expires_at, paid_at
- `disbursements`: campaign_id, amount, category, description, recipient_name, disbursed_at, status[`planned`|`disbursed`|`reported`], created_by
- `disbursement_proofs`: disbursement_id, file_url, kind[`nota`|`transfer`|`foto`], uploaded_by, uploaded_at
- `campaign_updates`: campaign_id, disbursement_id?, title, body, image_urls, posted_by, posted_at
- `notifications`: donation_id, campaign_update_id?, type[`receipt`|`update`], channel[`email`|`whatsapp`], status[`queued`|`sent`|`failed`], attempts, error, sent_at
- `reports`: campaign_id, reason, details, reporter_contact?, status[`open`|`reviewed`|`closed`], handled_by?
- `audit_logs`: user_id, action, entity_type, entity_id, changes jsonb (tidak boleh diubah/dihapus)

(`payment_events` dilewati karena tidak ada webhook.)

**Storage:** `campaign-images` (publik), `disbursement-proofs` (privat, signed URL singkat, upload hanya staf).

## 8. Rumus dana (view `campaign_funds`, bukan kolom yang bisa diedit)
- **Terkumpul** = Σ `amount` (status `paid`) − Σ `refund_amount`
- **Operasional** = Σ `operational_fee_amount` (donasi `paid`)
- **Dicairkan** = Σ `disbursements.amount` (status `disbursed`/`reported`)
- **Sisa** = Terkumpul − Operasional − Dicairkan
- **Belum dilaporkan** = Σ pencairan `disbursed` yang belum `reported`

Tampilkan empat angka pertama di halaman kampanye plus penanda dana belum dilaporkan. Pastikan tidak ada hitung ganda. Aturan fee saat refund ditetapkan eksplisit dan dites (default usulan: refund penuh membatalkan fee donasi tersebut).

## 9. Aturan bisnis & keamanan
1. Perubahan status donasi/payment hanya di server, dalam satu transaksi database (donasi + payment + audit log).
2. Konfirmasi ke `paid` idempotent: konfirmasi ulang tidak mengubah biaya atau saldo.
3. `operational_fee_amount = amount × operational_fee_bps / 10000` dihitung saat `paid` dan tidak berubah meski fee kampanye diubah kemudian.
4. Token lacak: acak ≥ 32 byte, simpan hanya hash; `/lacak/[token]` noindex + rate limit sederhana; tampilkan kontak tersamar.
5. Anonim: publik hanya melihat `display_name`; jika `is_anonymous`, tampil "Anonim". Kontak selalu terpisah dan terenkripsi.
6. Pencairan tidak boleh dihapus; koreksi lewat perubahan status/catatan yang diaudit. `reported` mensyaratkan bukti.
7. Semua aksi uang/status kampanye masuk `audit_logs`.
8. Simpan data pribadi seperlunya; sediakan cara menghapus kontak donatur atas permintaan.

## 10. Tahap kerja
1. **Lokal berjalan:** init project, env example, `PAYMENT_MODE=local`, lint/build lulus.
2. **Database & auth:** migrasi, RLS, view `campaign_funds`, login staf + guard role, seed data dummy.
3. **Kampanye:** CRUD admin, daftar dan detail publik, Open Graph.
4. **Donasi & pembayaran lokal:** form, `POST /api/donations`, token lacak, halaman sukses dan lacak, konfirmasi oleh Finance, catatan notifikasi.
5. **Dashboard & pencairan:** daftar donasi, refund, pencairan + bukti, update kampanye, laporan kampanye, ekspor CSV.
6. **Pengujian alur inti.**

## 11. Test wajib
Validasi nominal; status donasi (anon tidak bisa `paid`); konfirmasi lokal + idempotensi; refund; rumus dana (termasuk fee beku); hak akses per role dan RLS (`anon` ditolak ke tabel sensitif); anonimitas; audit log tercatat; `reported` ditolak tanpa bukti; e2e: donasi → konfirmasi → angka dana dan halaman lacak berubah.

## 12. Konfigurasi (default usulan, ubah bila perlu)
Nominal minimum donasi **Rp10.000** · `operational_fee_bps` **500** · masa berlaku `pending` **24 jam** (ditandai `expired` saat diakses/diproses staf, tanpa cron) · retensi kontak donatur **12 bulan** · izin rinci Admin/Finance sesuai Bagian 4.

## 13. Di luar lingkup
Gateway/QRIS/VA/e-wallet sungguhan, webhook, uang sungguhan, PWA, email/WhatsApp, penggalang dana mandiri, donasi berulang, wallet, microservices, web push.

## 14. Aturan kerja untuk Claude Code
- Periksa struktur repo dulu; satu tahap per sesi; tulis test bersama kodenya.
- Jangan menambah fitur atau library di luar PRD.
- Secret hanya di `.env.local`; sediakan `.env.example`.
- Jika ragu pada aturan uang atau keamanan, **tanya dulu**, jangan menebak.