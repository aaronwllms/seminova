'use client'

// Showroom fixture — mirrors admin AppSettingRow (one field + Save + toast).
// Demo-only: referenceDemoMockPersist stub (simulated delay, no DB write).

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LOG_LEVELS, type LogLevel } from '@/types/app-settings'
import { showSuccessToast } from '@/utils/app-toast'

import { referenceDemoMockPersist } from '../_lib/reference-demo-persist'
import {
  referencePerRowDemoSchema,
  type ReferencePerRowDemoValues,
} from '../_lib/reference-settings-demo-schema'

const DEFAULT_VALUE: LogLevel = 'info'
const ROW_LABEL = 'Minimum log level'

export const ReferencePerRowFormDemo = () => {
  const [savedValue, setSavedValue] = useState<LogLevel>(DEFAULT_VALUE)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<ReferencePerRowDemoValues>({
    resolver: zodResolver(referencePerRowDemoSchema),
    defaultValues: { value: DEFAULT_VALUE },
    mode: 'onChange',
  })

  const draftValue = useWatch({ control: form.control, name: 'value' })
  const isUnchanged = draftValue === savedValue
  const isSaveDisabled = isSaving || !form.formState.isValid || isUnchanged

  const handleSave = async () => {
    if (isSaveDisabled) {
      return
    }

    const parsed = referencePerRowDemoSchema.safeParse(form.getValues())

    if (!parsed.success) {
      return
    }

    setIsSaving(true)

    const result = await referenceDemoMockPersist(parsed.data)

    setIsSaving(false)

    if (!result.success) {
      return
    }

    setSavedValue(result.data.value)
    showSuccessToast(`${ROW_LABEL} saved`)
  }

  return (
    <Card className="overflow-hidden py-0">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{ROW_LABEL}</p>
          <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
            Logs below this level are neither printed nor persisted.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pt-0.5">
          <Form {...form}>
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem className="gap-0 space-y-0">
                  <FormLabel className="sr-only">{ROW_LABEL}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
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
          <Button
            type="button"
            size="sm"
            disabled={isSaveDisabled}
            onClick={() => void handleSave()}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
