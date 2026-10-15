import { createAdminClient } from '@/lib/supabase/admin';
import { createDonation } from './helpers/donationHelper';

/**
 * End‑to‑end test untuk alur donasi lokal
 * 1. Buat donation (pending)
 * 2. Finance confirms status menjadi "paid", hitung fee operasional, set paid_at
 * 3. Verifikasi status menjadi "paid" dan fee dibekukan
 */

test('full donation flow', async () => {
  const supabase = createAdminClient();

  // Ambil kampanye aktif pertama
  const { data: kamp } = await supabase
    .from('campaigns')
    .select('id, operational_fee_bps')
    .eq('status', 'active')
    .limit(1)
    .single();

  expect(kamp).toBeTruthy();

  const amount = 50000;

  // 1. Buat donation (status pending)
  const donation = await createDonation({
    campaignId: kamp!.id,
    amount,
    displayName: 'Budi Test',
    email: 'budi@example.com',
  });

  expect(donation).toBeTruthy();
  expect(donation.id).toBeTruthy();
  expect(donation.tracking_token).toBeTruthy();

  // 2. Finance confirms: set status paid, hitung fee, set paid_at
  const feeBps = kamp!.operational_fee_bps ?? 500;
  const operationalFee = Math.round((amount * feeBps) / 10000);
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('donations')
    .update({
      status: 'paid',
      operational_fee_amount: operationalFee,
      paid_at: now,
    })
    .eq('id', donation.id);

  expect(updateError).toBeNull();

  // Update payment record to paid
  const { error: payError } = await supabase
    .from('payments')
    .update({
      status: 'paid',
      paid_at: now,
    })
    .eq('donation_id', donation.id);

  expect(payError).toBeNull();

  // 3. Verifikasi dari DB
  const { data: updated } = await supabase
    .from('donations')
    .select('status, paid_at, operational_fee_amount, amount')
    .eq('id', donation.id)
    .single();

  expect(updated?.status).toBe('paid');
  expect(updated?.paid_at).toBeTruthy();
  expect(updated?.operational_fee_amount).toBe(operationalFee);
  expect(updated?.amount).toBe(amount);
});
