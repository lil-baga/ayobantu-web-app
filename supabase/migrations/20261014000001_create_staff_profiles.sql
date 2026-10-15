-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Staff profiles table
CREATE TABLE staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'finance')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_staff_profiles_role ON staff_profiles(role);
CREATE INDEX idx_staff_profiles_is_active ON staff_profiles(is_active);

-- RLS policies
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

-- Staff can read their own profile
CREATE POLICY "staff_read_own" ON staff_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admin can read all staff
CREATE POLICY "admin_read_all" ON staff_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Admin can insert/update staff
CREATE POLICY "admin_write" ON staff_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );
