import { createServiceClient } from '@/supabase/service'
import { appLog } from '@/utils/app-logger'

import { assertAdminCaller, type UsersActionError } from './assert-admin-caller'
import { mapAdminActionFault } from '@/app/admin/_lib/map-admin-action-fault'

export type AdminUserMutationResult =
  | { status: 'not_found' }
  | { status: Exclude<string, 'not_found'>; email: string }

type AdminUserMutationActionSuccess<TStatus extends string> = {
  success: true
  data: {
    status: TStatus
    email: string
  }
}

export type AdminUserMutationActionResult<TStatus extends string = string> =
  | AdminUserMutationActionSuccess<TStatus>
  | UsersActionError

type RunAdminUserMutationOptions<TResult extends AdminUserMutationResult> = {
  userId: string | undefined
  mutation: (
    client: ReturnType<typeof createServiceClient>,
    userId: string,
  ) => Promise<TResult>
  logTag: string
  logMessage: string
  faultMessage: string
  beforeMutation?: (
    callerUserId: string,
    userId: string,
  ) => UsersActionError | null
}

const validateUserId = (userId: string | undefined): string | null => {
  const trimmed = userId?.trim()
  return trimmed || null
}

const hasMutationEmail = (
  result: AdminUserMutationResult,
): result is Extract<AdminUserMutationResult, { email: string }> =>
  result.status !== 'not_found'

export const runAdminUserMutation = async <
  TResult extends AdminUserMutationResult,
>({
  userId: rawUserId,
  mutation,
  logTag,
  logMessage,
  faultMessage,
  beforeMutation,
}: RunAdminUserMutationOptions<TResult>): Promise<
  AdminUserMutationActionResult<TResult['status']>
> => {
  const authResult = await assertAdminCaller()

  if (!authResult.success) {
    return authResult
  }

  const userId = validateUserId(rawUserId)

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

  const preCheckError = beforeMutation?.(authResult.callerUserId, userId)

  if (preCheckError) {
    return preCheckError
  }

  try {
    const serviceClient = createServiceClient()
    const result = await mutation(serviceClient, userId)

    if (!hasMutationEmail(result)) {
      return {
        success: false,
        error: {
          message: 'User not found',
          code: 'NOT_FOUND',
          kind: 'operational',
        },
      }
    }

    appLog.warn(logTag, `${result.email} — ${result.status}`)

    return {
      success: true,
      data: {
        status: result.status,
        email: result.email,
      },
    }
  } catch (caught) {
    return mapAdminActionFault(logTag, logMessage, faultMessage, caught)
  }
}
