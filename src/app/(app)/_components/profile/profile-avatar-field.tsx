'use client'

import { useEffect, useRef, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { InlineError } from '@/components/inline-error'
import { validateAvatarFile } from '@/utils/avatar-storage'
import { getProfileInitials } from '@/utils/user-initials'

import type { FieldSaveState } from '@/app/(app)/_lib/profile/field-save-state'
import { FieldSaveIndicator } from './field-save-indicator'

export const getProfileAvatarAltText = (displayName: string | null): string =>
  displayName?.trim() ? `${displayName.trim()} avatar` : 'Profile photo'

type ProfileAvatarFieldProps = {
  avatarUrl: string | null
  displayName: string | null
  email: string
  saveState: FieldSaveState
  onSavedComplete: () => void
  onUpload: (file: File) => Promise<void>
  fileError: string | null
  onFileError: (message: string | null) => void
}

export const ProfileAvatarField = ({
  avatarUrl,
  displayName,
  email,
  saveState,
  onSavedComplete,
  onUpload,
  fileError,
  onFileError,
}: ProfileAvatarFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const initials = getProfileInitials({ displayName, email })
  const imageSrc = previewUrl ?? avatarUrl
  const avatarAlt = getProfileAvatarAltText(displayName)

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreviewUrl(null)
  }

  const setPreview = (file: File) => {
    clearPreview()
    const objectUrl = URL.createObjectURL(file)
    previewUrlRef.current = objectUrl
    setPreviewUrl(objectUrl)
  }

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const validation = validateAvatarFile(file)

    if (!validation.valid) {
      clearPreview()
      onFileError(validation.message)
      event.target.value = ''
      return
    }

    onFileError(null)
    setPreview(file)

    try {
      await onUpload(file)
      clearPreview()
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Photo</span>
        <FieldSaveIndicator
          state={saveState}
          onSavedComplete={onSavedComplete}
        />
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {imageSrc ? <AvatarImage src={imageSrc} alt={avatarAlt} /> : null}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={saveState === 'saving'}
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
