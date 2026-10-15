import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const staff = await requireStaff(['admin', 'finance']);
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Disbursement ID required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify disbursement exists
  const { data: disbursement } = await supabase
    .from('disbursements')
    .select('id, status')
    .eq('id', id)
    .single();

  if (!disbursement) {
    return NextResponse.json({ error: 'Pencairan tidak ditemukan' }, { status: 404 });
  }

  if (disbursement.status !== 'disbursed') {
    return NextResponse.json({ error: 'Hanya boleh mengupload bukti untuk pencairan yang sudah dicairkan' }, { status: 400 });
  }

  // Create proof record (file URL will be set by storage upload)
  const { data: proof, error } = await supabase
    .from('disbursement_proofs')
    .insert({
      disbursement_id: id,
      file_url: '', // Will be updated after upload
      kind: 'nota',
      uploaded_by: staff.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('audit_logs').insert({
    user_id: staff.id,
    action: 'upload_proof',
    entity_type: 'disbursement',
    entity_id: id,
    changes: { proof_id: proof.id },
  });

  return NextResponse.json({ ok: true, proof_id: proof.id });
}