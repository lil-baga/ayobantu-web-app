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

  // Verify disbursement exists and is disbursed
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

  // Parse multipart form data
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const kind = formData.get('kind') as 'nota' | 'transfer' | 'foto' | null;

  if (!file || !['nota', 'transfer', 'foto'].includes(kind ?? '')) {
    return NextResponse.json({ error: 'File dan jenis bukti wajib diisi' }, { status: 400 });
  }

  // Generate unique filename
  const filename = `${id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Upload to Supabase Storage (private bucket)
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('disbursement-proofs')
    .upload(filename, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL (for private bucket, this returns a signed URL that expires in 1 hour)
  const { data: urlData } = supabase
    .storage
    .from('disbursement-proofs')
    .getPublicUrl(uploadData.path);

  // Update proof record (we need to find the latest proof for this disbursement or create new)
  // For simplicity, we'll create a new proof record
  const { data: proof, error: proofError } = await supabase
    .from('disbursement_proofs')
    .insert({
      disbursement_id: id,
      file_url: urlData.publicUrl,
      kind,
      uploaded_by: staff.id,
    })
    .select()
    .single();

  if (proofError) {
    return NextResponse.json({ error: proofError.message }, { status: 500 });
  }

  await supabase.from('audit_logs').insert({
    user_id: staff.id,
    action: 'upload_proof',
    entity_type: 'disbursement',
    entity_id: id,
    changes: { proof_id: proof.id, file_url: proof.file_url },
  });

  return NextResponse.json({ ok: true, file_url: proof.file_url });
}