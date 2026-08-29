'use server'

import { isAdminBanDuration } from '@/constants/admin-ban'
import {
  banUserById,
  unbanUserById,
  type BanUserByIdResult,
  type BanMutationSuccessStatus,
  type UnbanUserByIdResult,
} from '@/utils/admin-user-mutations'

import {
  runAdminUserMutation,
  type AdminUserMutationActionResult,
  type AdminUserTargetInput,
} from './run-admin-user-mutation'

export type BanMutationActionResult =
  AdminUserMutationActionResult<BanMutationSuccessStatus>

export interface BanUserActionInput {
  userId: string
  banDuration: string
}

export const banUserAction = async (
  input: BanUserActionInput,
): Promise<BanMutationActionResult> => {
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

  const banDuration = input.banDuration

  return runAdminUserMutation<
    Exclude<BanUserByIdResult['status'], 'not_found'>
  >({
    userId: input.userId,
    mutation: (client, id) => banUserById(client, id, banDuration),
    logTag: 'users-ban',
    logMessage: 'Failed to mutate user ban status',
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
}

export const unbanUserAction = async (
  input: AdminUserTargetInput,
): Promise<BanMutationActionResult> =>
  runAdminUserMutation<Exclude<UnbanUserByIdResult['status'], 'not_found'>>({
    userId: input.userId,
    mutation: unbanUserById,
    logTag: 'users-unban',
    logMessage: 'Failed to mutate user ban status',
    faultMessage: 'Something went wrong unbanning this user. Please try again.',
  })
