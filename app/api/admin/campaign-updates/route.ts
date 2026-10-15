import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { sendCampaignUpdateEmail } from '@/lib/email';

export async function POST(request: Request) {
  const staff = await requireStaff(['admin', 'finance']);
  const body = await request.json();
  const { campaign_id, title, body: updateBody, image_urls, disbursement_id } = body;

  if (!campaign_id || !title || !updateBody) {
    return NextResponse.json({ error: 'campaign_id, title, body wajib diisi' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify campaign exists and get title
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title')
    .eq('id', campaign_id)
    .single();

  if (!campaign) {
    return NextResponse.json({ error: 'Kampanye tidak ditemukan' }, { status: 404 });
  }

  const { data: update, error } = await supabase
    .from('campaign_updates')
    .insert({
      campaign_id,
      title,
      body: updateBody,
      image_urls: (image_urls ?? []) as string[],
      disbursement_id: disbursement_id || null,
      posted_by: staff.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get donor emails for this campaign (paid donations)
  const { data: donations } = await supabase
    .from('donations')
    .select('donor_contacts!inner(email_enc)')
    .eq('campaign_id', campaign_id)
    .eq('status', 'paid')
    .not('donor_contacts.email_enc', 'is', null);

  // Decrypt emails (masked for logging)
  const { decrypt } = await import('@/lib/crypto');
  const donorEmails = (donations as unknown as Array<{ donor_contacts: { email_enc: string | null } | null }> | null)
    ?.map((d) => {
      try {
        return d.donor_contacts?.email_enc ? decrypt(d.donor_contacts.email_enc) : null;
      } catch {
        return null;
      }
    }).filter((e): e is string => e !== null) || [];

  // Send notification email
  await sendCampaignUpdateEmail({
    campaignTitle: campaign.title,
    updateTitle: title,
    updateBody,
    donorEmails,
  });

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: staff.id,
    action: 'create',
    entity_type: 'campaign_update',
    entity_id: update.id,
    changes: { campaign_id, title, body: updateBody },
  });

  return NextResponse.json(update, { status: 201 });
}