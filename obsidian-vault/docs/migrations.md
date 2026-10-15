# Database Migrations

Generated: 2026-10-15T01:42:04.200Z

Total: 17 migrations

## Migration Files

1. `20261014000001_create_staff_profiles.sql`
2. `20261014000002_create_campaigns.sql`
3. `20261014000003_create_donor_contacts.sql`
4. `20261014000004_create_donations.sql`
5. `20261014000005_create_payments.sql`
6. `20261014000006_create_disbursements.sql`
7. `20261014000007_create_disbursement_proofs.sql`
8. `20261014000008_create_campaign_updates.sql`
9. `20261014000009_create_notifications.sql`
10. `20261014000010_create_reports.sql`
11. `20261014000011_create_audit_logs.sql`
12. `20261014000012_create_campaign_funds_view.sql`
13. `20261014000013_staff_policies.sql`
14. `20261014000014_create_storage_buckets.sql`
15. `20261014000015_create_updated_at_trigger.sql`
16. `20261014000016_seed_data.sql`
17. `20261014000017_fix_rls_recursion.sql`

## Schema Summary

- Tables: 11
- Views: 1 (campaign_funds)
- Storage Buckets: 2 (campaign-images, disbursement-proofs)
- RLS Policies: Enabled on all tables
- Triggers: update_updated_at, donation_after_payment
