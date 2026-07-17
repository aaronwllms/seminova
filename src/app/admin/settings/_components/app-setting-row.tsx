'use client'

import { useId, useState } from 'react'

import { saveAppSettingAction } from '@/app/admin/settings/_lib/actions'
import { AppErrorSurface } from '@/components/app-error-surface'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LOG_LEVELS } from '@/types/app-settings'
import type {
  AppSettingKey,
  AppSettingRegistryEntry,
  AppSettingValueMap,
  LogLevel,
} from '@/types/app-settings'
import type { AppError } from '@/types/app-error'
import { showSuccessToast } from '@/utils/app-toast'

type AppSettingRowProps<K extends AppSettingKey> = {
  entry: AppSettingRegistryEntry<K>
  savedValue: AppSettingValueMap[K]
  onSaved: (key: K, value: AppSettingValueMap[K]) => void
}

const parsePositiveIntDraft = (raw: string): number | null => {
  if (raw.trim() === '') {
    return null
  }

  const parsed = Number(raw)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

export const AppSettingRow = <K extends AppSettingKey>({
  entry,
  savedValue,
  onSaved,
}: AppSettingRowProps<K>) => {
  const controlId = useId()
  const [logLevelDraft, setLogLevelDraft] = useState<LogLevel>(
    entry.valueType === 'log_level' ? (savedValue as LogLevel) : 'info',
  )
  const [intInputDraft, setIntInputDraft] = useState(
    entry.valueType === 'positive_int' ? String(savedValue) : '',
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const parsedPositiveInt =
    entry.valueType === 'positive_int'
      ? parsePositiveIntDraft(intInputDraft)
      : null

  const isDraftValid =
    entry.valueType === 'log_level' || parsedPositiveInt !== null

  const isUnchanged =
    entry.valueType === 'log_level'
      ? logLevelDraft === savedValue
      : parsedPositiveInt === savedValue

  const isSaveDisabled = isSaving || !isDraftValid || isUnchanged

  const handleSave = async () => {
    if (isSaveDisabled) {
      return
    }

    setIsSaving(true)
    setError(null)

    const valueToSave =
      entry.valueType === 'positive_int'
        ? (parsedPositiveInt as AppSettingValueMap[K])
        : (logLevelDraft as AppSettingValueMap[K])

    const result = await saveAppSettingAction({
      key: entry.key,
      value: valueToSave,
    })

    setIsSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    onSaved(entry.key, result.data.value as AppSettingValueMap[K])
    showSuccessToast(`${entry.label} saved`)
  }

  return (
    <div className="flex flex-col gap-3 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-start sm:gap-6">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{entry.label}</p>
        <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
          {entry.description}
        </p>
        <p className="text-muted-foreground mt-1.5 font-mono text-xs">
          {entry.key}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end sm:pt-0.5">
        <div className="flex items-center gap-2">
          {entry.valueType === 'log_level' ? (
            <>
              <Label htmlFor={controlId} className="sr-only">
                {entry.label}
              </Label>
              <Select
                value={logLevelDraft}
                onValueChange={(value) => {
                  setLogLevelDraft(value as LogLevel)
                  setError(null)
                }}
                disabled={isSaving}
              >
                <SelectTrigger id={controlId} className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOG_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Label htmlFor={controlId} className="sr-only">
                {entry.label}
              </Label>
              <Input
                id={controlId}
                type="number"
                min={1}
                className="w-[110px]"
                value={intInputDraft}
                onChange={(event) => {
                  setIntInputDraft(event.target.value)
                  setError(null)
                }}
                disabled={isSaving}
              />
            </>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaveDisabled}
            onClick={() => void handleSave()}
          >
            Save
          </Button>
        </div>
        <AppErrorSurface error={error} />
      </div>
    </div>
  )
}
