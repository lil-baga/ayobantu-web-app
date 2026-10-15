import { z } from 'zod';

export const campaignSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter').max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug hanya huruf kecil, angka, dan strip'),
  story: z.string().min(20, 'Cerita minimal 20 karakter'),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  target_amount: z.coerce.number().int().min(100000, 'Target minimal Rp100.000'),
  status: z.enum(['draft', 'active', 'closed', 'suspended']).default('draft'),
  operational_fee_bps: z.coerce.number().int().min(0).max(1000).default(500),
  beneficiary_name: z.string().min(2, 'Nama penerima minimal 2 karakter'),
  starts_at: z.string().optional().or(z.literal('')),
  ends_at: z.string().optional().or(z.literal('')),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
