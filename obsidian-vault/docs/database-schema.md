# Database Schema

Generated: 2026-10-15T00:41:03.239Z

## Tables

### Core Tables
1. **staff_profiles** - Admin/Finance user profiles
2. **campaigns** - Donation campaigns
3. **donations** - Donation records
4. **donor_contacts** - Encrypted donor contact info
5. **payments** - Payment tracking (local mode)
6. **disbursements** - Fund disbursements
7. **disbursement_proofs** - Proof uploads
8. **campaign_updates** - Campaign progress updates
9. **reports** - Campaign reports from public
10. **receipt_notifications** - Receipt email queue
11. **audit_logs** - Audit trail

### Views
- **campaign_funds** - Aggregated fund calculations per campaign

## Storage Buckets
- **campaign-images** - Campaign cover images (public)
- **disbursement-proofs** - Disbursement proof files (private)

## Key Relationships
- campaigns → donations (1:n)
- donations → payments (1:1)
- donations → donor_contacts (1:1)
- campaigns → disbursements (1:n)
- disbursements → disbursement_proofs (1:n)
- campaigns → campaign_updates (1:n)
- campaigns → reports (1:n)

## Security
- RLS enabled on all tables
- Donor contacts encrypted with AES-256-GCM
- Admin/Finance role checks via JWT claims
