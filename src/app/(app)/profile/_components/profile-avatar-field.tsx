'use client'

import { useRef, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { InlineError } from '@/components/inline-error'
import { validateAvatarFile } from '@/utils/avatar-storage'
import { getProfileInitials } from '@/utils/user-initials'

import { FieldSaveIndicator, type FieldSaveState } from './field-save-indicator'

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const initials = getProfileInitials({ displayName, email })
  const imageSrc = previewUrl ?? avatarUrl

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const validation = validateAvatarFile(file)

    if (!validation.valid) {
      setPreviewUrl(null)
      onFileError(validation.message)
      event.target.value = ''
      return
    }

    onFileError(null)
    setPreviewUrl(URL.createObjectURL(file))

    try {
      await onUpload(file)
    } catch {
      setPreviewUrl(null)
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
          {imageSrc ? <AvatarImage src={imageSrc} alt="" /> : null}
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
