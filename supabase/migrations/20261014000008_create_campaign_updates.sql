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
