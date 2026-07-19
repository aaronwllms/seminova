'use server'

import { createClient } from '@/supabase/server'
import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
  type DataTablePageSize,
} from '@/constants/data-table'

import { assertAdminCaller } from './_lib/assert-admin-caller'
import {
  LOGS_SORT_DIRECTIONS,
  type AppLogCursor,
  type AppLogRow,
  type LogsSortDirection,
} from './_lib/app-log-row'
import {
  EMPTY_LOG_LIST_FILTERS,
  parseLogListFiltersInput,
  type LogListFilters,
} from './_lib/log-list-filters'
import { listAppLogsPage } from './_lib/list-app-logs'
import { listAppLogTags } from './_lib/list-app-log-tags'
import { isValidCursorCreatedAt } from './_lib/is-valid-cursor-created-at'
import {
  countFilteredUnreadLogs,
  markAllLogsRead,
  markLogRead,
  markLogUnread,
} from './_lib/mark-app-logs-read'
import { listAppLogStats, type AppLogStats } from './_lib/list-app-log-stats'
import { mapAdminActionFault } from '@/app/admin/_lib/map-admin-action-fault'
import type { LogsActionError } from './_lib/assert-admin-caller'

export type {
  AssertAdminCallerResult,
  LogsActionError,
} from './_lib/assert-admin-caller'

export type { LogListFilters } from './_lib/log-list-filters'
export type { AppLogStats } from './_lib/list-app-log-stats'

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

type MarkLogReadActionSuccess = {
  success: true
  data: { id: number }
}

export type MarkLogReadActionResult = MarkLogReadActionSuccess | LogsActionError

type MarkLogUnreadActionSuccess = {
  success: true
  data: { id: number }
}

export type MarkLogUnreadActionResult =
  | MarkLogUnreadActionSuccess
  | LogsActionError

type MarkAllLogsReadActionSuccess = {
  success: true
  data: { markedCount: number }
}

export type MarkAllLogsReadActionResult =
  | MarkAllLogsReadActionSuccess
  | LogsActionError

const isValidCursor = (cursor: AppLogCursor): boolean =>
  typeof cursor.createdAt === 'string' &&
  isValidCursorCreatedAt(cursor.createdAt) &&
  Number.isInteger(cursor.id) &&
  cursor.id > 0

const isValidLogId = (id: unknown): id is number =>
  typeof id === 'number' && Number.isInteger(id) && id > 0

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

export const markLogReadAction = async (input: {
  id: number
}): Promise<MarkLogReadActionResult> => {
  const authResult = await assertAdminCaller()

  if (!authResult.success) {
    return authResult
  }

  if (!isValidLogId(input.id)) {
    return {
      success: false,
      error: {
        message: 'Invalid log id',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  try {
    const client = await createClient()
    await markLogRead(client, input.id)

    return {
      success: true,
      data: { id: input.id },
    }
  } catch (caught) {
    return mapAdminActionFault(
      'logs-mark-read',
      'Failed to mark log read',
      'Something went wrong marking the log read. Please try again.',
      caught,
    )
  }
}

export const markLogUnreadAction = async (input: {
  id: number
}): Promise<MarkLogUnreadActionResult> => {
  const authResult = await assertAdminCaller()

  if (!authResult.success) {
    return authResult
  }

  if (!isValidLogId(input.id)) {
    return {
      success: false,
      error: {
        message: 'Invalid log id',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  try {
    const client = await createClient()
    await markLogUnread(client, input.id)

    return {
      success: true,
      data: { id: input.id },
    }
  } catch (caught) {
    return mapAdminActionFault(
      'logs-mark-unread',
      'Failed to mark log unread',
      'Something went wrong marking the log unread. Please try again.',
      caught,
    )
  }
}

export const markAllLogsReadAction = async (
  input: {
    filters?: LogListFilters
  } = {},
): Promise<MarkAllLogsReadActionResult> => {
  const authResult = await assertAdminCaller()

  if (!authResult.success) {
    return authResult
  }

  const filtersResult = parseLogListFiltersInput(
    input.filters ?? EMPTY_LOG_LIST_FILTERS,
  )

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

  try {
    const client = await createClient()
    const markedCount = await markAllLogsRead(client, filtersResult.filters)

    return {
      success: true,
      data: { markedCount },
    }
  } catch (caught) {
    return mapAdminActionFault(
      'logs-mark-all-read',
      'Failed to mark logs read',
      'Something went wrong marking logs read. Please try again.',
      caught,
    )
  }
}
