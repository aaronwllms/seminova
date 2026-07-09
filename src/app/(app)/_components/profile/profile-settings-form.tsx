'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { InlineError } from '@/components/inline-error'
import { ErrorPanel } from '@/components/error-panel'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  profileFormInputSchema,
  type ProfileFormInputValues,
  type ProfileFormValues,
} from '@/app/(app)/_lib/profile/profile-form-schema'
import { useBlurSaveField } from '@/app/(app)/_lib/profile/use-blur-save-field'
import { useProfileAvatarUpload } from '@/app/(app)/_lib/profile/use-profile-avatar-upload'
import { ProfileAvatarField } from './profile-avatar-field'
import { ProfileTextField } from './profile-text-field'

type ProfileSettingsFormProps = {
  userId: string
  email: string
  defaultValues: ProfileFormValues
}

export const ProfileSettingsForm = ({
  userId,
  email,
  defaultValues,
}: ProfileSettingsFormProps) => {
  const [fileError, setFileError] = useState<string | null>(null)

  const form = useForm<ProfileFormInputValues>({
    resolver: zodResolver(profileFormInputSchema),
    defaultValues: {
      displayName: defaultValues.displayName ?? '',
      bio: defaultValues.bio ?? '',
      avatarUrl: defaultValues.avatarUrl ?? '',
    },
  })

  const {
    saveStates,
    setFieldSaveState,
    persistField,
    formError,
    setFormError,
    lastSavedRef,
    inFlightRef,
    createTextBlurHandler,
  } = useBlurSaveField({ defaultValues, form })

  const { handleAvatarUpload } = useProfileAvatarUpload({
    userId,
    form,
    persistField,
    inFlightRef,
    setFileError,
    setFormError,
    lastSavedRef,
  })

  const watchedAvatarUrl = useWatch({
    control: form.control,
    name: 'avatarUrl',
  })
  const watchedDisplayName = useWatch({
    control: form.control,
    name: 'displayName',
  })

  const handleDisplayNameBlur = createTextBlurHandler('displayName', {
    refresh: true,
    toPayload: (trimmed) => ({ displayName: trimmed }),
  })

  const handleBioBlur = createTextBlurHandler('bio', {
    refresh: false,
    toPayload: (trimmed) => ({ bio: trimmed }),
  })

  return (
    <Form {...form}>
      <div className="flex flex-col gap-6">
        <ProfileAvatarField
          avatarUrl={watchedAvatarUrl || null}
          displayName={watchedDisplayName || null}
          email={email}
          saveState={saveStates.avatar}
          onSavedComplete={() => setFieldSaveState('avatar', 'idle')}
          onUpload={handleAvatarUpload}
          fileError={fileError}
          onFileError={setFileError}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ProfileTextField
            control={form.control}
            name="displayName"
            label="Display name"
            placeholder="Your name"
            controlType="input"
            saveState={saveStates.displayName}
            onSavedComplete={() => setFieldSaveState('displayName', 'idle')}
            onBlurSave={handleDisplayNameBlur}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-username">Username</Label>
            <Input
              id="profile-username"
              value={email}
              readOnly
              disabled
              autoComplete="username"
            />
          </div>
        </div>

        <ProfileTextField
          control={form.control}
          name="bio"
          label="Bio"
          placeholder="A short bio"
          controlType="textarea"
          saveState={saveStates.bio}
          onSavedComplete={() => setFieldSaveState('bio', 'idle')}
          onBlurSave={handleBioBlur}
        />

        {formError?.kind === 'fault' ? (
          <ErrorPanel message={formError.message} code={formError.code} />
        ) : formError ? (
          <InlineError message={formError.message} />
        ) : null}
      </div>
    </Form>
  )
}
