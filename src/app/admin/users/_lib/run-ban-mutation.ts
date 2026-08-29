import type { AdminBanDuration } from '@/constants/admin-ban'
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
} from './run-admin-user-mutation'

export type BanMutationActionResult =
  AdminUserMutationActionResult<BanMutationSuccessStatus>

export const runBanUserMutation = (
  userId: string | undefined,
  banDuration: AdminBanDuration,
): Promise<BanMutationActionResult> =>
  runAdminUserMutation<Exclude<BanUserByIdResult['status'], 'not_found'>>({
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
  runAdminUserMutation<Exclude<UnbanUserByIdResult['status'], 'not_found'>>({
    userId,
    mutation: unbanUserById,
    logTag: 'users-unban',
    logMessage: 'Failed to mutate user ban status',
    faultMessage: 'Something went wrong unbanning this user. Please try again.',
  })
