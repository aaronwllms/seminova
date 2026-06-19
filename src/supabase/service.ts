import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const getServiceEnv = (): { supabaseUrl: string; secretKey: string } => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl) {
    throw new Error(
      '[supabase-service] Missing NEXT_PUBLIC_SUPABASE_URL — add it to .env.local',
    )
  }

  if (!secretKey) {
    throw new Error(
      '[supabase-service] Missing SUPABASE_SECRET_KEY — add it to .env.local',
    )
  }

  return { supabaseUrl, secretKey }
}

export const createServiceClient = (): SupabaseClient => {
  const { supabaseUrl, secretKey } = getServiceEnv()

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const getServiceEnvForFetch = (): {
  supabaseUrl: string
  secretKey: string
} => getServiceEnv()
