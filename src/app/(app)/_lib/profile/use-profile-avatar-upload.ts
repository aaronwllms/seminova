'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { UseFormReturn } from 'react-hook-form'

import {
  AvatarUploadError,
  AvatarUploadErrorCode,
  AVATAR_SESSION_AUTH_REQUIRED_MESSAGE,
  uploadUserAvatar,
  withAvatarCacheBust,
} from '@/utils/avatar-storage'

import type { AppError } from '@/types/app-error'

import { probeSessionAction } from './probe-session-action'
import type { ProfileFormInputValues } from './profile-form-schema'
import type { ProfileFieldKey } from './profile-form-schema'

type PersistField = (args: {
  field: ProfileFieldKey
  payload: { avatarUrl: string | null }
  refresh: boolean
  onSuccess?: () => void
}) => Promise<void>

type UseProfileAvatarUploadOptions = {
  userId: string
  form: UseFormReturn<ProfileFormInputValues>
  persistField: PersistField
  inFlightRef: React.RefObject<Record<ProfileFieldKey, boolean>>
  setFileError: (message: string | null) => void
  setFormError: (error: AppError | null) => void
  lastSavedRef: React.RefObject<{
    displayName: string | null
    bio: string | null
    avatarUrl: string | null
  }>
}

const isSessionAuthUploadError = (error: unknown): boolean =>
  error instanceof AvatarUploadError &&
  error.code === AvatarUploadErrorCode.SESSION_AUTH_REQUIRED

export const useProfileAvatarUpload = ({
  userId,
  form,
  persistField,
  inFlightRef,
  setFileError,
  setFormError,
  lastSavedRef,
}: UseProfileAvatarUploadOptions) => {
  const router = useRouter()

  const persistUploadedAvatar = useCallback(
    async (publicUrl: string) => {
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
    },
    [form, lastSavedRef, persistField],
  )

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (inFlightRef.current.avatar) {
        return
      }

      setFileError(null)

      const attemptUpload = async () => uploadUserAvatar({ userId, file })

      try {
        const { publicUrl } = await attemptUpload()
        await persistUploadedAvatar(publicUrl)
      } catch (caught) {
        if (isSessionAuthUploadError(caught)) {
          router.refresh()
          const probe = await probeSessionAction()

          if (probe.success) {
            try {
              const { publicUrl } = await attemptUpload()
              await persistUploadedAvatar(publicUrl)
              return
            } catch (retryCaught) {
              if (retryCaught instanceof AvatarUploadError) {
                setFileError(retryCaught.message)
                return
              }

              setFormError({
                message: 'Could not save your profile. Please try again.',
                kind: 'fault',
                code: 'INTERNAL_ERROR',
              })
              return
            }
          }

          setFileError(AVATAR_SESSION_AUTH_REQUIRED_MESSAGE)
          return
        }

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
      inFlightRef,
      persistUploadedAvatar,
      router,
      setFileError,
      setFormError,
      userId,
    ],
  )

  const handleAvatarRemove = useCallback(async () => {
    if (inFlightRef.current.avatar) {
      return
    }

    setFileError(null)

    await persistField({
      field: 'avatar',
      payload: { avatarUrl: null },
      refresh: true,
      onSuccess: () => {
        lastSavedRef.current.avatarUrl = null
        form.setValue('avatarUrl', '')
      },
    })
  }, [form, inFlightRef, lastSavedRef, persistField, setFileError])

  return { handleAvatarUpload, handleAvatarRemove }
}
