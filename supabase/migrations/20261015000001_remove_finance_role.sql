-- Migration: Remove Finance role, merge to Admin
-- All staff now have single 'admin' role with full permissions

BEGIN;

-- 1. Update existing finance users to admin role
UPDATE public.staff_profiles 
SET role = 'admin' 
WHERE role = 'finance';

-- 2. Drop existing CHECK constraint on role
ALTER TABLE public.staff_profiles 
DROP CONSTRAINT IF EXISTS staff_profiles_role_check;

-- 3. Add new CHECK constraint with only 'admin' role
ALTER TABLE public.staff_profiles 
ADD CONSTRAINT staff_profiles_role_check 
CHECK (role IN ('admin'));

-- 4. Update RLS policies to only check for 'admin' role

-- Drop old policies
DROP POLICY IF EXISTS "Staff with admin/finance can insert disbursements" ON public.disbursements;
DROP POLICY IF EXISTS "Staff with admin/finance can update own disbursements" ON public.disbursements;
DROP POLICY IF EXISTS "Staff with admin/finance can insert disbursement proofs" ON public.disbursement_proofs;
DROP POLICY IF EXISTS "Staff with admin/finance can view campaign_updates" ON public.campaign_updates;
DROP POLICY IF EXISTS "Staff with admin/finance can create campaign_updates" ON public.campaign_updates;

-- Recreate policies with 'admin' only
CREATE POLICY "Admin can insert disbursements"
  ON public.disbursements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE POLICY "Admin can update own disbursements"
  ON public.disbursements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE POLICY "Admin can insert disbursement proofs"
  ON public.disbursement_proofs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE POLICY "Admin can view campaign_updates"
  ON public.campaign_updates FOR SELECT
  USING (public.get_staff_role() = 'admin');

CREATE POLICY "Admin can create campaign_updates"
  ON public.campaign_updates FOR INSERT
  WITH CHECK (public.get_staff_role() = 'admin');

-- 5. Update storage policies for disbursement-proofs bucket
DROP POLICY IF EXISTS "Staff with admin/finance can upload disbursement proofs" ON storage.objects;

CREATE POLICY "Admin can upload disbursement proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'disbursement-proofs' AND public.get_staff_role() = 'admin');

COMMIT;
