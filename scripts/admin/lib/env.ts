export interface AdminEnv {
  supabaseUrl: string
  serviceRoleKey: string
}

export const loadAdminEnv = (): AdminEnv => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error(
      '[admin-cli] Missing NEXT_PUBLIC_SUPABASE_URL — add it to .env.local',
    )
    process.exit(1)
  }

  if (!serviceRoleKey) {
    console.error(
      '[admin-cli] Missing SUPABASE_SERVICE_ROLE_KEY — add it to .env.local',
    )
    process.exit(1)
  }

  return { supabaseUrl, serviceRoleKey }
}
