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
