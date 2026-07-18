import type { SupabaseClient } from '@supabase/supabase-js'

import {
  applyLogListFilters,
  type FilterableAppLogsQuery,
  type LogListFilters,
} from './log-list-filters'

type MarkAllReadQuery = FilterableAppLogsQuery &
  Promise<{ data: { id: number }[] | null; error: Error | null }>

type UnreadCountQuery = FilterableAppLogsQuery &
  Promise<{ count: number | null; error: Error | null }>

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
  const baseQuery = client
    .from('app_logs')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)
    .select('id') as unknown as MarkAllReadQuery

  const query = applyLogListFilters(baseQuery, filters) as MarkAllReadQuery

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
  const baseQuery = client.from('app_logs').select('id', {
    count: 'exact',
    head: true,
  }) as unknown as FilterableAppLogsQuery as UnreadCountQuery

  const query = applyLogListFilters(baseQuery, {
    ...filters,
    unreadOnly: true,
  }) as UnreadCountQuery

  const { count, error } = await query

  if (error) {
    throw error
  }

  return count ?? 0
}
