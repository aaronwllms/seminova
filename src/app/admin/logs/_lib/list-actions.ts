'use server'

import { createClient } from '@/supabase/server'
import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
  type DataTablePageSize,
} from '@/constants/data-table'
import { mapAdminActionFault } from '@/app/admin/_lib/map-admin-action-fault'

import { assertAdminCaller } from './assert-admin-caller'
import {
  LOGS_SORT_DIRECTIONS,
  type AppLogCursor,
  type AppLogRow,
  type LogsSortDirection,
} from './app-log-row'
import {
  parseLogListFiltersInput,
  type LogListFilters,
} from './log-list-filters'
import { listAppLogsPage } from './list-app-logs'
import { listAppLogTags } from './list-app-log-tags'
import { isValidCursorCreatedAt } from './is-valid-cursor-created-at'
import { countFilteredUnreadLogs } from './mark-app-logs-read'
import { listAppLogStats, type AppLogStats } from './list-app-log-stats'
import type { LogsActionError } from './assert-admin-caller'

type ListLogsActionSuccess = {
  success: true
  data: {
    rows: AppLogRow[]
    hasNextPage: boolean
    filteredUnreadCount: number
  }
}

export type ListLogsActionResult = ListLogsActionSuccess | LogsActionError

export interface ListLogsActionInput {
  cursor?: AppLogCursor | null
  sortDirection?: LogsSortDirection
  perPage?: DataTablePageSize
  filters?: LogListFilters
}

type StatsActionSuccess = {
  success: true
  data: AppLogStats
}

export type GetLogStatsActionResult = StatsActionSuccess | LogsActionError

type TagsActionSuccess = {
  success: true
  data: string[]
}

export type ListLogTagsActionResult = TagsActionSuccess | LogsActionError

const isValidCursor = (cursor: AppLogCursor): boolean =>
  typeof cursor.createdAt === 'string' &&
  isValidCursorCreatedAt(cursor.createdAt) &&
  Number.isInteger(cursor.id) &&
  cursor.id > 0

export const listLogsAction = async (
  input: ListLogsActionInput = {},
): Promise<ListLogsActionResult> => {
  const authResult = await assertAdminCaller()

  if (!authResult.success) {
    return authResult
  }

  if (input.cursor !== undefined && input.cursor !== null) {
    if (!isValidCursor(input.cursor)) {
      return {
        success: false,
        error: {
          message: 'Invalid cursor',
          code: 'VALIDATION_ERROR',
          kind: 'operational',
        },
      }
    }
  }

  const perPage = input.perPage ?? DATA_TABLE_DEFAULT_PAGE_SIZE

  if (!DATA_TABLE_PAGE_SIZE_OPTIONS.includes(perPage)) {
    return {
      success: false,
      error: {
        message: 'Page size must be 10, 15, 25, or 50',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  const sortDirection = input.sortDirection ?? 'desc'

  if (!LOGS_SORT_DIRECTIONS.includes(sortDirection)) {
    return {
      success: false,
      error: {
        message: 'Sort direction must be asc or desc',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  const filtersResult = parseLogListFiltersInput(input.filters)

  if (!filtersResult.success) {
    return {
      success: false,
      error: {
        message: filtersResult.message,
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  const filters = filtersResult.filters

  try {
    const client = await createClient()
    const [result, filteredUnreadCount] = await Promise.all([
      listAppLogsPage(client, {
        cursor: input.cursor ?? null,
        sortDirection,
        perPage,
        filters,
      }),
      countFilteredUnreadLogs(client, filters),
    ])

    return {
      success: true,
      data: {
        ...result,
        filteredUnreadCount,
      },
    }
  } catch (caught) {
    return mapAdminActionFault(
      'logs-list',
      'Failed to list logs',
      'Something went wrong loading logs. Please try again.',
      caught,
    )
  }
}

export const getLogStatsAction = async (): Promise<GetLogStatsActionResult> => {
  const authResult = await assertAdminCaller()

  if (!authResult.success) {
    return authResult
  }

  try {
    const client = await createClient()
    const stats = await listAppLogStats(client)

    return {
      success: true,
      data: stats,
    }
  } catch (caught) {
    return mapAdminActionFault(
      'logs-stats',
      'Failed to load log stats',
      'Something went wrong loading log stats. Please try again.',
      caught,
    )
  }
}

export const listLogTagsAction = async (): Promise<ListLogTagsActionResult> => {
  const authResult = await assertAdminCaller()

  if (!authResult.success) {
    return authResult
  }

  try {
    const client = await createClient()
    const tags = await listAppLogTags(client)

    return {
      success: true,
      data: tags,
    }
  } catch (caught) {
    return mapAdminActionFault(
      'logs-tags',
      'Failed to load log tags',
      'Something went wrong loading log tags. Please try again.',
      caught,
    )
  }
}
