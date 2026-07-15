'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AdminBanDuration } from '@/constants/admin-ban'
import {
  getBanMutationToastMessage,
  type BanMutationSuccessStatus,
} from '@/utils/admin-role-mutations'
import { showSuccessToast } from '@/utils/app-toast'

import { banUserAction, unbanUserAction } from '../actions'
import { adminUsersQueryKeys } from './admin-users-query-keys'
import { unwrapBanMutationResult } from './unwrap-users-action'

export type BanMutationInput = {
  type: 'ban'
  userId: string
  banDuration: AdminBanDuration
}

export type UnbanMutationInput = {
  type: 'unban'
  userId: string
}

export type UserBanMutationInput = BanMutationInput | UnbanMutationInput

export const useAdminUserBanMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UserBanMutationInput) => {
      const result =
        input.type === 'ban'
          ? await banUserAction({
              userId: input.userId,
              banDuration: input.banDuration,
            })
          : await unbanUserAction({ userId: input.userId })

      return unwrapBanMutationResult(result)
    },
    onSuccess: (data) => {
      showSuccessToast(
        getBanMutationToastMessage(data.status as BanMutationSuccessStatus),
      )
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all })
    },
  })
}
