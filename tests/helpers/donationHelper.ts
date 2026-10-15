import { createAdminClient } from '@/lib/supabase/admin';
import { encrypt } from '@/lib/crypto';

/**
 * Helper untuk membuat donation lewat API dan memverifikasi status
 */
export async function createDonation({
  campaignId,
  amount,
  displayName,
  isAnonymous = false,
  email,
  phone,
}: {
  campaignId: string;
  amount: number;
  displayName?: string;
  isAnonymous?: boolean;
  email?: string;
  phone?: string;
}) {
  const supabase = createAdminClient();

  // Insert donor contact (encrypted)
  const contactRes = await supabase
    .from('donor_contacts')
    .insert({
      email_enc: email ? encrypt(email) : null,
      phone_enc: phone ? encrypt(phone) : null,
    })
    .select('id')
    .single();

  const donorContactId = contactRes.data?.id;

  // Create donation (status pending)
  const donationRes = await supabase
    .from('donations')
    .insert({
      campaign_id: campaignId,
      amount,
      display_name: displayName,
      is_anonymous: isAnonymous,
      donor_contact_id: donorContactId,
      status: 'pending',
    })
    .select('id, tracking_token')
    .single();

  return donationRes.data;
}
