'use client'

import type { Control } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import type { ProfileFormInputValues } from '@/app/(app)/_lib/profile/profile-form-schema'
import { FieldSaveIndicator, type FieldSaveState } from './field-save-indicator'

type TextFieldName = 'displayName' | 'bio'

type ProfileTextFieldProps = {
  control: Control<ProfileFormInputValues>
  name: TextFieldName
  label: string
  placeholder: string
  controlType: 'input' | 'textarea'
  saveState: FieldSaveState
  onSavedComplete: () => void
  onBlurSave: () => void | Promise<void>
}

export const ProfileTextField = ({
  control,
  name,
  label,
  placeholder,
  controlType,
  saveState,
  onSavedComplete,
  onBlurSave,
}: ProfileTextFieldProps) => {
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
                onBlur={(event) => {
                  field.onBlur()
                  void onBlurSave()
                }}
              />
            ) : (
              <Input
                placeholder={placeholder}
                {...field}
                value={field.value ?? ''}
                onBlur={(event) => {
                  field.onBlur()
                  void onBlurSave()
                }}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
