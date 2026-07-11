'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { AppErrorSurface } from '@/components/app-error-surface'
import { BlurSaveTextField } from '@/components/blur-save-text-field'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBlurSaveField } from '@/hooks/use-blur-save-field'

import { updateProfileAction } from '@/app/(app)/_lib/profile/actions'
import {
  profileFormInputSchema,
  type ProfileFieldKey,
  type ProfileFormInputValues,
  type ProfileFormValues,
  type ProfilePartialValues,
} from '@/app/(app)/_lib/profile/profile-form-schema'
import { useProfileAvatarUpload } from '@/app/(app)/_lib/profile/use-profile-avatar-upload'
import { ProfileAvatarField } from './profile-avatar-field'

type ProfileSettingsFormProps = {
  userId: string
  email: string
  defaultValues: ProfileFormValues
}

type ProfileLastSaved = {
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
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
  } = useBlurSaveField<
    ProfileFormInputValues,
    'displayName' | 'bio',
    ProfileFieldKey,
    ProfileLastSaved,
    ProfilePartialValues
  >({
    form,
    inFlightKeys: ['displayName', 'bio', 'avatar'] as const,
    initialLastSaved: {
      displayName: defaultValues.displayName?.trim() || null,
      bio: defaultValues.bio?.trim() || null,
      avatarUrl: defaultValues.avatarUrl,
    },
    persist: updateProfileAction,
    faultFallbackMessage: 'Could not save your profile. Please try again.',
  })

  const { handleAvatarUpload, handleAvatarRemove } = useProfileAvatarUpload({
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
    lastSaved: {
      get: (snapshot) => snapshot.displayName,
      set: (snapshot, value) => {
        snapshot.displayName = value
      },
    },
  })

  const handleBioBlur = createTextBlurHandler('bio', {
    refresh: false,
    toPayload: (trimmed) => ({ bio: trimmed }),
    lastSaved: {
      get: (snapshot) => snapshot.bio,
      set: (snapshot, value) => {
        snapshot.bio = value
      },
    },
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
          onRemove={handleAvatarRemove}
          fileError={fileError}
          onFileError={setFileError}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BlurSaveTextField
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
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              value={email}
              readOnly
              autoComplete="username"
            />
          </div>
        </div>

        <BlurSaveTextField
          control={form.control}
          name="bio"
          label="Bio"
          placeholder="A short bio"
          description="Brief description for your profile. Max 160 characters."
          controlType="textarea"
          saveState={saveStates.bio}
          onSavedComplete={() => setFieldSaveState('bio', 'idle')}
          onBlurSave={handleBioBlur}
        />

        <AppErrorSurface error={formError} />
      </div>
    </Form>
  )
}
