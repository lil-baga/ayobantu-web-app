import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PAYMENT_MODE: z.enum(['local']).default('local'),
  ENCRYPTION_KEY: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  MINIMUM_DONATION_AMOUNT: z.coerce.number().int().positive().default(10000),
  DEFAULT_OPERATIONAL_FEE_BPS: z.coerce.number().int().min(0).max(1000).default(500),
  PENDING_PAYMENT_EXPIRY_HOURS: z.coerce.number().int().positive().default(24),
});

type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  return envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PAYMENT_MODE: process.env.PAYMENT_MODE,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    MINIMUM_DONATION_AMOUNT: process.env.MINIMUM_DONATION_AMOUNT,
    DEFAULT_OPERATIONAL_FEE_BPS: process.env.DEFAULT_OPERATIONAL_FEE_BPS,
    PENDING_PAYMENT_EXPIRY_HOURS: process.env.PENDING_PAYMENT_EXPIRY_HOURS,
  });
}

// ponytail: lazy singleton; upgrade to module-scoped if env changes at runtime
let _env: Env | undefined;
export function env(): Env {
  if (!_env) _env = getEnv();
  return _env;
}
