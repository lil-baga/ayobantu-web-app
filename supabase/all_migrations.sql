-- ====================
-- File: 20261014000001_create_staff_profiles.sql
-- ====================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Staff profiles table
CREATE TABLE staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'finance')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_staff_profiles_role ON staff_profiles(role);
CREATE INDEX idx_staff_profiles_is_active ON staff_profiles(is_active);

-- RLS policies
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

-- Staff can read their own profile
CREATE POLICY "staff_read_own" ON staff_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admin can read all staff
CREATE POLICY "admin_read_all" ON staff_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Admin can insert/update staff
CREATE POLICY "admin_write" ON staff_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );


-- ====================
-- File: 20261014000002_create_campaigns.sql
-- ====================

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  cover_image_url TEXT,
  target_amount BIGINT NOT NULL CHECK (target_amount > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'suspended')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  operational_fee_bps INTEGER NOT NULL DEFAULT 500 CHECK (operational_fee_bps >= 0 AND operational_fee_bps <= 1000),
  beneficiary_name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES staff_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

-- Indexes
CREATE INDEX idx_campaigns_slug ON campaigns(slug);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);

-- RLS policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Public (anon) can read active campaigns only
CREATE POLICY "anon_read_active" ON campaigns
  FOR SELECT
  TO anon
  USING (status = 'active');

-- Authenticated users can read all
CREATE POLICY "authenticated_read_all" ON campaigns
  FOR SELECT
  TO authenticated
  USING (true);

-- Staff can write (will check role in application logic)
CREATE POLICY "staff_write" ON campaigns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );


-- ====================
-- File: 20261014000003_create_donor_contacts.sql
-- ====================

-- Donor contacts table (encrypted sensitive data)
CREATE TABLE donor_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_enc TEXT,
  phone_enc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (email_enc IS NOT NULL OR phone_enc IS NOT NULL)
);

-- Index for lookups (will query by encrypted value)
CREATE INDEX idx_donor_contacts_email_enc ON donor_contacts(email_enc);
CREATE INDEX idx_donor_contacts_phone_enc ON donor_contacts(phone_enc);

-- RLS: completely locked down for anon
ALTER TABLE donor_contacts ENABLE ROW LEVEL SECURITY;

-- Only service_role can access (via server-side code)
-- No policies = no access for anon/authenticated


-- ====================
-- File: 20261014000004_create_donations.sql
-- ====================

-- Donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
  donor_contact_id UUID NOT NULL REFERENCES donor_contacts(id) ON DELETE RESTRICT,
  amount BIGINT NOT NULL CHECK (amount > 0),
  operational_fee_amount BIGINT NOT NULL DEFAULT 0 CHECK (operational_fee_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'refunded')),
  display_name TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  notify_updates BOOLEAN NOT NULL DEFAULT false,
  tracking_token_hash TEXT NOT NULL UNIQUE,
  refund_amount BIGINT CHECK (refund_amount >= 0),
  refunded_at TIMESTAMPTZ,
  refund_note TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_tracking_token_hash ON donations(tracking_token_hash);
CREATE INDEX idx_donations_created_at ON donations(created_at);

-- RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Anon cannot access donations table directly
-- Access via server endpoints only


-- ====================
-- File: 20261014000005_create_payments.sql
-- ====================

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE RESTRICT,
  gateway TEXT NOT NULL DEFAULT 'local',
  gateway_order_id TEXT NOT NULL UNIQUE,
  method TEXT CHECK (method IN ('transfer', 'qris')),
  gross_amount BIGINT NOT NULL CHECK (gross_amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_donation_id ON payments(donation_id);
CREATE INDEX idx_payments_gateway_order_id ON payments(gateway_order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Locked down for anon


-- ====================
-- File: 20261014000006_create_disbursements.sql
-- ====================

-- Disbursements table
CREATE TABLE disbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
  amount BIGINT NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  disbursed_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'disbursed', 'reported')),
  created_by UUID NOT NULL REFERENCES staff_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_disbursements_campaign_id ON disbursements(campaign_id);
CREATE INDEX idx_disbursements_status ON disbursements(status);

-- RLS
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;

-- Anon cannot access
-- Staff can read via authenticated
CREATE POLICY "staff_read" ON disbursements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "staff_write" ON disbursements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'finance') AND is_active = true
    )
  );


-- ====================
-- File: 20261014000007_create_disbursement_proofs.sql
-- ====================

-- Disbursement proofs table
CREATE TABLE disbursement_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disbursement_id UUID NOT NULL REFERENCES disbursements(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('nota', 'transfer', 'foto')),
  uploaded_by UUID NOT NULL REFERENCES staff_profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_disbursement_proofs_disbursement_id ON disbursement_proofs(disbursement_id);

-- RLS
ALTER TABLE disbursement_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read" ON disbursement_proofs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "staff_write" ON disbursement_proofs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'finance') AND is_active = true
    )
  );


-- ====================
-- File: 20261014000008_create_campaign_updates.sql
-- ====================

-- Campaign updates table
CREATE TABLE campaign_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  disbursement_id UUID REFERENCES disbursements(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_urls TEXT[],
  posted_by UUID NOT NULL REFERENCES staff_profiles(id),
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_campaign_updates_campaign_id ON campaign_updates(campaign_id);
CREATE INDEX idx_campaign_updates_posted_at ON campaign_updates(posted_at DESC);

-- RLS
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;

-- Anon can read updates for active campaigns
CREATE POLICY "anon_read_active_campaign_updates" ON campaign_updates
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_updates.campaign_id
      AND campaigns.status = 'active'
    )
  );

-- Authenticated can read all
CREATE POLICY "authenticated_read_all" ON campaign_updates
  FOR SELECT
  TO authenticated
  USING (true);

-- Staff can write
CREATE POLICY "staff_write" ON campaign_updates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );


-- ====================
-- File: 20261014000009_create_notifications.sql
-- ====================

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  campaign_update_id UUID REFERENCES campaign_updates(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('receipt', 'update')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (donation_id IS NOT NULL OR campaign_update_id IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_notifications_donation_id ON notifications(donation_id);
CREATE INDEX idx_notifications_campaign_update_id ON notifications(campaign_update_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Locked down for anon


-- ====================
-- File: 20261014000010_create_reports.sql
-- ====================

-- Reports table (campaign reports from public)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  reporter_contact TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'closed')),
  handled_by UUID REFERENCES staff_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reports_campaign_id ON reports(campaign_id);
CREATE INDEX idx_reports_status ON reports(status);

-- RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Anon cannot read reports
-- Staff can read
CREATE POLICY "staff_read" ON reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "staff_write" ON reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );


-- ====================
-- File: 20261014000011_create_audit_logs.sql
-- ====================

-- Audit logs table (immutable)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES staff_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Staff can read only
CREATE POLICY "staff_read" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Prevent updates and deletes (immutable)
CREATE POLICY "no_update" ON audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY "no_delete" ON audit_logs
  FOR DELETE
  USING (false);


-- ====================
-- File: 20261014000012_create_campaign_funds_view.sql
-- ====================

-- campaign_funds view (PRD Â§8)
-- Calculated from donations/disbursements, not editable columns
CREATE OR REPLACE VIEW campaign_funds AS
SELECT
  c.id AS campaign_id,
  c.slug,
  c.title,
  c.target_amount,
  c.status,
  -- Terkumpul: sum paid donations minus refunds
  COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'paid'), 0)
    - COALESCE(SUM(d.refund_amount) FILTER (WHERE d.status = 'refunded'), 0)
    AS collected,
  -- Operasional: sum of operational fees for paid donations
  COALESCE(SUM(d.operational_fee_amount) FILTER (WHERE d.status = 'paid'), 0)
    AS operational,
  -- Dicairkan: sum of disbursed/reported disbursements
  COALESCE(
    (SELECT SUM(dis.amount) FROM disbursements dis
     WHERE dis.campaign_id = c.id AND dis.status IN ('disbursed', 'reported')),
    0
  ) AS disbursed,
  -- Sisa: collected - operational - disbursed
  COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'paid'), 0)
    - COALESCE(SUM(d.refund_amount) FILTER (WHERE d.status = 'refunded'), 0)
    - COALESCE(SUM(d.operational_fee_amount) FILTER (WHERE d.status = 'paid'), 0)
    - COALESCE(
        (SELECT SUM(dis.amount) FROM disbursements dis
         WHERE dis.campaign_id = c.id AND dis.status IN ('disbursed', 'reported')),
        0
      )
    AS remaining,
  -- Belum dilaporkan: disbursements that are 'disbursed' but not 'reported'
  COALESCE(
    (SELECT SUM(dis.amount) FROM disbursements dis
     WHERE dis.campaign_id = c.id AND dis.status = 'disbursed'),
    0
  ) AS unreported
FROM campaigns c
LEFT JOIN donations d ON d.campaign_id = c.id
GROUP BY c.id, c.slug, c.title, c.target_amount, c.status;


-- ====================
-- File: 20261014000013_staff_policies.sql
-- ====================

-- Staff can read/write donations, payments, notifications, audit_logs via authenticated role

-- Donations: staff read
CREATE POLICY "staff_read" ON donations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Donations: staff write (for status changes)
CREATE POLICY "staff_write" ON donations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Payments: staff read
CREATE POLICY "staff_read" ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Payments: staff write (for status changes)
CREATE POLICY "staff_write" ON payments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Notifications: staff read
CREATE POLICY "staff_read" ON notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Audit logs: insert allowed for authenticated (server-side inserts)
CREATE POLICY "staff_insert" ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );


-- ====================
-- File: 20261014000014_create_storage_buckets.sql
-- ====================

-- Storage buckets

-- Campaign images: public readable
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-images', 'campaign-images', true);

-- Disbursement proofs: private, signed URL only
INSERT INTO storage.buckets (id, name, public)
VALUES ('disbursement-proofs', 'disbursement-proofs', false);

-- Storage policies for campaign-images
CREATE POLICY "public_read_campaign_images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'campaign-images');

CREATE POLICY "staff_upload_campaign_images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'campaign-images'
    AND EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "staff_delete_campaign_images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'campaign-images'
    AND EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Storage policies for disbursement-proofs
CREATE POLICY "staff_read_disbursement_proofs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'disbursement-proofs'
    AND EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "staff_upload_disbursement_proofs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'disbursement-proofs'
    AND EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'finance') AND is_active = true
    )
  );


-- ====================
-- File: 20261014000015_create_updated_at_trigger.sql
-- ====================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON disbursements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ====================
-- File: 20261014000016_seed_data.sql
-- ====================

-- Seed data for testing
-- Create test auth users first, then staff profiles, then campaigns

-- NOTE: For Supabase Cloud, you need to:
-- 1. Go to Authentication â†’ Users â†’ Add user
-- 2. Create admin@ayobantu.test / password123
-- 3. Create finance@ayobantu.test / password123
-- 4. Copy their UUIDs and run the INSERT below manually
-- Or use the SQL Editor to create users programmatically:

-- Programmatic user creation (works in Supabase SQL Editor)
DO $$
DECLARE
  admin_id UUID;
  finance_id UUID;
BEGIN
  -- Check if users already exist
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@ayobantu.test';
  SELECT id INTO finance_id FROM auth.users WHERE email = 'finance@ayobantu.test';

  -- Create admin user if not exists
  IF admin_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
    ) VALUES (
      uuid_generate_v4(),
      '00000000-0000-0000-0000-000000000000',
      'admin@ayobantu.test',
      crypt('password123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin AyoBantu"}',
      'authenticated',
      'authenticated',
      NOW(), NOW()
    ) RETURNING id INTO admin_id;

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (admin_id, admin_id, jsonb_build_object('sub', admin_id, 'email', 'admin@ayobantu.test'), 'email', admin_id, NOW(), NOW(), NOW());
  END IF;

  -- Create finance user if not exists
  IF finance_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
    ) VALUES (
      uuid_generate_v4(),
      '00000000-0000-0000-0000-000000000000',
      'finance@ayobantu.test',
      crypt('password123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Finance AyoBantu"}',
      'authenticated',
      'authenticated',
      NOW(), NOW()
    ) RETURNING id INTO finance_id;

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (finance_id, finance_id, jsonb_build_object('sub', finance_id, 'email', 'finance@ayobantu.test'), 'email', finance_id, NOW(), NOW(), NOW());
  END IF;

  -- Staff profiles
  INSERT INTO public.staff_profiles (id, name, role, is_active)
  VALUES
    (admin_id, 'Admin AyoBantu', 'admin', true),
    (finance_id, 'Finance AyoBantu', 'finance', true)
  ON CONFLICT (id) DO NOTHING;

  -- Seed campaigns
  INSERT INTO public.campaigns (slug, title, story, target_amount, status, operational_fee_bps, beneficiary_name, created_by)
  VALUES
    (
      'bantu-korban-banjir-jakarta',
      'Bantu Korban Banjir Jakarta',
      'Banjir melanda Jakarta Selatan. Ribuan keluarga kehilangan tempat tinggal dan membutuhkan bantuan segera untuk kebutuhan dasar seperti makanan, air bersih, dan pakaian. Mari kita bantu saudara-saudara kita yang terdampak bencana.',
      50000000, 'active', 500, 'Tim Relawan Jakarta', admin_id
    ),
    (
      'pendidikan-anak-desa',
      'Pendidikan untuk Anak-anak Desa',
      'Membantu membangun perpustakaan dan menyediakan buku untuk anak-anak di desa terpencil agar mereka dapat mengakses pendidikan yang layak. Setiap anak berhak mendapatkan pendidikan berkualitas.',
      25000000, 'active', 500, 'Yayasan Pendidikan Nusantara', admin_id
    ),
    (
      'operasi-jantung-anak',
      'Operasi Jantung untuk Anak Kecil',
      'Ahmad, 5 tahun, menderita penyakit jantung bawaan dan membutuhkan operasi segera. Keluarganya tidak mampu membiayai operasi yang mencapai puluhan juta rupiah. Bantu Ahmad untuk bisa hidup normal.',
      75000000, 'draft', 500, 'Keluarga Ahmad', admin_id
    );

END $$;


-- ====================
-- File: 20261014000017_fix_rls_recursion.sql
-- ====================

-- ==============================================
-- FIX: Infinite recursion di staff_profiles RLS
-- ==============================================

-- Helper function (SECURITY DEFINER = bypass RLS, no recursion)
CREATE OR REPLACE FUNCTION public.get_staff_role()
RETURNS TEXT AS $$
  SELECT role FROM public.staff_profiles WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff_profiles WHERE id = auth.uid() AND is_active = true);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ========== staff_profiles ==========
DROP POLICY IF EXISTS "staff_read_own" ON staff_profiles;
DROP POLICY IF EXISTS "admin_read_all" ON staff_profiles;
DROP POLICY IF EXISTS "admin_write" ON staff_profiles;

CREATE POLICY "authenticated_read" ON staff_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_write" ON staff_profiles
  FOR ALL TO authenticated
  USING (public.get_staff_role() = 'admin');

-- ========== campaigns ==========
DROP POLICY IF EXISTS "staff_write" ON campaigns;
CREATE POLICY "staff_write" ON campaigns
  FOR ALL TO authenticated
  USING (public.is_active_staff());

-- ========== disbursements ==========
DROP POLICY IF EXISTS "staff_read" ON disbursements;
DROP POLICY IF EXISTS "staff_write" ON disbursements;
CREATE POLICY "staff_read" ON disbursements
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff_write" ON disbursements
  FOR ALL TO authenticated
  USING (public.get_staff_role() IN ('admin', 'finance'));

-- ========== disbursement_proofs ==========
DROP POLICY IF EXISTS "staff_read" ON disbursement_proofs;
DROP POLICY IF EXISTS "staff_write" ON disbursement_proofs;
CREATE POLICY "staff_read" ON disbursement_proofs
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff_write" ON disbursement_proofs
  FOR ALL TO authenticated
  USING (public.get_staff_role() IN ('admin', 'finance'));

-- ========== campaign_updates ==========
DROP POLICY IF EXISTS "staff_write" ON campaign_updates;
CREATE POLICY "staff_write" ON campaign_updates
  FOR ALL TO authenticated
  USING (public.is_active_staff());

-- ========== donations ==========
DROP POLICY IF EXISTS "staff_read" ON donations;
DROP POLICY IF EXISTS "staff_write" ON donations;
CREATE POLICY "staff_read" ON donations
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff_write" ON donations
  FOR UPDATE TO authenticated
  USING (public.is_active_staff());

-- ========== payments ==========
DROP POLICY IF EXISTS "staff_read" ON payments;
DROP POLICY IF EXISTS "staff_write" ON payments;
CREATE POLICY "staff_read" ON payments
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff_write" ON payments
  FOR UPDATE TO authenticated
  USING (public.is_active_staff());

-- ========== notifications ==========
DROP POLICY IF EXISTS "staff_read" ON notifications;
CREATE POLICY "staff_read" ON notifications
  FOR SELECT TO authenticated USING (public.is_active_staff());

-- ========== reports ==========
DROP POLICY IF EXISTS "staff_read" ON reports;
DROP POLICY IF EXISTS "staff_write" ON reports;
CREATE POLICY "staff_read" ON reports
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff_write" ON reports
  FOR UPDATE TO authenticated
  USING (public.get_staff_role() = 'admin');

-- ========== audit_logs ==========
DROP POLICY IF EXISTS "staff_read" ON audit_logs;
DROP POLICY IF EXISTS "staff_insert" ON audit_logs;
CREATE POLICY "staff_read" ON audit_logs
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff_insert" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_active_staff());

-- ========== storage ==========
DROP POLICY IF EXISTS "staff_upload_campaign_images" ON storage.objects;
DROP POLICY IF EXISTS "staff_delete_campaign_images" ON storage.objects;
DROP POLICY IF EXISTS "staff_read_disbursement_proofs" ON storage.objects;
DROP POLICY IF EXISTS "staff_upload_disbursement_proofs" ON storage.objects;

CREATE POLICY "staff_upload_campaign_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'campaign-images' AND public.is_active_staff());

CREATE POLICY "staff_delete_campaign_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'campaign-images' AND public.is_active_staff());

CREATE POLICY "staff_read_disbursement_proofs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'disbursement-proofs' AND public.is_active_staff());

CREATE POLICY "staff_upload_disbursement_proofs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'disbursement-proofs' AND public.get_staff_role() IN ('admin', 'finance'));


