'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { z } from 'zod'

import { saveAppSettingAction } from '@/app/admin/settings/_lib/actions'
import { AppErrorSurface } from '@/components/app-error-surface'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
  AppSettingRegistryEntryFor,
  AppSettingValueMap,
  LogLevel,
} from '@/types/app-settings'
import type { AppError } from '@/types/app-error'
import { showSuccessToast } from '@/utils/app-toast'
import {
  appSettingLogLevelFormSchema,
  appSettingPositiveIntFormSchema,
  positiveIntFormValueSchema,
} from '@/utils/app-settings-schema'

type AppSettingRowProps<K extends AppSettingKey> = {
  entry: AppSettingRegistryEntryFor<K>
  savedValue: AppSettingValueMap[K]
  onSaved: (key: K, value: AppSettingValueMap[K]) => void
}

type LogLevelRowProps<K extends AppSettingKey> = {
  entry: AppSettingRegistryEntryFor<K>
  savedValue: LogLevel
  onSaved: (key: K, value: AppSettingValueMap[K]) => void
}

type PositiveIntRowProps<K extends AppSettingKey> = {
  entry: AppSettingRegistryEntryFor<K>
  savedValue: number
  onSaved: (key: K, value: AppSettingValueMap[K]) => void
}

// Settings rows use explicit submit regardless of field count (cross-user, ambient,
// sometimes-irreversible effects) — see forms.mdc save-model exception.

const LogLevelSettingRow = <K extends AppSettingKey>({
  entry,
  savedValue,
  onSaved,
}: LogLevelRowProps<K>) => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const form = useForm<z.infer<typeof appSettingLogLevelFormSchema>>({
    resolver: zodResolver(appSettingLogLevelFormSchema),
    defaultValues: { value: savedValue },
    mode: 'onChange',
  })

  const draftValue = useWatch({ control: form.control, name: 'value' })
  const isUnchanged = draftValue === savedValue
  const isSaveDisabled = isSaving || !form.formState.isValid || isUnchanged

  useEffect(() => {
    form.reset({ value: savedValue })
  }, [form, savedValue])

  const handleSave = async () => {
    if (isSaveDisabled) {
      return
    }

    const parsed = appSettingLogLevelFormSchema.safeParse(form.getValues())

    if (!parsed.success) {
      return
    }

    setIsSaving(true)
    setError(null)

    const result = await saveAppSettingAction({
      key: entry.key,
      value: parsed.data.value as AppSettingValueMap[K],
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
    <SettingRowShell entry={entry} error={error}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="gap-0 space-y-0">
              <FormLabel className="sr-only">{entry.label}</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  setError(null)
                }}
                disabled={isSaving}
              >
                <FormControl>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LOG_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
      <SaveButton
        disabled={isSaveDisabled}
        isSaving={isSaving}
        onSave={handleSave}
      />
    </SettingRowShell>
  )
}

type PositiveIntFormValues = z.infer<typeof appSettingPositiveIntFormSchema>

const PositiveIntSettingRow = <K extends AppSettingKey>({
  entry,
  savedValue,
  onSaved,
}: PositiveIntRowProps<K>) => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const form = useForm<PositiveIntFormValues>({
    resolver: zodResolver(appSettingPositiveIntFormSchema),
    defaultValues: { value: String(savedValue) },
    mode: 'onChange',
  })

  const draftValue = useWatch({ control: form.control, name: 'value' })
  const parsedDraft = positiveIntFormValueSchema.safeParse(draftValue)
  const isUnchanged = parsedDraft.success && parsedDraft.data === savedValue
  const isSaveDisabled = isSaving || !form.formState.isValid || isUnchanged

  useEffect(() => {
    form.reset({ value: String(savedValue) })
  }, [form, savedValue])

  const handleSave = async () => {
    if (isSaveDisabled) {
      return
    }

    const parsedValue = positiveIntFormValueSchema.safeParse(
      form.getValues().value,
    )

    if (!parsedValue.success) {
      return
    }

    setIsSaving(true)
    setError(null)

    const result = await saveAppSettingAction({
      key: entry.key,
      value: parsedValue.data as AppSettingValueMap[K],
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
    <SettingRowShell entry={entry} error={error}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="gap-0 space-y-0">
              <FormLabel className="sr-only">{entry.label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  className="w-[110px]"
                  {...field}
                  disabled={isSaving}
                  onChange={(event) => {
                    field.onChange(event.target.value)
                    setError(null)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
      <SaveButton
        disabled={isSaveDisabled}
        isSaving={isSaving}
        onSave={handleSave}
      />
    </SettingRowShell>
  )
}

type SettingRowShellProps = {
  entry: AppSettingRegistryEntry
  error: AppError | null
  children: ReactNode
}

const SettingRowShell = ({ entry, error, children }: SettingRowShellProps) => (
  <div className="flex flex-col gap-3 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-start sm:gap-6">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium">{entry.label}</p>
      <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
        {entry.description}
      </p>
    </div>
    <div className="flex shrink-0 flex-col gap-2 sm:items-end sm:pt-0.5">
      <div className="flex items-center gap-2">{children}</div>
      <AppErrorSurface error={error} />
    </div>
  </div>
)

type SaveButtonProps = {
  disabled: boolean
  isSaving: boolean
  onSave: () => void | Promise<void>
}

const SaveButton = ({ disabled, isSaving, onSave }: SaveButtonProps) => (
  <Button
    type="button"
    size="sm"
    disabled={disabled}
    onClick={() => void onSave()}
  >
    {isSaving ? 'Saving…' : 'Save'}
  </Button>
)

// debt: two-type switch in AppSettingRow, refactor to dispatch if a third valueType is added
export const AppSettingRow = <K extends AppSettingKey>({
  entry,
  savedValue,
  onSaved,
}: AppSettingRowProps<K>) => {
  if (entry.valueType === 'log_level') {
    return (
      <LogLevelSettingRow
        entry={entry}
        savedValue={savedValue as LogLevel}
        onSaved={onSaved}
      />
    )
  }

  return (
    <PositiveIntSettingRow
      entry={entry}
      savedValue={savedValue as number}
      onSaved={onSaved}
    />
  )
}
