'use server'

import type { BanMutationSuccessStatus } from '@/utils/admin-user-mutations'
import { isAdminBanDuration } from '@/constants/admin-ban'

import { runBanUserMutation, runUnbanUserMutation } from './run-ban-mutation'
import type { RoleMutationActionInput } from './role-mutation-actions'
import type { AdminActionError } from '@/app/admin/_lib/assert-admin-caller'

type BanMutationActionSuccess = {
  success: true
  data: {
    status: BanMutationSuccessStatus
    email: string
  }
}

export type BanUserActionResult = BanMutationActionSuccess | AdminActionError
export type UnbanUserActionResult = BanMutationActionSuccess | AdminActionError

export interface BanUserActionInput {
  userId: string
  banDuration: string
}

export const banUserAction = async (
  input: BanUserActionInput,
): Promise<BanUserActionResult> => {
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

  return runBanUserMutation(input.userId, input.banDuration)
}

export const unbanUserAction = async (
  input: RoleMutationActionInput,
): Promise<UnbanUserActionResult> => runUnbanUserMutation(input.userId)
