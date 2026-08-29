'use server'

import { createClient } from '@/supabase/server'
import { mapAdminActionFault } from '@/app/admin/_lib/map-admin-action-fault'

import {
  assertAdminCaller,
  type AdminActionError,
} from '@/app/admin/_lib/assert-admin-caller'
import { listAdminUsersPage } from './list-admin-users'
import {
  listAdminUserStats,
  type AdminUserStats,
} from './list-admin-user-stats'
import type { AdminUserRow } from './admin-user-row'
import { listUsersActionInputSchema } from './list-users-input-schema'

type ListUsersActionSuccess = {
  success: true
  data: {
    rows: AdminUserRow[]
    hasNextPage: boolean
    page: number
  }
}

export type ListUsersActionResult = ListUsersActionSuccess | AdminActionError

export type { ListUsersActionInput } from './list-users-input-schema'

export type { AdminUserStats } from './list-admin-user-stats'

type UserStatsActionSuccess = {
  success: true
  data: AdminUserStats
}

export type GetUserStatsActionResult = UserStatsActionSuccess | AdminActionError

export const listUsersAction = async (
  input: unknown = {},
): Promise<ListUsersActionResult> => {
  const authResult = await assertAdminCaller()

  if (!authResult.success) {
    return authResult
  }

  const parsedInput = listUsersActionInputSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      success: false,
      error: {
        message: parsedInput.error.issues[0]?.message ?? 'Invalid input',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  const {
    page,
    perPage,
    emailFilter,
    sortColumn,
    sortDirection,
    filterUnverified,
    filterBanned,
    filterNew30d,
  } = parsedInput.data

  try {
    const client = await createClient()
    const result = await listAdminUsersPage(client, {
      page,
      perPage,
      emailFilter,
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
