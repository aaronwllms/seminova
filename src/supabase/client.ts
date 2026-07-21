import { createBrowserClient } from '@supabase/ssr'

import { getPublicSupabaseEnv } from '@/utils/env'

export function createClient() {
  const { supabaseUrl, publishableKey } = getPublicSupabaseEnv()
  return createBrowserClient(supabaseUrl, publishableKey)
}
