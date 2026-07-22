'use server'

import type {
  BanUserByIdResult,
  UnbanUserByIdResult,
} from '@/utils/admin-user-mutations'
import { isAdminBanDuration } from '@/constants/admin-ban'

import { runBanUserMutation, runUnbanUserMutation } from './run-ban-mutation'
import type { RoleMutationActionInput } from './role-mutation-actions'
import type { UsersActionError } from './assert-admin-caller'

type BanMutationActionSuccess = {
  success: true
  data: {
    status: BanUserByIdResult['status'] | UnbanUserByIdResult['status']
    email: string
  }
}

export type BanUserActionResult = BanMutationActionSuccess | UsersActionError
export type UnbanUserActionResult = BanMutationActionSuccess | UsersActionError

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
