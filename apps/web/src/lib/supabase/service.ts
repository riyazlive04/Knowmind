import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for privileged server-side writes.
 *
 * Used ONLY in server routes (e.g. /api/lead) for operations the anon key
 * cannot perform — notably creating `member` rows (anon has SELECT-only on
 * member per migration 006). NEVER import this into client components: the
 * service-role key bypasses RLS entirely.
 *
 * Returns null-safe: throws a clear error if the key is missing so the route
 * can surface a 500 with an actionable message instead of a cryptic failure.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase service-role client unavailable: set SUPABASE_SERVICE_ROLE_KEY in apps/web/.env'
    )
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
