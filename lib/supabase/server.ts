import { createServerClient as _createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Server component / route handler client — respects RLS via user session */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Can't set cookies in Server Components, only Route Handlers
          }
        },
      },
    },
  );
}
