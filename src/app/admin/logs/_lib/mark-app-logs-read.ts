import type { SupabaseClient } from '@supabase/supabase-js'

import { applyLogListFilters, type LogListFilters } from './log-list-filters'

export const markLogRead = async (
  client: SupabaseClient,
  id: number,
): Promise<void> => {
  const { error } = await client
    .from('app_logs')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    throw error
  }
}

export const markLogUnread = async (
  client: SupabaseClient,
  id: number,
): Promise<void> => {
  const { error } = await client
    .from('app_logs')
    .update({ read_at: null })
    .eq('id', id)

  if (error) {
    throw error
  }
}

export const markAllLogsRead = async (
  client: SupabaseClient,
  filters: LogListFilters,
): Promise<number> => {
  const query = applyLogListFilters(
    client
      .from('app_logs')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null)
      .select('id'),
    filters,
  )

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data?.length ?? 0
}

export const countFilteredUnreadLogs = async (
  client: SupabaseClient,
  filters: LogListFilters,
): Promise<number> => {
  const query = applyLogListFilters(
    client.from('app_logs').select('id', {
      count: 'exact',
      head: true,
    }),
    {
      ...filters,
      unreadOnly: true,
    },
  )

  const { count, error } = await query

  if (error) {
    throw error
  }

  return count ?? 0
}
