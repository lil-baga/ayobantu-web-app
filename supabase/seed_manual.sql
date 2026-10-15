-- Insert staff profiles untuk admin dan finance yang sudah dibuat
INSERT INTO public.staff_profiles (id, name, role, is_active)
VALUES
  ('231b7635-b2f5-410c-97d8-375e0b641ecc', 'Admin AyoBantu', 'admin', true),
  ('8c057d19-b976-4615-863d-ac954cd3f4f7', 'Finance AyoBantu', 'finance', true)
ON CONFLICT (id) DO NOTHING;

-- Insert campaigns dengan admin sebagai creator
INSERT INTO public.campaigns (slug, title, story, target_amount, status, operational_fee_bps, beneficiary_name, created_by)
VALUES
  (
    'bantu-korban-banjir-jakarta',
    'Bantu Korban Banjir Jakarta',
    'Banjir melanda Jakarta Selatan. Ribuan keluarga kehilangan tempat tinggal dan membutuhkan bantuan segera untuk kebutuhan dasar seperti makanan, air bersih, dan pakaian. Mari kita bantu saudara-saudara kita yang terdampak bencana.',
    50000000, 'active', 500, 'Tim Relawan Jakarta', '231b7635-b2f5-410c-97d8-375e0b641ecc'
  ),
  (
    'pendidikan-anak-desa',
    'Pendidikan untuk Anak-anak Desa',
    'Membantu membangun perpustakaan dan menyediakan buku untuk anak-anak di desa terpencil agar mereka dapat mengakses pendidikan yang layak. Setiap anak berhak mendapatkan pendidikan berkualitas.',
    25000000, 'active', 500, 'Yayasan Pendidikan Nusantara', '231b7635-b2f5-410c-97d8-375e0b641ecc'
  ),
  (
    'operasi-jantung-anak',
    'Operasi Jantung untuk Anak Kecil',
    'Ahmad, 5 tahun, menderita penyakit jantung bawaan dan membutuhkan operasi segera. Keluarganya tidak mampu membiayai operasi yang mencapai puluhan juta rupiah. Bantu Ahmad untuk bisa hidup normal.',
    75000000, 'draft', 500, 'Keluarga Ahmad', '231b7635-b2f5-410c-97d8-375e0b641ecc'
  )
ON CONFLICT (slug) DO NOTHING;
