'use client'

import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
  validateAvatarFile,
  withAvatarCacheBust,
} from '@/utils/avatar-storage'
import { getProfileInitials } from '@/utils/user-initials'

import {
  profileFormInputSchema,
  toProfileFormValues,
  type ProfileFormInputValues,
  type ProfileFormValues,
} from '../_lib/profile-form-schema'

type ProfileAvatarFieldProps = {
  avatarUrl: string | null
  displayName: string | null
  email: string
  onFileSelect: (file: File | null) => void
  onFileError: (message: string | null) => void
  fileError: string | null
}

export const ProfileAvatarField = ({
  avatarUrl,
  displayName,
  email,
  onFileSelect,
  onFileError,
  fileError,
}: ProfileAvatarFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const initials = getProfileInitials({ displayName, email })
  const imageSrc = previewUrl ?? avatarUrl

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      setPreviewUrl(null)
      onFileError(null)
      onFileSelect(null)
      return
    }

    const validation = validateAvatarFile(file)

    if (!validation.valid) {
      setPreviewUrl(null)
      onFileError(validation.message)
      onFileSelect(null)
      event.target.value = ''
      return
    }

    onFileError(null)

    setPreviewUrl(URL.createObjectURL(file))
    onFileSelect(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {imageSrc ? <AvatarImage src={imageSrc} alt="" /> : null}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          Change photo
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleChange}
        />
      </div>
      {fileError ? <InlineError message={fileError} /> : null}
    </div>
  )
}

type ProfileSettingsFormProps = {
  userId: string
  email: string
  defaultValues: ProfileFormValues
  onSubmit: (values: ProfileFormValues) => Promise<AppError | null>
}

export const ProfileSettingsForm = ({
  userId,
  email,
  defaultValues,
  onSubmit,
}: ProfileSettingsFormProps) => {
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formError, setFormError] = useState<AppError | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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

  const handleSave = async (values: ProfileFormInputValues) => {
    setIsSaving(true)
    setFormError(null)
    setFileError(null)

    try {
      const payload = toProfileFormValues(values)
      let avatarUrl = payload.avatarUrl

      if (pendingFile) {
        const validation = validateAvatarFile(pendingFile)

        if (!validation.valid) {
          setFileError(validation.message)
          return
        }

        const { publicUrl } = await uploadUserAvatar({
          userId,
          file: pendingFile,
        })
        avatarUrl = withAvatarCacheBust(publicUrl)
      }

      const error = await onSubmit({ ...payload, avatarUrl })

      if (error) {
        setFormError(error)
        return
      }

      setPendingFile(null)
      const savedValues = { ...payload, avatarUrl }
      form.reset({
        displayName: savedValues.displayName ?? '',
        bio: savedValues.bio ?? '',
        avatarUrl: savedValues.avatarUrl ?? '',
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
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSave)}
        className="flex flex-col gap-6"
      >
        <ProfileAvatarField
          avatarUrl={watchedAvatarUrl || null}
          displayName={watchedDisplayName || null}
          email={email}
          fileError={fileError}
          onFileSelect={(file) => {
            setFileError(null)
            setPendingFile(file)
          }}
          onFileError={setFileError}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your name"
                  {...field}
                  value={field.value ?? ''}
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
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short bio"
                  rows={4}
                  {...field}
                  value={field.value ?? ''}
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

        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </Form>
  )
}
