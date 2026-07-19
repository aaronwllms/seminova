import type { AdminBanDuration } from '@/constants/admin-ban'
import {
  banUserById,
  unbanUserById,
  type BanUserByIdResult,
  type UnbanUserByIdResult,
} from '@/utils/admin-user-mutations'

import type { UsersActionError } from './assert-admin-caller'
import { runAdminUserMutation } from './run-admin-user-mutation'

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

export const runBanUserMutation = (
  userId: string | undefined,
  banDuration: AdminBanDuration,
): Promise<BanMutationActionResult> =>
  runAdminUserMutation({
    userId,
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

export const runUnbanUserMutation = (
  userId: string | undefined,
): Promise<BanMutationActionResult> =>
  runAdminUserMutation({
    userId,
    mutation: unbanUserById,
    logTag: 'users-unban',
    logMessage: 'Failed to mutate user ban status',
    faultMessage: 'Something went wrong unbanning this user. Please try again.',
  })
