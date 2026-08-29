'use server'

import { createClient } from '@/supabase/server'
import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
  type DataTablePageSize,
} from '@/constants/data-table'
import { mapAdminActionFault } from '@/app/admin/_lib/map-admin-action-fault'

import {
  assertAdminCaller,
  type AdminActionError,
} from '@/app/admin/_lib/assert-admin-caller'
import {
  USERS_SORT_COLUMNS,
  USERS_SORT_DIRECTIONS,
  type UsersSortColumn,
  type UsersSortDirection,
} from './admin-user-row'
import { listAdminUsersPage } from './list-admin-users'
import {
  listAdminUserStats,
  type AdminUserStats,
} from './list-admin-user-stats'
import type { AdminUserRow } from './admin-user-row'

type ListUsersActionSuccess = {
  success: true
  data: {
    rows: AdminUserRow[]
    hasNextPage: boolean
    page: number
  }
}

export type ListUsersActionResult = ListUsersActionSuccess | AdminActionError

export interface ListUsersActionInput {
  page?: number
  emailFilter?: string
  sortColumn?: UsersSortColumn
  sortDirection?: UsersSortDirection
  perPage?: DataTablePageSize
  filterUnverified?: boolean
  filterBanned?: boolean
  filterNew30d?: boolean
}

export type { AdminUserStats } from './list-admin-user-stats'

type UserStatsActionSuccess = {
  success: true
  data: AdminUserStats
}

export type GetUserStatsActionResult = UserStatsActionSuccess | AdminActionError

export const listUsersAction = async (
  input: ListUsersActionInput = {},
): Promise<ListUsersActionResult> => {
  const authResult = await assertAdminCaller()

  if (!authResult.success) {
    return authResult
  }

  const page = input.page ?? 1

  if (!Number.isInteger(page) || page < 1) {
    return {
      success: false,
      error: {
        message: 'Page must be a positive integer',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
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

  const sortColumn = input.sortColumn ?? 'created_at'

  if (!USERS_SORT_COLUMNS.includes(sortColumn)) {
    return {
      success: false,
      error: {
        message: 'Invalid sort column',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  const sortDirection = input.sortDirection ?? 'desc'

  if (!USERS_SORT_DIRECTIONS.includes(sortDirection)) {
    return {
      success: false,
      error: {
        message: 'Sort direction must be asc or desc',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  const filterUnverified = input.filterUnverified ?? false
  const filterBanned = input.filterBanned ?? false
  const filterNew30d = input.filterNew30d ?? false

  if (
    input.filterUnverified !== undefined &&
    typeof input.filterUnverified !== 'boolean'
  ) {
    return {
      success: false,
      error: {
        message: 'Unverified filter must be a boolean',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  if (
    input.filterBanned !== undefined &&
    typeof input.filterBanned !== 'boolean'
  ) {
    return {
      success: false,
      error: {
        message: 'Banned filter must be a boolean',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  if (
    input.filterNew30d !== undefined &&
    typeof input.filterNew30d !== 'boolean'
  ) {
    return {
      success: false,
      error: {
        message: 'New (30d) filter must be a boolean',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  try {
    const client = await createClient()
    const result = await listAdminUsersPage(client, {
      page,
      perPage,
      emailFilter: input.emailFilter?.trim(),
      sortColumn,
      sortDirection,
      filterUnverified,
      filterBanned,
      filterNew30d,
    })

    return {
      success: true,
      data: result,
    }
  } catch (caught) {
    return mapAdminActionFault(
      'users-list',
      'Failed to list users',
      'Something went wrong loading users. Please try again.',
      caught,
    )
  }
}

export const getUserStatsAction =
  async (): Promise<GetUserStatsActionResult> => {
    const authResult = await assertAdminCaller()

    if (!authResult.success) {
      return authResult
    }

    try {
      const client = await createClient()
      const stats = await listAdminUserStats(client)

      return {
        success: true,
        data: stats,
      }
    } catch (caught) {
      return mapAdminActionFault(
        'users-stats',
        'Failed to load user stats',
        'Something went wrong loading user stats. Please try again.',
        caught,
      )
    }
  }
