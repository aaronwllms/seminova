export type PublicSupabaseEnv = {
  supabaseUrl: string
  publishableKey: string
}

export type ServiceSupabaseEnv = {
  supabaseUrl: string
  secretKey: string
}

export const hasPublicSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
)

export const getPublicSupabaseEnv = (): PublicSupabaseEnv => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      '[supabase-env] Missing NEXT_PUBLIC_SUPABASE_URL — add it to .env.local',
    )
  }

  if (!publishableKey) {
    throw new Error(
      '[supabase-env] Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — add it to .env.local',
    )
  }

  return { supabaseUrl, publishableKey }
}

export const getServiceSupabaseEnv = (): ServiceSupabaseEnv => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl) {
    throw new Error(
      '[supabase-env] Missing NEXT_PUBLIC_SUPABASE_URL — add it to .env.local',
    )
  }

  if (!secretKey) {
    throw new Error(
      '[supabase-env] Missing SUPABASE_SECRET_KEY — add it to .env.local',
    )
  }

  return { supabaseUrl, secretKey }
}

export const getSupabaseUrlOptional = (): string | undefined =>
  process.env.NEXT_PUBLIC_SUPABASE_URL

export const getSupabaseOrigin = (): string | null => {
  const supabaseUrl = getSupabaseUrlOptional()

  if (!supabaseUrl) {
    return null
  }

  try {
    return new URL(supabaseUrl).origin
  } catch {
    return null
  }
}

export const getSupabaseProjectRef = (): string | null => {
  const supabaseUrl = getSupabaseUrlOptional()

  if (!supabaseUrl) {
    return null
  }

  try {
    return new URL(supabaseUrl).hostname.split('.')[0] ?? null
  } catch {
    return null
  }
}

export const loadServiceEnvForCli = (): ServiceSupabaseEnv => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl) {
    console.error(
      '[admin-cli] Missing NEXT_PUBLIC_SUPABASE_URL — add it to .env.local',
    )
    process.exit(1)
  }

  if (!secretKey) {
    console.error(
      '[admin-cli] Missing SUPABASE_SECRET_KEY — add it to .env.local',
    )
    process.exit(1)
  }

  return { supabaseUrl, secretKey }
}
