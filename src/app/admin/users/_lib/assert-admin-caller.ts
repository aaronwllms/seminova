'use server'

import { createClient } from '@/supabase/server'
import type { ErrorKind } from '@/types/app-error'
import { isAdminFromAppMetadata } from '@/utils/admin'

export type UsersActionErrorCode =
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'

export type UsersActionError = {
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

export type AssertAdminCallerResult =
  | AssertAdminCallerSuccess
  | UsersActionError

export const assertAdminCaller = async (): Promise<AssertAdminCallerResult> => {
  const sessionClient = await createClient()
  const {
    data: { user },
    error: userError,
  } = await sessionClient.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    }
  }

  if (!isAdminFromAppMetadata(user.app_metadata)) {
    return {
      success: false,
      error: {
        message: 'Forbidden',
        code: 'FORBIDDEN',
        kind: 'operational',
      },
    }
  }

  const callerUserId = user.id.trim()

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
