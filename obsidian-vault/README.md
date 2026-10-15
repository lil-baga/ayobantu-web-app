# AyoBantu - Platform Donasi

Platform web donasi lokal berbasis Next.js, TypeScript, Supabase, dan Tailwind CSS.

## 📁 Struktur Vault

- `docs/` - Dokumentasi teknis (auto-generated dari kode)
- `tahapan/` - Log setiap tahap pembangunan
- `templates/` - Template catatan Obsidian
- `daily/` - Daily notes

## 🎯 Status Proyek

**Tahap Selesai:**
- ✅ Tahap 1: Lokal berjalan (Next.js init, env, lint)
- ✅ Tahap 2: Database & Auth (17 migrations, RLS, seed)
- ✅ Tahap 3: Kampanye (CRUD, donation form, tracking)
- ✅ Tahap 4: Donasi & Pembayaran Lokal (finance confirmation flow)
- ✅ Tahap 5: Dashboard & Pencairan (stats, disbursements, updates, CSV, reports)

**Tahap Berikutnya:**
- ⏳ Tahap 6: Testing & Verifikasi

## 🔗 Quick Links

- [[Roadmap]]
- [[Database Schema]]
- [[API Routes]]
- [[Testing Guide]]

## 📊 Metrics

- Routes: ~20 public + ~15 admin
- Migrations: 17 files
- Tables: 11 tables + 1 view
- Storage Buckets: 2 (campaign-images, disbursement-proofs)
