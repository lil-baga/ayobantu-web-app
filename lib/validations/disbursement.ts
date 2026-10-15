import { z } from 'zod';

export const disbursementSchema = z.object({
  campaign_id: z.string().uuid(),
  amount: z.coerce.number().int().positive(),
  category: z.string().min(2),
  description: z.string().optional(),
  recipient_name: z.string().min(2),
  disbursed_at: z.string().optional(), // ISO date string
});

export type DisbursementInput = z.infer<typeof disbursementSchema>;
