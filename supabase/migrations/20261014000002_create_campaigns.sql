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
