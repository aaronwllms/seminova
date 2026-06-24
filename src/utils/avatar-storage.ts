'use client'

import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_BUCKET,
  AVATAR_MAX_BYTES,
  AVATAR_MAX_DIMENSION,
  AVATAR_WEBP_QUALITY,
  buildAvatarStoragePath,
} from '@/constants/storage-paths'
import { createClient } from '@/supabase/client'

export type AvatarFileValidation =
  | { valid: true }
  | { valid: false; message: string }

export class AvatarUploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AvatarUploadError'
  }
}

export const validateAvatarFile = (file: File): AvatarFileValidation => {
  if (file.size > AVATAR_MAX_BYTES) {
    return { valid: false, message: 'Image must be 2 MB or smaller.' }
  }

  if (
    !AVATAR_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return {
      valid: false,
      message: 'Please choose a JPEG, PNG, or WebP image.',
    }
  }

  return { valid: true }
}

const computeDrawDimensions = (
  sourceWidth: number,
  sourceHeight: number,
  maxDimension: number,
): { width: number; height: number } => {
  if (sourceWidth <= maxDimension && sourceHeight <= maxDimension) {
    return { width: sourceWidth, height: sourceHeight }
  }

  const scale = Math.min(
    maxDimension / sourceWidth,
    maxDimension / sourceHeight,
  )

  return {
    width: Math.round(sourceWidth * scale),
    height: Math.round(sourceHeight * scale),
  }
}

export const resizeAvatarToWebp = async (file: File): Promise<Blob> => {
  const bitmap = await createImageBitmap(file)

  try {
    const { width, height } = computeDrawDimensions(
      bitmap.width,
      bitmap.height,
      AVATAR_MAX_DIMENSION,
    )

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
      throw new AvatarUploadError(
        'Could not process your image. Please try again.',
      )
    }

    context.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', AVATAR_WEBP_QUALITY)
    })

    if (!blob) {
      throw new AvatarUploadError(
        'Could not process your image. Please try again.',
      )
    }

    return blob
  } finally {
    bitmap.close()
  }
}

export const getAvatarPublicUrl = (storagePath: string): string => {
  const supabase = createClient()
  const { data } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(storagePath)

  return data.publicUrl
}

export const withAvatarCacheBust = (publicUrl: string): string =>
  `${publicUrl}?v=${Date.now()}`

interface UploadUserAvatarParams {
  userId: string
  file: File
}

export const uploadUserAvatar = async ({
  userId,
  file,
}: UploadUserAvatarParams): Promise<{ publicUrl: string }> => {
  const validation = validateAvatarFile(file)
  if (!validation.valid) {
    throw new AvatarUploadError(validation.message)
  }

  try {
    const webpBlob = await resizeAvatarToWebp(file)
    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new AvatarUploadError('You must be signed in to upload an image.')
    }

    if (user.id !== userId) {
      console.error(
        '[avatar-storage] Session user does not match upload target',
      )
      throw new AvatarUploadError(
        'Could not upload your image. Please try again.',
      )
    }

    const storagePath = buildAvatarStoragePath(user.id)

    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(storagePath, webpBlob, {
        upsert: true,
        contentType: 'image/webp',
      })

    if (error) {
      console.error('[avatar-storage] Upload failed', error)
      throw new AvatarUploadError(
        'Could not upload your image. Please try again.',
      )
    }

    return { publicUrl: getAvatarPublicUrl(storagePath) }
  } catch (error) {
    if (error instanceof AvatarUploadError) {
      throw error
    }

    console.error('[avatar-storage] Upload failed', error)
    throw new AvatarUploadError(
      'Could not upload your image. Please try again.',
    )
  }
}
