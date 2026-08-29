import type { SupabaseClient } from '@supabase/supabase-js'

import { LOG_LEVELS, type LogLevel } from '@/types/app-settings'

export interface AppLogStats {
  total: number
  debug: number
  info: number
  warn: number
  error: number
  unread: number
}

const countWithFilter = async (
  client: SupabaseClient,
  level?: LogLevel,
  unreadOnly = false,
): Promise<number> => {
  let query = client
    .from('app_logs')
    .select('*', { count: 'exact', head: true })

  if (level) {
    query = query.eq('level', level)
  }

  if (unreadOnly) {
    query = query.is('read_at', null)
  }

  const { count, error } = await query

  if (error) {
    throw error
  }

  return count ?? 0
}

export const listAppLogStats = async (
  client: SupabaseClient,
): Promise<AppLogStats> => {
  const [total, unread, debug = 0, info = 0, warn = 0, errorLevel = 0] =
    await Promise.all([
      countWithFilter(client),
      countWithFilter(client, undefined, true),
      ...LOG_LEVELS.map((level) => countWithFilter(client, level)),
    ])

  return {
    total,
    debug,
    info,
    warn,
    error: errorLevel,
    unread,
  }
}
