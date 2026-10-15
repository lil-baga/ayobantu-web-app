# Menjalankan Migrasi di Supabase Cloud

## Cara Manual (Recommended untuk Cloud)

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project kamu
3. Klik **SQL Editor** di sidebar kiri
4. Jalankan file migrasi satu per satu sesuai urutan:

```
20261014000001_create_staff_profiles.sql
20261014000002_create_campaigns.sql
20261014000003_create_donor_contacts.sql
20261014000004_create_donations.sql
20261014000005_create_payments.sql
20261014000006_create_disbursements.sql
20261014000007_create_disbursement_proofs.sql
20261014000008_create_campaign_updates.sql
20261014000009_create_notifications.sql
20261014000010_create_reports.sql
20261014000011_create_audit_logs.sql
20261014000012_create_campaign_funds_view.sql
20261014000013_staff_policies.sql
20261014000014_create_storage_buckets.sql
20261014000015_create_updated_at_trigger.sql
20261014000016_seed_data.sql
```

Cara cepat:
- Copy isi file
- Paste di SQL Editor
- Klik **Run**
- Ulangi untuk file berikutnya

## Atau: Gabung semua jadi 1 file

Bisa gabung semua migrasi jadi 1 file besar dan run sekali:

```bash
# Windows PowerShell
Get-Content supabase\migrations\*.sql | Out-File -Encoding UTF8 supabase\all_migrations.sql
```

Lalu paste `all_migrations.sql` ke SQL Editor.

## Verifikasi

Setelah selesai, cek di **Table Editor**:
- Harus ada 11 tables: staff_profiles, campaigns, donor_contacts, donations, payments, disbursements, disbursement_proofs, campaign_updates, notifications, reports, audit_logs
- View: campaign_funds
- Storage buckets: campaign-images, disbursement-proofs

## Test Login Staff

Credentials seed data:
- Admin: admin@ayobantu.test / password123
- Admin: admin@ayobantu.test / password123

Cek di Authentication → Users untuk memastikan user terbuat.
