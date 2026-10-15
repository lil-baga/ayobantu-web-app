-- Seed data for testing
-- Create test auth users first, then staff profiles, then campaigns

-- NOTE: For Supabase Cloud, you need to:
-- 1. Go to Authentication → Users → Add user
-- 2. Create admin@ayobantu.test / password123
-- 3. Create finance@ayobantu.test / password123
-- 4. Copy their UUIDs and run the INSERT below manually
-- Or use the SQL Editor to create users programmatically:

-- Programmatic user creation (works in Supabase SQL Editor)
DO $$
DECLARE
  admin_id UUID;
  finance_id UUID;
BEGIN
  -- Check if users already exist
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@ayobantu.test';
  SELECT id INTO finance_id FROM auth.users WHERE email = 'finance@ayobantu.test';

  -- Create admin user if not exists
  IF admin_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
    ) VALUES (
      uuid_generate_v4(),
      '00000000-0000-0000-0000-000000000000',
      'admin@ayobantu.test',
      crypt('password123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin AyoBantu"}',
      'authenticated',
      'authenticated',
      NOW(), NOW()
    ) RETURNING id INTO admin_id;

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (admin_id, admin_id, jsonb_build_object('sub', admin_id, 'email', 'admin@ayobantu.test'), 'email', admin_id, NOW(), NOW(), NOW());
  END IF;

  -- Create finance user if not exists
  IF finance_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
    ) VALUES (
      uuid_generate_v4(),
      '00000000-0000-0000-0000-000000000000',
      'finance@ayobantu.test',
      crypt('password123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Finance AyoBantu"}',
      'authenticated',
      'authenticated',
      NOW(), NOW()
    ) RETURNING id INTO finance_id;

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (finance_id, finance_id, jsonb_build_object('sub', finance_id, 'email', 'finance@ayobantu.test'), 'email', finance_id, NOW(), NOW(), NOW());
  END IF;

  -- Staff profiles
  INSERT INTO public.staff_profiles (id, name, role, is_active)
  VALUES
    (admin_id, 'Admin AyoBantu', 'admin', true),
    (finance_id, 'Finance AyoBantu', 'finance', true)
  ON CONFLICT (id) DO NOTHING;

  -- Seed campaigns
  INSERT INTO public.campaigns (slug, title, story, cover_image_url, target_amount, status, operational_fee_bps, beneficiary_name, created_by)
  VALUES
    (
      'bantu-korban-banjir-jakarta',
      'Bantu Korban Banjir Jakarta',
      'Banjir melanda Jakarta Selatan. Ribuan keluarga kehilangan tempat tinggal dan membutuhkan bantuan segera untuk kebutuhan dasar seperti makanan, air bersih, dan pakaian. Mari kita bantu saudara-saudara kita yang terdampak bencana.',
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&h=600&fit=crop',
      50000000, 'active', 500, 'Tim Relawan Jakarta', admin_id
    ),
    (
      'pendidikan-anak-desa',
      'Pendidikan untuk Anak-anak Desa',
      'Membantu membangun perpustakaan dan menyediakan buku untuk anak-anak di desa terpencil agar mereka dapat mengakses pendidikan yang layak. Setiap anak berhak mendapatkan pendidikan berkualitas.',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
      25000000, 'active', 500, 'Yayasan Pendidikan Nusantara', admin_id
    ),
    (
      'operasi-jantung-anak',
      'Operasi Jantung untuk Anak Kecil',
      'Ahmad, 5 tahun, menderita penyakit jantung bawaan dan membutuhkan operasi segera. Keluarganya tidak mampu membiayai operasi yang mencapai puluhan juta rupiah. Bantu Ahmad untuk bisa hidup normal.',
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop',
      75000000, 'draft', 500, 'Keluarga Ahmad', admin_id
    );

END $$;
