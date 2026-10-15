import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  const staff = await requireStaff();
  const body = await request.json();
  const { status } = body; // 'paid' or 'failed'

  if (!['paid', 'failed'].includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Get donation + campaign + payment
  const { data: donation } = await supabase
    .from('donations')
    .select('*, campaigns(operational_fee_bps)')
    .eq('id', id)
    .single();

  if (!donation) {
    return NextResponse.json({ error: 'Donasi tidak ditemukan' }, { status: 404 });
  }

  if (donation.status !== 'pending') {
    return NextResponse.json({ error: 'Donasi sudah diproses' }, { status: 400 });
  }

  const campaign = donation.campaigns as { operational_fee_bps: number };

  // Calculate operational fee (only when paid)
  const operationalFeeAmount = status === 'paid' 
    ? Math.round((donation.amount * campaign.operational_fee_bps) / 10000)
    : 0;

  // Update donation + payment in transaction
  const now = new Date().toISOString();

  const { error: donationError } = await supabase
    .from('donations')
    .update({
      status,
      operational_fee_amount: operationalFeeAmount,
      paid_at: status === 'paid' ? now : null,
    })
    .eq('id', id);

  if (donationError) {
    return NextResponse.json({ error: donationError.message }, { status: 500 });
  }

  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status,
      paid_at: status === 'paid' ? now : null,
    })
    .eq('donation_id', id);

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  // Create notification record (receipt)
  if (status === 'paid') {
    await supabase.from('notifications').insert({
      donation_id: id,
      type: 'receipt',
      channel: 'email',
      status: 'queued',
    });
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: staff.id,
    action: 'confirm_payment',
    entity_type: 'donation',
    entity_id: id,
    changes: { status, operational_fee_amount: operationalFeeAmount },
  });

  return NextResponse.json({ ok: true, status, operational_fee_amount: operationalFeeAmount });
}
