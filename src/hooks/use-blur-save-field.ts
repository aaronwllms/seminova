'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import type { AppError } from '@/types/app-error'
import type { FieldSaveState } from '@/types/field-save-state'

type BlurSaveActionResult =
  | { success: true; data: unknown }
  | { success: false; error: AppError }

const buildInitialSaveStates = <TFieldKey extends string>(
  inFlightKeys: readonly TFieldKey[],
): Record<TFieldKey, FieldSaveState> => {
  return Object.fromEntries(
    inFlightKeys.map((key) => [key, 'idle' as const]),
  ) as Record<TFieldKey, FieldSaveState>
}

const buildInitialInFlight = <TFieldKey extends string>(
  inFlightKeys: readonly TFieldKey[],
): Record<TFieldKey, boolean> => {
  return Object.fromEntries(inFlightKeys.map((key) => [key, false])) as Record<
    TFieldKey,
    boolean
  >
}

type UseBlurSaveFieldOptions<
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
  TFieldKey extends string,
  TLastSaved,
  TPayload,
> = {
  form: UseFormReturn<TFieldValues>
  inFlightKeys: readonly TFieldKey[]
  initialLastSaved: TLastSaved
  persist: (payload: TPayload) => Promise<BlurSaveActionResult>
  faultFallbackMessage?: string
}

export const useBlurSaveField = <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues> & TFieldKey,
  TFieldKey extends string,
  TLastSaved,
  TPayload,
>({
  form,
  inFlightKeys,
  initialLastSaved,
  persist,
  faultFallbackMessage = 'Could not save. Please try again.',
}: UseBlurSaveFieldOptions<
  TFieldValues,
  TFieldName,
  TFieldKey,
  TLastSaved,
  TPayload
>) => {
  const router = useRouter()
  const [formError, setFormError] = useState<AppError | null>(null)
  const [saveStates, setSaveStates] = useState<
    Record<TFieldKey, FieldSaveState>
  >(() => buildInitialSaveStates(inFlightKeys))

  const inFlightRef = useRef<Record<TFieldKey, boolean>>(
    buildInitialInFlight(inFlightKeys),
  )

  const lastSavedRef = useRef(initialLastSaved)

  const setFieldSaveState = useCallback(
    (field: TFieldKey, state: FieldSaveState) => {
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
      field: TFieldKey
      payload: TPayload
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
        const result = await persist(payload)

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
          message: faultFallbackMessage,
          kind: 'fault',
          code: 'INTERNAL_ERROR',
        })
        setFieldSaveState(field, 'idle')
      } finally {
        inFlightRef.current[field] = false
      }
    },
    [faultFallbackMessage, persist, router, setFieldSaveState],
  )

  const createTextBlurHandler = useCallback(
    (
      fieldName: TFieldName,
      {
        refresh,
        toPayload,
        lastSaved,
      }: {
        refresh: boolean
        toPayload: (trimmed: string | null) => TPayload
        lastSaved: {
          get: (snapshot: TLastSaved) => string | null
          set: (snapshot: TLastSaved, value: string | null) => void
        }
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

        const rawValue = form.getValues(fieldName)
        const trimmed =
          typeof rawValue === 'string' ? rawValue.trim() || null : null
        const lastSavedValue = lastSaved.get(lastSavedRef.current)

        if (trimmed === lastSavedValue) {
          return
        }

        await persistField({
          field: fieldName,
          payload: toPayload(trimmed),
          refresh,
          onSuccess: () => {
            lastSaved.set(lastSavedRef.current, trimmed)
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
