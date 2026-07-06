import { createServiceClient } from '@/supabase/service'
import {
  demoteUserById,
  promoteUserById,
  type DemoteUserByIdResult,
  type PromoteUserByIdResult,
} from '@/utils/admin-role-mutations'

import { assertAdminCaller, type UsersActionError } from './assert-admin-caller'
import { mapUsersActionFault } from './map-users-action-fault'

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

type MutationFn = (
  client: ReturnType<typeof createServiceClient>,
  userId: string,
) => Promise<PromoteUserByIdResult | DemoteUserByIdResult>

type RunRoleMutationOptions = {
  userId: string | undefined
  mutation: MutationFn
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

export const runRoleMutation = async ({
  userId: rawUserId,
  mutation,
  logTag,
  faultMessage,
  beforeMutation,
}: RunRoleMutationOptions): Promise<RoleMutationActionResult> => {
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
      `${logTag} Failed to mutate user role`,
      faultMessage,
      caught,
    )
  }
}

export const runPromoteUserMutation = (userId: string | undefined) =>
  runRoleMutation({
    userId,
    mutation: promoteUserById,
    logTag: '[users-promote]',
    faultMessage: 'Something went wrong promoting this user. Please try again.',
  })

export const runDemoteUserMutation = (userId: string | undefined) =>
  runRoleMutation({
    userId,
    mutation: demoteUserById,
    logTag: '[users-demote]',
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
