import { createServiceClient } from '@/supabase/service'
import {
  banUserById,
  unbanUserById,
  type BanUserByIdResult,
  type UnbanUserByIdResult,
} from '@/utils/admin-role-mutations'
import type { AdminBanDuration } from '@/constants/admin-ban'

import { assertAdminCaller, type UsersActionError } from './assert-admin-caller'
import { mapUsersActionFault } from './map-users-action-fault'

type BanMutationActionSuccess = {
  success: true
  data: {
    status: BanUserByIdResult['status'] | UnbanUserByIdResult['status']
    email: string
  }
}

export type BanMutationActionResult =
  | BanMutationActionSuccess
  | UsersActionError

type BanMutationFn = (
  client: ReturnType<typeof createServiceClient>,
  userId: string,
) => Promise<BanUserByIdResult | UnbanUserByIdResult>

type RunBanMutationOptions = {
  userId: string | undefined
  mutation: BanMutationFn
  logTag: string
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

export const runBanMutation = async ({
  userId: rawUserId,
  mutation,
  logTag,
  faultMessage,
  beforeMutation,
}: RunBanMutationOptions): Promise<BanMutationActionResult> => {
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

    console.warn(`${logTag} ${result.email} — ${result.status}`)

    return {
      success: true,
      data: {
        status: result.status,
        email: result.email,
      },
    }
  } catch (caught) {
    return mapUsersActionFault(
      `${logTag} Failed to mutate user ban status`,
      faultMessage,
      caught,
    )
  }
}

export const runBanUserMutation = (
  userId: string | undefined,
  banDuration: AdminBanDuration,
) =>
  runBanMutation({
    userId,
    mutation: (client, id) => banUserById(client, id, banDuration),
    logTag: '[users-ban]',
    faultMessage: 'Something went wrong banning this user. Please try again.',
    beforeMutation: (callerUserId, targetUserId) => {
      if (targetUserId === callerUserId) {
        return {
          success: false,
          error: {
            message: 'You cannot ban your own account',
            code: 'VALIDATION_ERROR',
            kind: 'operational',
          },
        }
      }

      return null
    },
  })

export const runUnbanUserMutation = (userId: string | undefined) =>
  runBanMutation({
    userId,
    mutation: unbanUserById,
    logTag: '[users-unban]',
    faultMessage: 'Something went wrong unbanning this user. Please try again.',
  })
