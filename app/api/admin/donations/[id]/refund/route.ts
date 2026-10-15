import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  const { id } = await params;
  const staff = await requireStaff();
  const body = await request.json();
  const { refund_amount, refund_note } = body;

  const supabase = createAdminClient();

  // 1. Get donation details
  const { data: donation, error: fetchError } = await supabase
    .from('donations')
    .select('id, campaign_id, amount, status, operational_fee_amount, refund_amount')
    .eq('id', id)
    .single();

  if (fetchError || !donation) {
    return NextResponse.json({ error: 'Donasi tidak ditemukan' }, { status: 404 });
  }

  if (donation.status !== 'paid') {
    return NextResponse.json({ error: 'Hanya donasi berstatus paid yang dapat di-refund' }, { status: 400 });
  }

  const requestedAmount = Number(refund_amount);
  if (!requestedAmount || requestedAmount <= 0) {
    return NextResponse.json({ error: 'Nominal refund harus lebih dari 0' }, { status: 400 });
  }

  if (requestedAmount > donation.amount) {
    return NextResponse.json({ error: 'Nominal refund tidak boleh melebihi nominal donasi' }, { status: 400 });
  }

  // 2. Check remaining campaign funds (Sisa dana tidak boleh negatif setelah refund)
  const { data: funds } = await supabase
    .from('campaign_funds')
    .select('remaining')
    .eq('campaign_id', donation.campaign_id)
    .single();

  if (funds && funds.remaining < requestedAmount) {
    return NextResponse.json({
      error: `Dana sisa kampanye (Rp${funds.remaining.toLocaleString('id-ID')}) tidak mencukupi untuk refund`,
    }, { status: 400 });
  }

  // 3. Determine if full or partial refund
  const isFullRefund = requestedAmount === donation.amount;
  const now = new Date().toISOString();

  const updatePayload = {
    status: isFullRefund ? 'refunded' : 'paid',
    refund_amount: requestedAmount,
    refunded_at: now,
    refund_note: refund_note || 'Refund manual oleh ' + staff.name,
    // Jika refund penuh, batalkan biaya operasional (0)
    ...(isFullRefund ? { operational_fee_amount: 0 } : {}),
  };

  const { error: updateError } = await supabase
    .from('donations')
    .update(updatePayload)
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 4. Update payment status if full refund
  if (isFullRefund) {
    await supabase
      .from('payments')
      .update({ status: 'refunded' })
      .eq('donation_id', id);
  }

  // 5. Audit log
  await supabase.from('audit_logs').insert({
    user_id: staff.id,
    action: 'refund',
    entity_type: 'donation',
    entity_id: id,
    changes: {
      previous_status: donation.status,
      refund_amount: requestedAmount,
      is_full_refund: isFullRefund,
      refund_note: updatePayload.refund_note,
    },
  });

  return NextResponse.json({
    ok: true,
    refund_amount: requestedAmount,
    status: updatePayload.status,
  });
}
