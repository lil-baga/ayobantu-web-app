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
