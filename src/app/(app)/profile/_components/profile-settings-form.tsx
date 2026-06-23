'use client'

import { useCallback, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { InlineError } from '@/components/inline-error'
import { ErrorPanel } from '@/components/error-panel'
import type { AppError } from '@/types/app-error'
import {
  AvatarUploadError,
  uploadUserAvatar,
  withAvatarCacheBust,
} from '@/utils/avatar-storage'

import { updateProfileAction } from '../actions'
import {
  profileFormInputSchema,
  type ProfileFormInputValues,
  type ProfileFormValues,
  type ProfilePartialValues,
} from '../_lib/profile-form-schema'
import { ProfileAvatarField } from './profile-avatar-field'
import { FieldSaveIndicator, type FieldSaveState } from './field-save-indicator'

type ProfileFieldKey = 'displayName' | 'bio' | 'avatar'

const initialSaveStates = (): Record<ProfileFieldKey, FieldSaveState> => ({
  displayName: 'idle',
  bio: 'idle',
  avatar: 'idle',
})

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
  const router = useRouter()
  const [fileError, setFileError] = useState<string | null>(null)
  const [formError, setFormError] = useState<AppError | null>(null)
  const [saveStates, setSaveStates] =
    useState<Record<ProfileFieldKey, FieldSaveState>>(initialSaveStates)

  const inFlightRef = useRef<Record<ProfileFieldKey, boolean>>({
    displayName: false,
    bio: false,
    avatar: false,
  })

  const lastSavedRef = useRef({
    displayName: defaultValues.displayName?.trim() || null,
    bio: defaultValues.bio?.trim() || null,
    avatarUrl: defaultValues.avatarUrl,
  })

  const form = useForm<ProfileFormInputValues>({
    resolver: zodResolver(profileFormInputSchema),
    defaultValues: {
      displayName: defaultValues.displayName ?? '',
      bio: defaultValues.bio ?? '',
      avatarUrl: defaultValues.avatarUrl ?? '',
    },
  })

  const watchedAvatarUrl = useWatch({
    control: form.control,
    name: 'avatarUrl',
  })
  const watchedDisplayName = useWatch({
    control: form.control,
    name: 'displayName',
  })

  const setFieldSaveState = useCallback(
    (field: ProfileFieldKey, state: FieldSaveState) => {
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
      field: ProfileFieldKey
      payload: ProfilePartialValues
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
        const result = await updateProfileAction(payload)

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
          message: 'Could not save your profile. Please try again.',
          kind: 'fault',
          code: 'INTERNAL_ERROR',
        })
        setFieldSaveState(field, 'idle')
      } finally {
        inFlightRef.current[field] = false
      }
    },
    [router, setFieldSaveState],
  )

  const handleDisplayNameBlur = async () => {
    if (inFlightRef.current.displayName) {
      return
    }

    const isValid = await form.trigger('displayName')

    if (!isValid) {
      return
    }

    const trimmed = form.getValues('displayName').trim() || null

    if (trimmed === lastSavedRef.current.displayName) {
      return
    }

    await persistField({
      field: 'displayName',
      payload: { displayName: trimmed },
      refresh: true,
      onSuccess: () => {
        lastSavedRef.current.displayName = trimmed
        form.resetField('displayName', { defaultValue: trimmed ?? '' })
      },
    })
  }

  const handleBioBlur = async () => {
    if (inFlightRef.current.bio) {
      return
    }

    const isValid = await form.trigger('bio')

    if (!isValid) {
      return
    }

    const trimmed = form.getValues('bio').trim() || null

    if (trimmed === lastSavedRef.current.bio) {
      return
    }

    await persistField({
      field: 'bio',
      payload: { bio: trimmed },
      refresh: false,
      onSuccess: () => {
        lastSavedRef.current.bio = trimmed
        form.resetField('bio', { defaultValue: trimmed ?? '' })
      },
    })
  }

  const handleAvatarUpload = async (file: File) => {
    if (inFlightRef.current.avatar) {
      return
    }

    setFileError(null)

    try {
      const { publicUrl } = await uploadUserAvatar({ userId, file })
      const avatarUrl = withAvatarCacheBust(publicUrl)

      await persistField({
        field: 'avatar',
        payload: { avatarUrl },
        refresh: true,
        onSuccess: () => {
          lastSavedRef.current.avatarUrl = avatarUrl
          form.setValue('avatarUrl', avatarUrl)
        },
      })
    } catch (caught) {
      if (caught instanceof AvatarUploadError) {
        setFileError(caught.message)
        return
      }

      setFormError({
        message: 'Could not save your profile. Please try again.',
        kind: 'fault',
        code: 'INTERNAL_ERROR',
      })
    }
  }

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

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Display name</FormLabel>
                <FieldSaveIndicator
                  state={saveStates.displayName}
                  onSavedComplete={() =>
                    setFieldSaveState('displayName', 'idle')
                  }
                />
              </div>
              <FormControl>
                <Input
                  placeholder="Your name"
                  {...field}
                  value={field.value ?? ''}
                  onBlur={(event) => {
                    field.onBlur()
                    void handleDisplayNameBlur()
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Bio</FormLabel>
                <FieldSaveIndicator
                  state={saveStates.bio}
                  onSavedComplete={() => setFieldSaveState('bio', 'idle')}
                />
              </div>
              <FormControl>
                <Textarea
                  placeholder="A short bio"
                  rows={4}
                  {...field}
                  value={field.value ?? ''}
                  onBlur={(event) => {
                    field.onBlur()
                    void handleBioBlur()
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
