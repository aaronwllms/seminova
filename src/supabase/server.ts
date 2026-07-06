import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getPublicSupabaseEnv } from '@/utils/env'

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 *
 * Auth reads: use `requireAuthClaims()` / `hasServerAuthSession()` in layouts
 * and server components (see `require-auth.ts`) so session refresh stays
 * proxy-owned. Use `getUser()` only at mutation trust boundaries (server
 * actions) where the Auth server must validate the access token.
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
