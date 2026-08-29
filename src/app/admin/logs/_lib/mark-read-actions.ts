'use server'

import { createClient } from '@/supabase/server'
import { mapAdminActionFault } from '@/app/admin/_lib/map-admin-action-fault'

import {
  assertAdminCaller,
  type AdminActionError,
} from '@/app/admin/_lib/assert-admin-caller'
import {
  EMPTY_LOG_LIST_FILTERS,
  parseLogListFiltersInput,
  type LogListFilters,
} from './log-list-filters'
import {
  markAllLogsRead,
  markLogRead,
  markLogUnread,
} from './mark-app-logs-read'

type MarkLogReadActionSuccess = {
  success: true
  data: { id: number }
}

export type MarkLogReadActionResult =
  | MarkLogReadActionSuccess
  | AdminActionError

type MarkLogUnreadActionSuccess = {
  success: true
  data: { id: number }
}

export type MarkLogUnreadActionResult =
  | MarkLogUnreadActionSuccess
  | AdminActionError

type MarkAllLogsReadActionSuccess = {
  success: true
  data: { markedCount: number }
}

export type MarkAllLogsReadActionResult =
  | MarkAllLogsReadActionSuccess
  | AdminActionError

const isValidLogId = (id: unknown): id is number =>
  typeof id === 'number' && Number.isInteger(id) && id > 0

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
