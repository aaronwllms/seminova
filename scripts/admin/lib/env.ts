export interface AdminEnv {
  supabaseUrl: string
  secretKey: string
}

export const loadAdminEnv = (): AdminEnv => {
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
