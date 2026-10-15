import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { campaignSchema } from '@/lib/validations/campaign';
import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  const staff = await requireStaff(['admin']);

  const body = await request.json();
  const parsed = campaignSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Get old data for audit
  const { data: old } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (!old) {
    return NextResponse.json({ error: 'Kampanye tidak ditemukan' }, { status: 404 });
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if ('cover_image_url' in updateData && !updateData.cover_image_url) {
    updateData.cover_image_url = null;
  }
  if ('starts_at' in updateData && !updateData.starts_at) {
    updateData.starts_at = null;
  }
  if ('ends_at' in updateData && !updateData.ends_at) {
    updateData.ends_at = null;
  }

  const { data, error } = await supabase
    .from('campaigns')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug sudah digunakan' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: staff.id,
    action: 'update',
    entity_type: 'campaign',
    entity_id: id,
    changes: { before: old, after: data },
  });

  return NextResponse.json(data);
}
