import { z } from 'zod';

export const donationSchema = z.object({
  campaign_id: z.string().uuid(),
  amount: z.coerce.number().int().min(10000, 'Donasi minimal Rp10.000'),
  display_name: z.string().max(100).optional().or(z.literal('')),
  is_anonymous: z.boolean().default(false),
  message: z.string().max(500).optional().or(z.literal('')),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  phone: z.string().min(8, 'Nomor telepon minimal 8 digit').max(20).optional().or(z.literal('')),
  notify_updates: z.boolean().default(false),
  method: z.enum(['transfer', 'qris']).default('transfer'),
}).refine(
  (data) => data.email || data.phone,
  { message: 'Email atau nomor telepon wajib diisi', path: ['email'] }
);

export type DonationInput = z.infer<typeof donationSchema>;
