import type { SupabaseClient } from '@supabase/supabase-js'

export interface AdminUserStats {
  total: number
  unverified: number
  banned: number
}

export const listAdminUserStats = async (
  client: SupabaseClient,
): Promise<AdminUserStats> => {
  const { data, error } = await client.rpc('admin_user_stats')

  if (error) {
    throw error
  }

  const row = data?.[0]

  return {
    total: Number(row?.total ?? 0),
    unverified: Number(row?.unverified ?? 0),
    banned: Number(row?.banned ?? 0),
  }
}
