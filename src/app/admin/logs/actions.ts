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
import { listAppLogsPage } from './_lib/list-app-logs'
import { mapUsersActionFault } from '@/app/admin/users/_lib/map-users-action-fault'
import type { LogsActionError } from './_lib/assert-admin-caller'

export type {
  AssertAdminCallerResult,
  LogsActionError,
} from './_lib/assert-admin-caller'

type ListLogsActionSuccess = {
  success: true
  data: {
    rows: AppLogRow[]
    hasNextPage: boolean
  }
}

export type ListLogsActionResult = ListLogsActionSuccess | LogsActionError

export interface ListLogsActionInput {
  cursor?: AppLogCursor | null
  sortDirection?: LogsSortDirection
  perPage?: DataTablePageSize
}

const isValidCursor = (cursor: AppLogCursor): boolean =>
  typeof cursor.createdAt === 'string' &&
  cursor.createdAt.length > 0 &&
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

  try {
    const client = await createClient()
    const result = await listAppLogsPage(client, {
      cursor: input.cursor ?? null,
      sortDirection,
      perPage,
    })

    return {
      success: true,
      data: result,
    }
  } catch (caught) {
    return mapUsersActionFault(
      'logs-list',
      'Failed to list logs',
      'Something went wrong loading logs. Please try again.',
      caught,
    )
  }
}
