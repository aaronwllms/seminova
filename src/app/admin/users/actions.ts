'use server'

import { createServiceClient } from '@/supabase/service'
import type {
  DemoteUserByIdResult,
  PromoteUserByIdResult,
} from '@/utils/admin-role-mutations'

import { assertAdminCaller } from './_lib/assert-admin-caller'
import { mapUsersActionFault } from './_lib/map-users-action-fault'
import {
  runDemoteUserMutation,
  runPromoteUserMutation,
} from './_lib/run-role-mutation'
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

  try {
    const serviceClient = createServiceClient()
    const result = await listAdminUsersPage(serviceClient, {
      page,
      emailFilter: input.emailFilter?.trim(),
    })

    return {
      success: true,
      data: result,
    }
  } catch (caught) {
    return mapUsersActionFault(
      '[users-list] Failed to list users',
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
