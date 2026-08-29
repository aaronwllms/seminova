'use server'

import { createClient } from '@/supabase/server'
import type { ErrorKind } from '@/types/app-error'
import { isAdminFromAppMetadata } from '@/utils/admin'

type AdminActionErrorCode =
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'

export type AdminActionError = {
  success: false
  error: {
    message: string
    code: AdminActionErrorCode
    kind: ErrorKind
  }
}

type AssertAdminCallerSuccess = {
  success: true
  callerUserId: string
}

export type AssertAdminCallerResult =
  | AssertAdminCallerSuccess
  | AdminActionError

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
