import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  const staff = await requireStaff(['admin']);
  const body = await request.json();
  const { report_id, status } = body;

  if (!report_id || !['reviewed', 'closed'].includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: report } = await supabase
    .from('reports')
    .select('id, status')
    .eq('id', report_id)
    .single();

  if (!report) {
    return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
  }

  const { error } = await supabase
    .from('reports')
    .update({
      status,
      handled_by: staff.id,
    })
    .eq('id', report_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('audit_logs').insert({
    user_id: staff.id,
    action: 'handle_report',
    entity_type: 'report',
    entity_id: report_id,
    changes: { status },
  });

  return NextResponse.json({ ok: true, status });
}