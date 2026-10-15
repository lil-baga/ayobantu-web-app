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
