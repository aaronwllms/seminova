'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UseFormReturn } from 'react-hook-form'

import type { AppError } from '@/types/app-error'

import { updateProfileAction } from '../actions'
import type { FieldSaveState } from '../_components/field-save-indicator'
import type {
  ProfileFormInputValues,
  ProfileFormValues,
  ProfilePartialValues,
} from './profile-form-schema'

export type ProfileFieldKey = 'displayName' | 'bio' | 'avatar'

const initialSaveStates = (): Record<ProfileFieldKey, FieldSaveState> => ({
  displayName: 'idle',
  bio: 'idle',
  avatar: 'idle',
})

type UseBlurSaveFieldOptions = {
  defaultValues: ProfileFormValues
  form: UseFormReturn<ProfileFormInputValues>
}

export const useBlurSaveField = ({
  defaultValues,
  form,
}: UseBlurSaveFieldOptions) => {
  const router = useRouter()
  const [formError, setFormError] = useState<AppError | null>(null)
  const [saveStates, setSaveStates] =
    useState<Record<ProfileFieldKey, FieldSaveState>>(initialSaveStates)

  const inFlightRef = useRef<Record<ProfileFieldKey, boolean>>({
    displayName: false,
    bio: false,
    avatar: false,
  })

  const lastSavedRef = useRef({
    displayName: defaultValues.displayName?.trim() || null,
    bio: defaultValues.bio?.trim() || null,
    avatarUrl: defaultValues.avatarUrl,
  })

  const setFieldSaveState = useCallback(
    (field: ProfileFieldKey, state: FieldSaveState) => {
      setSaveStates((current) => ({ ...current, [field]: state }))
    },
    [],
  )

  const persistField = useCallback(
    async ({
      field,
      payload,
      refresh,
      onSuccess,
    }: {
      field: ProfileFieldKey
      payload: ProfilePartialValues
      refresh: boolean
      onSuccess?: () => void
    }) => {
      if (inFlightRef.current[field]) {
        return
      }

      inFlightRef.current[field] = true
      setFieldSaveState(field, 'saving')
      setFormError(null)

      try {
        const result = await updateProfileAction(payload)

        if (!result.success) {
          setFormError(result.error)
          setFieldSaveState(field, 'idle')
          return
        }

        onSuccess?.()

        if (refresh) {
          router.refresh()
        }

        setFieldSaveState(field, 'saved')
      } catch {
        setFormError({
          message: 'Could not save your profile. Please try again.',
          kind: 'fault',
          code: 'INTERNAL_ERROR',
        })
        setFieldSaveState(field, 'idle')
      } finally {
        inFlightRef.current[field] = false
      }
    },
    [router, setFieldSaveState],
  )

  const createTextBlurHandler = useCallback(
    (
      fieldName: 'displayName' | 'bio',
      {
        refresh,
        toPayload,
      }: {
        refresh: boolean
        toPayload: (trimmed: string | null) => ProfilePartialValues
      },
    ) => {
      return async () => {
        if (inFlightRef.current[fieldName]) {
          return
        }

        const isValid = await form.trigger(fieldName)

        if (!isValid) {
          return
        }

        const trimmed = form.getValues(fieldName).trim() || null
        const lastSaved =
          fieldName === 'displayName'
            ? lastSavedRef.current.displayName
            : lastSavedRef.current.bio

        if (trimmed === lastSaved) {
          return
        }

        await persistField({
          field: fieldName,
          payload: toPayload(trimmed),
          refresh,
          onSuccess: () => {
            if (fieldName === 'displayName') {
              lastSavedRef.current.displayName = trimmed
            } else {
              lastSavedRef.current.bio = trimmed
            }
            form.resetField(fieldName, { defaultValue: trimmed ?? '' })
          },
        })
      }
    },
    [form, persistField],
  )

  return {
    saveStates,
    setFieldSaveState,
    persistField,
    formError,
    setFormError,
    lastSavedRef,
    inFlightRef,
    createTextBlurHandler,
  }
}
