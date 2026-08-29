import { createServiceClient } from '@/supabase/service'
import { appLog } from '@/utils/app-logger'

import {
  assertAdminCaller,
  type AdminActionError,
} from '@/app/admin/_lib/assert-admin-caller'
import { mapAdminActionFault } from '@/app/admin/_lib/map-admin-action-fault'

export type AdminUserMutationResult<TStatus extends string> =
  | { status: 'not_found' }
  | { status: TStatus; email: string | null }

type AdminUserMutationActionSuccess<TStatus extends string> = {
  success: true
  data: {
    status: TStatus
    email: string | null
  }
}

export type AdminUserMutationActionResult<TStatus extends string> =
  | AdminUserMutationActionSuccess<TStatus>
  | AdminActionError

type RunAdminUserMutationOptions<TStatus extends string> = {
  userId: string | undefined
  mutation: (
    client: ReturnType<typeof createServiceClient>,
    userId: string,
  ) => Promise<AdminUserMutationResult<TStatus>>
  logTag: string
  logMessage: string
  faultMessage: string
  beforeMutation?: (
    callerUserId: string,
    userId: string,
  ) => AdminActionError | null
}

const validateUserId = (userId: string | undefined): string | null => {
  const trimmed = userId?.trim()
  return trimmed || null
}

const isMutationFound = <TStatus extends string>(
  result: AdminUserMutationResult<TStatus>,
): result is { status: TStatus; email: string | null } =>
  result.status !== 'not_found'

export const runAdminUserMutation = async <TStatus extends string>({
  userId: rawUserId,
  mutation,
  logTag,
  logMessage,
  faultMessage,
  beforeMutation,
}: RunAdminUserMutationOptions<TStatus>): Promise<
  AdminUserMutationActionResult<TStatus>
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

    if (!isMutationFound(result)) {
      return {
        success: false,
        error: {
          message: 'User not found',
          code: 'NOT_FOUND',
          kind: 'operational',
        },
      }
    }

    appLog.warn(logTag, `${result.email ?? userId} — ${result.status}`)

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
