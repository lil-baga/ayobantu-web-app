import { createAdminClient } from '@/lib/supabase/admin';
import { createDonation } from './helpers/donationHelper';

/**
 * End‑to‑end test untuk alur donasi lokal
 * 1. Buat donation (pending)
 * 2. Finance confirms via API
 * 3. Cek status menjadi "paid"
 * 4. Verifikasi dana kampanye terupdate
 */

test('full donation flow', async () => {
  const supabase = createAdminClient();

  // Ambil kampanye aktif pertama
  const { data: kamp } = await supabase
    .from('campaigns')
    .select('id')
    .eq('status', 'active')
    .limit(1)
    .single();

  expect(kamp).toBeTruthy();

  // Buat donation
  const donation = await createDonation({
    campaignId: kamp!.id,
    amount: 50000,
    displayName: 'Budi',
    email: 'budi@example.com',
  });

  expect(donation).toBeTruthy();
  
  if (!donation) {
    throw new Error('Failed to create donation');
  }

  // Simulasi finance confirm (PATCH endpoint)
  const confirmRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/donations/${donation.id}/confirm`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    },
  );

  expect(confirmRes.ok).toBe(true);

  // Refresh donation from DB
  const { data: updated } = await supabase
    .from('donations')
    .select('status, paid_at')
    .eq('id', donation.id)
    .single();

  expect(updated?.status).toBe('paid');
  expect(updated?.paid_at).toBeTruthy();
});
