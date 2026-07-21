'use server'

import { createClient } from '@/supabase/server'
import { createServiceClient } from '@/supabase/service'
import type {
  DemoteUserByIdResult,
  PromoteUserByIdResult,
  BanUserByIdResult,
  UnbanUserByIdResult,
} from '@/utils/admin-user-mutations'
import { isAdminBanDuration } from '@/constants/admin-ban'

import { assertAdminCaller } from './_lib/assert-admin-caller'
import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
  type DataTablePageSize,
} from '@/constants/data-table'
import {
  USERS_SORT_COLUMNS,
  USERS_SORT_DIRECTIONS,
  type UsersSortColumn,
  type UsersSortDirection,
} from './_lib/admin-user-row'
import { mapAdminActionFault } from '@/app/admin/_lib/map-admin-action-fault'
import {
  runDemoteUserMutation,
  runPromoteUserMutation,
} from './_lib/run-role-mutation'
import {
  runBanUserMutation,
  runUnbanUserMutation,
} from './_lib/run-ban-mutation'
import { listAdminUsersPage } from './_lib/list-admin-users'
import {
  listAdminUserStats,
  type AdminUserStats,
} from './_lib/list-admin-user-stats'
import type { AdminUserRow } from './_lib/admin-user-row'
import type { UsersActionError } from './_lib/assert-admin-caller'

export type {
  AssertAdminCallerResult,
  UsersActionError,
} from './_lib/assert-admin-caller'

type ListUsersActionSuccess = {
  success: true
  data: {
    rows: AdminUserRow[]
    hasNextPage: boolean
    page: number
  }
}

export type ListUsersActionResult = ListUsersActionSuccess | UsersActionError

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

export type { AdminUserStats } from './_lib/list-admin-user-stats'

type UserStatsActionSuccess = {
  success: true
  data: AdminUserStats
}

export type GetUserStatsActionResult = UserStatsActionSuccess | UsersActionError

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

type RoleMutationActionSuccess = {
  success: true
  data: {
    status: PromoteUserByIdResult['status'] | DemoteUserByIdResult['status']
    email: string
  }
}

export type PromoteUserActionResult =
  | RoleMutationActionSuccess
  | UsersActionError
export type DemoteUserActionResult =
  | RoleMutationActionSuccess
  | UsersActionError

export interface RoleMutationActionInput {
  userId: string
}

export const promoteUserAction = async (
  input: RoleMutationActionInput,
): Promise<PromoteUserActionResult> => runPromoteUserMutation(input.userId)

export const demoteUserAction = async (
  input: RoleMutationActionInput,
): Promise<DemoteUserActionResult> => runDemoteUserMutation(input.userId)

type BanMutationActionSuccess = {
  success: true
  data: {
    status: BanUserByIdResult['status'] | UnbanUserByIdResult['status']
    email: string
  }
}

export type BanUserActionResult = BanMutationActionSuccess | UsersActionError
export type UnbanUserActionResult = BanMutationActionSuccess | UsersActionError

export interface BanUserActionInput {
  userId: string
  banDuration: string
}

export const banUserAction = async (
  input: BanUserActionInput,
): Promise<BanUserActionResult> => {
  if (!isAdminBanDuration(input.banDuration)) {
    return {
      success: false,
      error: {
        message: 'Invalid ban duration',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  return runBanUserMutation(input.userId, input.banDuration)
}

export const unbanUserAction = async (
  input: RoleMutationActionInput,
): Promise<UnbanUserActionResult> => runUnbanUserMutation(input.userId)
