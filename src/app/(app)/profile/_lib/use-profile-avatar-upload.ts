'use client'

import { useCallback } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import {
  AvatarUploadError,
  uploadUserAvatar,
  withAvatarCacheBust,
} from '@/utils/avatar-storage'

import type { AppError } from '@/types/app-error'

import type { ProfileFormInputValues } from './profile-form-schema'
import type { ProfileFieldKey } from './use-blur-save-field'

type PersistField = (args: {
  field: ProfileFieldKey
  payload: { avatarUrl: string }
  refresh: boolean
  onSuccess?: () => void
}) => Promise<void>

type UseProfileAvatarUploadOptions = {
  userId: string
  form: UseFormReturn<ProfileFormInputValues>
  persistField: PersistField
  inFlightRef: React.MutableRefObject<Record<ProfileFieldKey, boolean>>
  setFileError: (message: string | null) => void
  setFormError: (error: AppError | null) => void
  lastSavedRef: React.MutableRefObject<{
    displayName: string | null
    bio: string | null
    avatarUrl: string | null
  }>
}

export const useProfileAvatarUpload = ({
  userId,
  form,
  persistField,
  inFlightRef,
  setFileError,
  setFormError,
  lastSavedRef,
}: UseProfileAvatarUploadOptions) => {
  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (inFlightRef.current.avatar) {
        return
      }

      setFileError(null)

      try {
        const { publicUrl } = await uploadUserAvatar({ userId, file })
        const avatarUrl = withAvatarCacheBust(publicUrl)

        await persistField({
          field: 'avatar',
          payload: { avatarUrl },
          refresh: true,
          onSuccess: () => {
            lastSavedRef.current.avatarUrl = avatarUrl
            form.setValue('avatarUrl', avatarUrl)
          },
        })
      } catch (caught) {
        if (caught instanceof AvatarUploadError) {
          setFileError(caught.message)
          return
        }

        setFormError({
          message: 'Could not save your profile. Please try again.',
          kind: 'fault',
          code: 'INTERNAL_ERROR',
        })
      }
    },
    [
      form,
      inFlightRef,
      lastSavedRef,
      persistField,
      setFileError,
      setFormError,
      userId,
    ],
  )

  return { handleAvatarUpload }
}
