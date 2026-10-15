import { createAdminClient } from '@/lib/supabase/admin';
import { disbursementSchema } from '@/lib/validations/disbursement';
import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth/staff';

export async function POST(request: Request) {
  const staff = await requireStaff(['admin', 'finance']);
  const body = await request.json();
  const parsed = disbursementSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify campaign exists and active
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, status')
    .eq('id', parsed.data.campaign_id)
    .single();

  if (!campaign || campaign.status !== 'active') {
    return NextResponse.json({ error: 'Kampanye tidak aktif atau tidak ditemukan' }, { status: 404 });
  }

  // Insert disbursement with status 'planned'
  const { data, error } = await supabase
    .from('disbursements')
    .insert({
      ...parsed.data,
      disbursed_at: parsed.data.disbursed_at || new Date().toISOString(),
      status: 'planned',
      created_by: staff.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: staff.id,
    action: 'create',
    entity_type: 'disbursement',
    entity_id: data.id,
    changes: parsed.data,
  });

  return NextResponse.json(data, { status: 201 });
}
