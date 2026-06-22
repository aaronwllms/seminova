'use server'

import { createClient } from '@/supabase/server'
import { createServiceClient } from '@/supabase/service'
import type { ErrorKind } from '@/types/app-error'
import {
  demoteUserById,
  promoteUserById,
  type DemoteUserByIdResult,
  type PromoteUserByIdResult,
} from '@/utils/admin-role-mutations'
import { isAdmin, type JwtClaims } from '@/utils/admin'

import { listAdminUsersPage } from './_lib/list-admin-users'
import type { AdminUserRow } from './_lib/admin-user-row'

type UsersActionErrorCode =
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'

type UsersActionError = {
  success: false
  error: {
    message: string
    code: UsersActionErrorCode
    kind: ErrorKind
  }
}

type AssertAdminCallerSuccess = {
  success: true
  callerUserId: string
}

type AssertAdminCallerResult = AssertAdminCallerSuccess | UsersActionError

const assertAdminCaller = async (): Promise<AssertAdminCallerResult> => {
  const sessionClient = await createClient()
  const { data, error } = await sessionClient.auth.getClaims()

  if (error || !data?.claims) {
    return {
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    }
  }

  const claims = data.claims as JwtClaims

  if (!isAdmin(claims)) {
    return {
      success: false,
      error: {
        message: 'Forbidden',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    }
  }

  const callerUserId = claims.sub?.trim()

  if (!callerUserId) {
    return {
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    }
  }

  return { success: true, callerUserId }
}

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
  } catch (listError) {
    console.error('[users-list] Failed to list users', listError)

    return {
      success: false,
      error: {
        message: 'Something went wrong loading users. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    }
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

const validateUserId = (userId: string | undefined): string | null => {
  const trimmed = userId?.trim()
  return trimmed || null
}

export const promoteUserAction = async (
  input: RoleMutationActionInput,
): Promise<PromoteUserActionResult> => {
  const authResult = await assertAdminCaller()

  if (!authResult.success) {
    return authResult
  }

  const userId = validateUserId(input.userId)

  if (!userId) {
    return {
      success: false,
      error: {
        message: 'User id is required',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  try {
    const serviceClient = createServiceClient()
    const result = await promoteUserById(serviceClient, userId)

    if (result.status === 'not_found') {
      return {
        success: false,
        error: {
          message: 'User not found',
          code: 'NOT_FOUND',
          kind: 'operational',
        },
      }
    }

    console.warn(`[users-promote] ${result.email} — ${result.status}`)

    return {
      success: true,
      data: {
        status: result.status,
        email: result.email,
      },
    }
  } catch (promoteError) {
    console.error('[users-promote] Failed to promote user', promoteError)

    return {
      success: false,
      error: {
        message: 'Something went wrong promoting this user. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    }
  }
}

export const demoteUserAction = async (
  input: RoleMutationActionInput,
): Promise<DemoteUserActionResult> => {
  const authResult = await assertAdminCaller()

  if (!authResult.success) {
    return authResult
  }

  const userId = validateUserId(input.userId)

  if (!userId) {
    return {
      success: false,
      error: {
        message: 'User id is required',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  if (userId === authResult.callerUserId) {
    return {
      success: false,
      error: {
        message: 'You cannot demote your own admin account',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  try {
    const serviceClient = createServiceClient()
    const result = await demoteUserById(serviceClient, userId)

    if (result.status === 'not_found') {
      return {
        success: false,
        error: {
          message: 'User not found',
          code: 'NOT_FOUND',
          kind: 'operational',
        },
      }
    }

    console.warn(`[users-demote] ${result.email} — ${result.status}`)

    return {
      success: true,
      data: {
        status: result.status,
        email: result.email,
      },
    }
  } catch (demoteError) {
    console.error('[users-demote] Failed to demote user', demoteError)

    return {
      success: false,
      error: {
        message: 'Something went wrong demoting this user. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    }
  }
}
