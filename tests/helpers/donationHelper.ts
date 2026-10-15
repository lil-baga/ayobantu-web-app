import { createAdminClient } from '@/lib/supabase/admin';
import { encrypt } from '@/lib/crypto';
import crypto from 'crypto';

/**
 * Helper untuk membuat donation di DB untuk test
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
  const { data: contact, error: contactError } = await supabase
    .from('donor_contacts')
    .insert({
      email_enc: email ? encrypt(email) : null,
      phone_enc: phone ? encrypt(phone) : null,
    })
    .select('id')
    .single();

  if (contactError || !contact) {
    throw new Error(`Failed to create contact: ${contactError?.message}`);
  }

  const trackingToken = crypto.randomBytes(32).toString('hex');
  const trackingTokenHash = crypto.createHash('sha256').update(trackingToken).digest('hex');

  // Create donation (status pending)
  const { data: donation, error: donationError } = await supabase
    .from('donations')
    .insert({
      campaign_id: campaignId,
      amount,
      display_name: displayName,
      is_anonymous: isAnonymous,
      donor_contact_id: contact.id,
      status: 'pending',
      tracking_token_hash: trackingTokenHash,
    })
    .select('id')
    .single();

  if (donationError || !donation) {
    throw new Error(`Failed to create donation: ${donationError?.message}`);
  }

  // Create payment record
  await supabase.from('payments').insert({
    donation_id: donation.id,
    gateway: 'local',
    gateway_order_id: `LOCAL-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    method: 'qris',
    gross_amount: amount,
    status: 'pending',
  });

  return {
    id: donation.id,
    tracking_token: trackingToken,
  };
}
