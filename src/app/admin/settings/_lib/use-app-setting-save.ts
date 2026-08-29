'use client'

import { useEffect, useRef, useState } from 'react'

import { saveAppSettingAction } from '@/app/admin/settings/_lib/actions'
import type {
  AppSettingKey,
  ResolvedAppSettings,
} from '@/config/app-settings-registry'
import type { AppError } from '@/types/app-error'
import { showSuccessToast } from '@/utils/app-toast'

export interface UseAppSettingSaveOptions<K extends AppSettingKey> {
  key: K
  label: string
  savedValue: ResolvedAppSettings[K]
  parse: () => ResolvedAppSettings[K] | null
  onSaved: (key: K, value: ResolvedAppSettings[K]) => void
  resetForm: (savedValue: ResolvedAppSettings[K]) => void
}

export interface UseAppSettingSaveResult<K extends AppSettingKey> {
  isSaving: boolean
  error: AppError | null
  clearError: () => void
  save: () => Promise<void>
}

export const useAppSettingSave = <K extends AppSettingKey>({
  key,
  label,
  savedValue,
  parse,
  onSaved,
  resetForm,
}: UseAppSettingSaveOptions<K>): UseAppSettingSaveResult<K> => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const resetFormRef = useRef(resetForm)

  useEffect(() => {
    resetFormRef.current = resetForm
  })

  useEffect(() => {
    resetFormRef.current(savedValue)
  }, [savedValue])

  const clearError = () => setError(null)

  const save = async () => {
    const value = parse()

    if (value === null) {
      return
    }

    setIsSaving(true)
    setError(null)

    const result = await saveAppSettingAction({
      key,
      value,
    })

    setIsSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    onSaved(key, value)
    showSuccessToast(`${label} saved`)
  }

  return { isSaving, error, clearError, save }
}
