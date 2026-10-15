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
