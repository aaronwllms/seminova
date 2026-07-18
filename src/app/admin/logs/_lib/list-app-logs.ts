import type { SupabaseClient } from '@supabase/supabase-js'

import { DATA_TABLE_DEFAULT_PAGE_SIZE } from '@/constants/data-table'

import {
  mapAppLogRow,
  type AppLogCursor,
  type AppLogRow,
  type LogsSortDirection,
} from './app-log-row'
import { isValidCursorCreatedAt } from './is-valid-cursor-created-at'

const APP_LOG_COLUMNS = 'id, level, tag, message, context, created_at'

export interface ListAppLogsPageParams {
  cursor?: AppLogCursor | null
  sortDirection?: LogsSortDirection
  perPage?: number
}

export interface ListAppLogsPageResult {
  rows: AppLogRow[]
  hasNextPage: boolean
}

const buildCursorFilter = (
  cursor: AppLogCursor,
  sortDirection: LogsSortDirection,
): string => {
  const { createdAt, id } = cursor

  if (sortDirection === 'desc') {
    return `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`
  }

  return `created_at.gt.${createdAt},and(created_at.eq.${createdAt},id.gt.${id})`
}

export const listAppLogsPage = async (
  client: SupabaseClient,
  params: ListAppLogsPageParams,
): Promise<ListAppLogsPageResult> => {
  const perPage = params.perPage ?? DATA_TABLE_DEFAULT_PAGE_SIZE
  const sortDirection = params.sortDirection ?? 'desc'
  const fetchLimit = perPage + 1
  const ascending = sortDirection === 'asc'

  let query = client.from('app_logs').select(APP_LOG_COLUMNS)

  if (params.cursor) {
    if (!isValidCursorCreatedAt(params.cursor.createdAt)) {
      throw new Error('Invalid cursor createdAt')
    }

    query = query.or(buildCursorFilter(params.cursor, sortDirection))
  }

  const { data, error } = await query
    .order('created_at', { ascending })
    .order('id', { ascending })
    .limit(fetchLimit)

  if (error) {
    throw error
  }

  const fetched = data ?? []
  const hasNextPage = fetched.length > perPage
  const pageRows = hasNextPage ? fetched.slice(0, perPage) : fetched

  return {
    rows: pageRows.map(mapAppLogRow),
    hasNextPage,
  }
}
