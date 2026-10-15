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
