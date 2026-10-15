import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const reportSchema = z.object({
  campaign_id: z.string().uuid(),
  reason: z.string().min(5, 'Alasan minimal 5 karakter').max(500),
  details: z.string().max(2000).optional(),
  reporter_contact: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify campaign exists and is active
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id')
    .eq('id', parsed.data.campaign_id)
    .eq('status', 'active')
    .single();

  if (!campaign) {
    return NextResponse.json({ error: 'Kampanye tidak ditemukan' }, { status: 404 });
  }

  const { error } = await supabase.from('reports').insert(parsed.data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
