import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { getServiceSupabaseEnv } from '@/utils/env'

export const createServiceClient = (): SupabaseClient => {
  const { supabaseUrl, secretKey } = getServiceSupabaseEnv()

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
