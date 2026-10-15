import { createAdminClient } from '@/lib/supabase/admin';
import { donationSchema } from '@/lib/validations/donation';
import { encrypt } from '@/lib/crypto';
import { env } from '@/lib/env';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = donationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify campaign is active
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, status, operational_fee_bps, target_amount')
    .eq('id', parsed.data.campaign_id)
    .eq('status', 'active')
    .single();

  if (!campaign) {
    return NextResponse.json({ error: 'Kampanye tidak ditemukan atau tidak aktif' }, { status: 404 });
  }

  // Check minimum amount
  if (parsed.data.amount < env().MINIMUM_DONATION_AMOUNT) {
    return NextResponse.json({ 
      error: `Donasi minimal Rp${env().MINIMUM_DONATION_AMOUNT.toLocaleString()}` 
    }, { status: 400 });
  }

  // Create donor contact (encrypted)
  const { data: contact, error: contactError } = await supabase
    .from('donor_contacts')
    .insert({
      email_enc: parsed.data.email ? encrypt(parsed.data.email) : null,
      phone_enc: parsed.data.phone ? encrypt(parsed.data.phone) : null,
    })
    .select()
    .single();

  if (contactError || !contact) {
    return NextResponse.json({ error: 'Gagal menyimpan kontak' }, { status: 500 });
  }

  // Generate tracking token (32 bytes random)
  const trackingToken = crypto.randomBytes(32).toString('hex');
  const trackingTokenHash = crypto.createHash('sha256').update(trackingToken).digest('hex');

  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + env().PENDING_PAYMENT_EXPIRY_HOURS);

  // Create donation (status: pending, fee not calculated yet)
  const { data: donation, error: donationError } = await supabase
    .from('donations')
    .insert({
      campaign_id: parsed.data.campaign_id,
      donor_contact_id: contact.id,
      amount: parsed.data.amount,
      operational_fee_amount: 0, // Calculated when paid
      status: 'pending',
      display_name: parsed.data.display_name || null,
      is_anonymous: parsed.data.is_anonymous,
      message: parsed.data.message || null,
      notify_updates: parsed.data.notify_updates,
      tracking_token_hash: trackingTokenHash,
    })
    .select()
    .single();

  if (donationError || !donation) {
    return NextResponse.json({ error: 'Gagal membuat donasi' }, { status: 500 });
  }

  // Create payment record (gateway: local)
  const gatewayOrderId = `LOCAL-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      donation_id: donation.id,
      gateway: 'local',
      gateway_order_id: gatewayOrderId,
      method: parsed.data.method,
      gross_amount: parsed.data.amount,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    });

  if (paymentError) {
    return NextResponse.json({ error: 'Gagal membuat payment' }, { status: 500 });
  }

  // Return tracking token (only shown once)
  return NextResponse.json({
    donation_id: donation.id,
    tracking_token: trackingToken, // Plain token, only sent once
    amount: donation.amount,
    campaign_id: donation.campaign_id,
  }, { status: 201 });
}
