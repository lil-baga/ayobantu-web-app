import { createAdminClient } from '@/lib/supabase/admin';

describe('Disbursement Flow', () => {
  let campaignId: string;

  beforeAll(async () => {
    const supabase = createAdminClient();
    
    // Get or create active campaign
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('status', 'active')
      .limit(1)
      .single();

    if (campaign) {
      campaignId = campaign.id;
    } else {
      // Create test campaign
      const { data: newCampaign } = await supabase
        .from('campaigns')
        .insert({
          title: 'Test Campaign',
          slug: 'test-campaign-' + Date.now(),
          story: 'Test story',
          beneficiary_name: 'Test Beneficiary',
          target_amount: 1000000,
          status: 'active',
        })
        .select('id')
        .single();
      
      campaignId = newCampaign!.id;
    }
  });

  test('create disbursement → update status → verify', async () => {
    const supabase = createAdminClient();

    // Get staff ID
    const { data: staff } = await supabase.from('staff_profiles').select('id').limit(1).single();

    // Create disbursement (planned status)
    const { data: disb, error: createError } = await supabase
      .from('disbursements')
      .insert({
        campaign_id: campaignId,
        amount: 100000,
        category: 'Logistik',
        recipient_name: 'Beni Test',
        description: 'Test disbursement',
        disbursed_at: new Date().toISOString(),
        created_by: staff!.id,
        status: 'planned',
      })
      .select()
      .single();

    expect(createError).toBeNull();
    expect(disb).toBeTruthy();
    expect(disb!.status).toBe('planned');

    // Update status to disbursed
    const { error: updateError } = await supabase
      .from('disbursements')
      .update({ 
        status: 'disbursed', 
        disbursed_at: new Date().toISOString() 
      })
      .eq('id', disb!.id);

    expect(updateError).toBeNull();

    // Verify status changed
    const { data: updated } = await supabase
      .from('disbursements')
      .select('status, disbursed_at')
      .eq('id', disb!.id)
      .single();

    expect(updated?.status).toBe('disbursed');
    expect(updated?.disbursed_at).toBeTruthy();

    // Update to reported
    const { error: reportError } = await supabase
      .from('disbursements')
      .update({ status: 'reported' })
      .eq('id', disb!.id);

    expect(reportError).toBeNull();

    // Verify final status
    const { data: final } = await supabase
      .from('disbursements')
      .select('status')
      .eq('id', disb!.id)
      .single();

    expect(final?.status).toBe('reported');
  });

  test('verify storage bucket exists', async () => {
    const supabase = createAdminClient();
    
    const { data: bucket, error } = await supabase
      .storage
      .getBucket('disbursement-proofs');

    expect(error).toBeNull();
    expect(bucket).toBeTruthy();
  });
});
