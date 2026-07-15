import {
  demoteUserById,
  promoteUserById,
  type DemoteUserByIdResult,
  type PromoteUserByIdResult,
} from '@/utils/admin-user-mutations'

import type { UsersActionError } from './assert-admin-caller'
import { runAdminUserMutation } from './run-admin-user-mutation'

type RoleMutationActionSuccess = {
  success: true
  data: {
    status: PromoteUserByIdResult['status'] | DemoteUserByIdResult['status']
    email: string
  }
}

export type RoleMutationActionResult =
  | RoleMutationActionSuccess
  | UsersActionError

export const runPromoteUserMutation = (
  userId: string | undefined,
): Promise<RoleMutationActionResult> =>
  runAdminUserMutation({
    userId,
    mutation: promoteUserById,
    logTag: '[users-promote]',
    faultMessage: 'Something went wrong promoting this user. Please try again.',
    faultLogMessage: '[users-promote] Failed to mutate user role',
  })

export const runDemoteUserMutation = (
  userId: string | undefined,
): Promise<RoleMutationActionResult> =>
  runAdminUserMutation({
    userId,
    mutation: demoteUserById,
    logTag: '[users-demote]',
    faultMessage: 'Something went wrong demoting this user. Please try again.',
    faultLogMessage: '[users-demote] Failed to mutate user role',
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
