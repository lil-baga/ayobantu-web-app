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
