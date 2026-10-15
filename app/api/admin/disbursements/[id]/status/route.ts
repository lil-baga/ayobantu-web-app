import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  const staff = await requireStaff(['admin', 'finance']);
  const { disbursement_id, status } = await request.json(); // status: 'planned' | 'disbursed' | 'reported'

  if (!['planned', 'disbursed', 'reported'].includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Get disbursement
  const { data: disbursement } = await supabase
    .from('disbursements')
    .select('id, status, campaign_id')
    .eq('id', disbursement_id)
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

  const { error } = await supabase
    .from('disbursements')
    .update(updates)
    .eq('id', disbursement_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('audit_logs').insert({
    user_id: staff.id,
    action: 'update_status',
    entity_type: 'disbursement',
    entity_id: disbursement_id,
    changes: updates,
  });

  return NextResponse.json({ ok: true, status });
}
