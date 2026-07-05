import { createBrowserClient } from '@supabase/ssr'

let stoppedBrowserAutoRefresh = false

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )

  // Session refresh is owned by the server proxy. Browser auto-refresh races
  // with proxy rotation and causes "refresh token already used" errors.
  if (!stoppedBrowserAutoRefresh) {
    stoppedBrowserAutoRefresh = true
    void client.auth.stopAutoRefresh()
  }

  return client
}
