import {
  demoteUserById,
  promoteUserById,
  type DemoteUserByIdResult,
  type PromoteUserByIdResult,
  type RoleMutationSuccessStatus,
} from '@/utils/admin-user-mutations'

import {
  runAdminUserMutation,
  type AdminUserMutationActionResult,
} from './run-admin-user-mutation'

export type RoleMutationActionResult =
  AdminUserMutationActionResult<RoleMutationSuccessStatus>

export const runPromoteUserMutation = (
  userId: string | undefined,
): Promise<RoleMutationActionResult> =>
  runAdminUserMutation<Exclude<PromoteUserByIdResult['status'], 'not_found'>>({
    userId,
    mutation: promoteUserById,
    logTag: 'users-promote',
    logMessage: 'Failed to mutate user role',
    faultMessage: 'Something went wrong promoting this user. Please try again.',
  })

export const runDemoteUserMutation = (
  userId: string | undefined,
): Promise<RoleMutationActionResult> =>
  runAdminUserMutation<Exclude<DemoteUserByIdResult['status'], 'not_found'>>({
    userId,
    mutation: demoteUserById,
    logTag: 'users-demote',
    logMessage: 'Failed to mutate user role',
    faultMessage: 'Something went wrong demoting this user. Please try again.',
    beforeMutation: (callerUserId, targetUserId) => {
      if (targetUserId === callerUserId) {
        return {
          success: false,
          error: {
            message: 'You cannot demote your own admin account',
            code: 'VALIDATION_ERROR',
            kind: 'operational',
          },
        }
      }

      return null
    },
  })
