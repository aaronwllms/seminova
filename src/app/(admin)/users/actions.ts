'use server'

import { createClient } from '@/supabase/server'
import { createServiceClient } from '@/supabase/service'
import { isAdmin, type JwtClaims } from '@/utils/admin'

import { listAdminUsersPage } from './_lib/list-admin-users'
import type { AdminUserRow } from './_lib/admin-user-row'

type ListUsersActionSuccess = {
  success: true
  data: {
    rows: AdminUserRow[]
    hasNextPage: boolean
    page: number
  }
}

type ListUsersActionError = {
  success: false
  error: {
    message: string
    code: 'FORBIDDEN' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR'
  }
}

export type ListUsersActionResult =
  | ListUsersActionSuccess
  | ListUsersActionError

export interface ListUsersActionInput {
  page?: number
  emailFilter?: string
}

export const listUsersAction = async (
  input: ListUsersActionInput = {},
): Promise<ListUsersActionResult> => {
  const sessionClient = await createClient()
  const { data, error } = await sessionClient.auth.getClaims()

  if (error || !data?.claims) {
    return {
      success: false,
      error: { message: 'Unauthorized', code: 'FORBIDDEN' },
    }
  }

  const claims = data.claims as JwtClaims

  if (!isAdmin(claims)) {
    return {
      success: false,
      error: { message: 'Forbidden', code: 'FORBIDDEN' },
    }
  }

  const page = input.page ?? 1

  if (!Number.isInteger(page) || page < 1) {
    return {
      success: false,
      error: {
        message: 'Page must be a positive integer',
        code: 'VALIDATION_ERROR',
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
      },
    }
  }
}
