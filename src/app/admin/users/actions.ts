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
import { mapUsersActionFault } from './_lib/map-users-action-fault'
import {
  runDemoteUserMutation,
  runPromoteUserMutation,
} from './_lib/run-role-mutation'
import {
  runBanUserMutation,
  runUnbanUserMutation,
} from './_lib/run-ban-mutation'
import { listAdminUsersPage } from './_lib/list-admin-users'
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
  showBanned?: boolean
}

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

  const showBanned = input.showBanned ?? false

  if (input.showBanned !== undefined && typeof input.showBanned !== 'boolean') {
    return {
      success: false,
      error: {
        message: 'Show banned must be a boolean',
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
      showBanned,
    })

    return {
      success: true,
      data: result,
    }
  } catch (caught) {
    return mapUsersActionFault(
      'users-list',
      'Failed to list users',
      'Something went wrong loading users. Please try again.',
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
