import { createBrowserClient as _createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof _createBrowserClient> | undefined;

/** Browser client singleton — uses anon key, sets cookies for SSR */
export function createBrowserClient() {
  if (client) return client;
  client = _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return client;
}
