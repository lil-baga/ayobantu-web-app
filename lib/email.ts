export async function sendCampaignUpdateEmail({
  campaignTitle,
  updateTitle,
  updateBody,
  donorEmails,
}: {
  campaignTitle: string;
  updateTitle: string;
  updateBody: string;
  donorEmails: string[];
}) {
  // In lokal mode, just log to console
  // In production, integrate with email service (SendGrid, SMTP, etc.)
  console.log('=== Campaign Update Email Notification ===');
  console.log(`Campaign: ${campaignTitle}`);
  console.log(`Update Title: ${updateTitle}`);
  console.log(`Update Body: ${updateBody}`);
  console.log(`Sent to ${donorEmails.length} donors:`);
  donorEmails.forEach((email, i) => {
    console.log(`  ${i + 1}. ${email}`);
  });
  console.log('========================================');
  // Simulate async delay
  await new Promise((resolve) => setTimeout(resolve, 100));
}