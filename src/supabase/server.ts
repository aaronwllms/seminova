import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getPublicSupabaseEnv } from '@/utils/env'

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 *
 * Display reads: use `getDisplayAuthClaims()` / `hasServerAuthSession()` in
 * layouts and server components (see `require-auth.ts`) — signature-verified,
 * exp-tolerated, never refresh. Session refresh and route gating stay
 * proxy-owned. Use `getUser()` only at mutation trust boundaries (server
 * actions) where the Auth server must validate the access token.
 *
 * The `setAll` catch below intentionally swallows cookie writes from Server
 * Components — RSC reads must not write cookies; refresh stays proxy-only.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const { supabaseUrl, publishableKey } = getPublicSupabaseEnv()

  return createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have proxy refreshing
          // user sessions.
        }
      },
    },
  })
}
