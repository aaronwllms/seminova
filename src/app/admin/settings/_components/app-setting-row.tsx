'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { z } from 'zod'

import { useAppSettingSave } from '@/app/admin/settings/_lib/use-app-setting-save'
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
import type {
  AppSettingKey,
  AppSettingRegistryEntry,
  NonBannerAppSettingRegistryEntry,
  ResolvedAppSettings,
} from '@/config/app-settings-registry'
import { LOG_LEVELS, type LogLevel } from '@/types/app-settings'
import type { AppError } from '@/types/app-error'
import {
  appSettingLogLevelFormSchema,
  appSettingPositiveIntFormSchema,
  positiveIntFormValueSchema,
} from '@/utils/app-settings-schema'

type AppSettingRowProps = {
  entry: NonBannerAppSettingRegistryEntry
  savedSettings: ResolvedAppSettings
  onSaved: <K extends AppSettingKey>(
    key: K,
    value: ResolvedAppSettings[K],
  ) => void
}

type LogLevelRegistryEntry = Extract<
  NonBannerAppSettingRegistryEntry,
  { readonly valueType: 'log_level' }
>

type LogLevelRowProps = {
  entry: LogLevelRegistryEntry
  savedValue: LogLevel
  onSaved: (key: LogLevelRegistryEntry['key'], value: LogLevel) => void
}

type PositiveIntRegistryEntry = Extract<
  NonBannerAppSettingRegistryEntry,
  { readonly valueType: 'positive_int' }
>

type PositiveIntRowProps = {
  entry: PositiveIntRegistryEntry
  savedValue: number
  onSaved: (key: PositiveIntRegistryEntry['key'], value: number) => void
}

// Settings rows use explicit submit regardless of field count (cross-user, ambient,
// sometimes-irreversible effects) — see forms.mdc save-model exception.

const LogLevelSettingRow = ({
  entry,
  savedValue,
  onSaved,
}: LogLevelRowProps) => {
  const form = useForm<z.infer<typeof appSettingLogLevelFormSchema>>({
    resolver: zodResolver(appSettingLogLevelFormSchema),
    defaultValues: { value: savedValue },
    mode: 'onChange',
  })

  const { isSaving, error, clearError, save } = useAppSettingSave({
    key: entry.key,
    label: entry.label,
    savedValue,
    parse: () => {
      const parsed = appSettingLogLevelFormSchema.safeParse(form.getValues())

      return parsed.success ? parsed.data.value : null
    },
    onSaved,
    resetForm: (value) => form.reset({ value }),
  })

  const draftValue = useWatch({ control: form.control, name: 'value' })
  const isUnchanged = draftValue === savedValue
  const isSaveDisabled = isSaving || !form.formState.isValid || isUnchanged

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
                  clearError()
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
        onSave={() => {
          if (isSaveDisabled) {
            return
          }

          void save()
        }}
      />
    </SettingRowShell>
  )
}

type PositiveIntFormValues = z.infer<typeof appSettingPositiveIntFormSchema>

const PositiveIntSettingRow = ({
  entry,
  savedValue,
  onSaved,
}: PositiveIntRowProps) => {
  const form = useForm<PositiveIntFormValues>({
    resolver: zodResolver(appSettingPositiveIntFormSchema),
    defaultValues: { value: String(savedValue) },
    mode: 'onChange',
  })

  const { isSaving, error, clearError, save } = useAppSettingSave({
    key: entry.key,
    label: entry.label,
    savedValue,
    parse: () => {
      const parsedValue = positiveIntFormValueSchema.safeParse(
        form.getValues().value,
      )

      return parsedValue.success ? parsedValue.data : null
    },
    onSaved,
    resetForm: (value) => form.reset({ value: String(value) }),
  })

  const draftValue = useWatch({ control: form.control, name: 'value' })
  const parsedDraft = positiveIntFormValueSchema.safeParse(draftValue)
  const isUnchanged = parsedDraft.success && parsedDraft.data === savedValue
  const isSaveDisabled = isSaving || !form.formState.isValid || isUnchanged

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
                    clearError()
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
        onSave={() => {
          if (isSaveDisabled) {
            return
          }

          void save()
        }}
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

export const AppSettingRow = ({
  entry,
  savedSettings,
  onSaved,
}: AppSettingRowProps) => {
  if (entry.valueType === 'log_level') {
    return (
      <LogLevelSettingRow
        entry={entry}
        savedValue={savedSettings[entry.key]}
        onSaved={onSaved}
      />
    )
  }

  if (entry.valueType === 'positive_int') {
    return (
      <PositiveIntSettingRow
        entry={entry}
        savedValue={savedSettings[entry.key]}
        onSaved={onSaved}
      />
    )
  }

  const exhaustive: never = entry
  throw new Error(
    `Unhandled app setting valueType: ${JSON.stringify(exhaustive)}`,
  )
}
