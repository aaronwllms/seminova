import { createBrowserClient } from '@supabase/ssr'

import { getPublicSupabaseEnv } from '@/utils/env'

let stoppedBrowserAutoRefresh = false

export function createClient() {
  const { supabaseUrl, publishableKey } = getPublicSupabaseEnv()
  const client = createBrowserClient(supabaseUrl, publishableKey)

  // Session refresh is owned by the server proxy. Browser auto-refresh races
  // with proxy rotation and causes "refresh token already used" errors.
  if (!stoppedBrowserAutoRefresh) {
    stoppedBrowserAutoRefresh = true
    void client.auth.stopAutoRefresh()
  }

  return client
}
