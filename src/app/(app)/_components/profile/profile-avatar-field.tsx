'use client'

import { useEffect, useRef, useState } from 'react'

import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { InlineError } from '@/components/inline-error'
import {
  AVATAR_FIELD_HELPER_TEXT,
  validateAvatarFile,
} from '@/utils/avatar-storage'

import type { FieldSaveState } from '@/types/field-save-state'
import { FieldSaveIndicator } from '@/components/field-save-indicator'

export const getProfileAvatarAltText = (displayName: string | null): string =>
  displayName?.trim() ? `${displayName.trim()} avatar` : 'Profile photo'

type ProfileAvatarFieldProps = {
  avatarUrl: string | null
  displayName: string | null
  email: string
  saveState: FieldSaveState
  onSavedComplete: () => void
  onUpload: (file: File) => Promise<void>
  onRemove: () => Promise<void>
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
  onRemove,
  fileError,
  onFileError,
}: ProfileAvatarFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const avatarAlt = getProfileAvatarAltText(displayName)
  const hasAvatar = Boolean(previewUrl || avatarUrl)

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

  const handleRemove = async () => {
    clearPreview()
    onFileError(null)
    await onRemove()
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
        <UserAvatar
          avatarUrl={avatarUrl}
          displayName={displayName}
          email={email}
          previewSrc={previewUrl}
          alt={avatarAlt}
          className="h-16 w-16"
          fallbackClassName="text-lg"
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={saveState === 'saving'}
          >
            Change
          </Button>
          {hasAvatar ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleRemove()}
              disabled={saveState === 'saving'}
            >
              Remove
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleChange}
        />
      </div>
      <p className="text-muted-foreground text-sm">
        {AVATAR_FIELD_HELPER_TEXT}
      </p>
      {fileError ? <InlineError message={fileError} /> : null}
    </div>
  )
}
