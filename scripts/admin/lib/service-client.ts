import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { AdminEnv } from './env'

export const createServiceClient = (env: AdminEnv): SupabaseClient => {
  return createClient(env.supabaseUrl, env.secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
