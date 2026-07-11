'use client'

import type { Control, FieldValues, Path } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import type { FieldSaveState } from '@/types/field-save-state'

import { FieldSaveIndicator } from './field-save-indicator'

type BlurSaveTextFieldProps<
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TFieldName
  label: string
  placeholder: string
  description?: string
  controlType: 'input' | 'textarea'
  saveState: FieldSaveState
  onSavedComplete: () => void
  onBlurSave: () => void | Promise<void>
}

export const BlurSaveTextField = <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  description,
  controlType,
  saveState,
  onSavedComplete,
  onBlurSave,
}: BlurSaveTextFieldProps<TFieldValues, TFieldName>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>{label}</FormLabel>
            <FieldSaveIndicator
              state={saveState}
              onSavedComplete={onSavedComplete}
            />
          </div>
          <FormControl>
            {controlType === 'textarea' ? (
              <Textarea
                placeholder={placeholder}
                rows={4}
                {...field}
                value={field.value ?? ''}
                onBlur={() => {
                  field.onBlur()
                  void onBlurSave()
                }}
              />
            ) : (
              <Input
                placeholder={placeholder}
                {...field}
                value={field.value ?? ''}
                onBlur={() => {
                  field.onBlur()
                  void onBlurSave()
                }}
              />
            )}
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
