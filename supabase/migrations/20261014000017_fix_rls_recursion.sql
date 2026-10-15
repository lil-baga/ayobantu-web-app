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
