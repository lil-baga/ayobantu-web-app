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
