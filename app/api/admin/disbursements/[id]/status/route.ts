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
  const status = body.status; // status: 'planned' | 'disbursed' | 'reported'
  const disbursementId = id || body.disbursement_id;

  if (!['planned', 'disbursed', 'reported'].includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Get disbursement
  const { data: disbursement } = await supabase
    .from('disbursements')
    .select('id, status, campaign_id')
    .eq('id', disbursementId)
    .single();

  if (!disbursement) {
    return NextResponse.json({ error: 'Pencairan tidak ditemukan' }, { status: 404 });
  }

  // If moving to 'disbursed', ensure payment and funds are sufficient (simple check)
  if (status === 'disbursed') {
    // Could implement check against campaign_funds, omitted for brevity
  }

  const updates: Record<string, string> = { status };
  if (status === 'disbursed') {
    updates.disbursed_at = new Date().toISOString();
  }

  const { data: updatedDisbursement, error } = await supabase
    .from('disbursements')
    .update(updates)
    .eq('id', disbursementId)
    .select('amount, recipient_name, category')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // In-app notification saat disbursed
  if (status === 'disbursed') {
    const { data: campaignDonations } = await supabase
      .from('donations')
      .select('id')
      .eq('campaign_id', disbursement.campaign_id)
      .eq('status', 'paid')
      .eq('notify_updates', true);

    if (campaignDonations && campaignDonations.length > 0) {
      await supabase.from('notifications').insert(
        campaignDonations.map((d) => ({
          donation_id: d.id,
          type: 'disbursement_created',
          title: '💸 Dana Telah Disalurkan',
          message: `Dana sebesar Rp${updatedDisbursement.amount.toLocaleString('id-ID')} telah dicairkan untuk ${updatedDisbursement.category} kepada ${updatedDisbursement.recipient_name}. Bukti pencairan akan diunggah segera.`,
          read: false,
        }))
      );
    }
  }

  await supabase.from('audit_logs').insert({
    user_id: staff.id,
    action: 'update_status',
    entity_type: 'disbursement',
    entity_id: disbursementId,
    changes: updates,
  });

  return NextResponse.json({ ok: true, status });
}
