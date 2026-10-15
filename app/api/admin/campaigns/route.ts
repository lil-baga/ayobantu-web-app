import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { campaignSchema } from '@/lib/validations/campaign';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const staff = await requireStaff(['admin']);

  const body = await request.json();
  const parsed = campaignSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      ...parsed.data,
      cover_image_url: parsed.data.cover_image_url || null,
      starts_at: parsed.data.starts_at || null,
      ends_at: parsed.data.ends_at || null,
      created_by: staff.id,
    })
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
    action: 'create',
    entity_type: 'campaign',
    entity_id: data.id,
    changes: parsed.data,
  });

  return NextResponse.json(data, { status: 201 });
}
