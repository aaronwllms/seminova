import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  AVATAR_MAX_BYTES,
  buildAvatarStoragePath,
} from '@/constants/storage-paths'

import * as avatarStorage from './avatar-storage'
import {
  getAvatarPublicUrl,
  resizeAvatarToWebp,
  validateAvatarFile,
  withAvatarCacheBust,
} from './avatar-storage'

const TEST_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

const makeFile = (overrides: { size?: number; type?: string } = {}) => {
  const { size = 1024, type = 'image/png' } = overrides
  const file = new File(['test'], 'avatar.png', { type })
  if (size !== file.size) {
    Object.defineProperty(file, 'size', { value: size })
  }
  return file
}

const mockUpload = vi.fn()
const mockGetPublicUrl = vi.fn()
const mockGetUser = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  }),
}))

describe('buildAvatarStoragePath', () => {
  it('should always return the canonical webp path for a user', () => {
    expect(buildAvatarStoragePath(TEST_USER_ID)).toBe(
      `${TEST_USER_ID}/avatar.webp`,
    )
  })
})

describe('validateAvatarFile', () => {
  it('should accept allowed image types under the size cap', () => {
    expect(validateAvatarFile(makeFile({ type: 'image/jpeg' }))).toEqual({
      valid: true,
    })
    expect(validateAvatarFile(makeFile({ type: 'image/png' }))).toEqual({
      valid: true,
    })
    expect(validateAvatarFile(makeFile({ type: 'image/webp' }))).toEqual({
      valid: true,
    })
  })

  it('should reject disallowed MIME types with a user-facing message', () => {
    expect(validateAvatarFile(makeFile({ type: 'image/gif' }))).toEqual({
      valid: false,
      message: 'Please choose a JPEG, PNG, or WebP image.',
    })
  })

  it('should reject files over the max size and accept exact max', () => {
    expect(
      validateAvatarFile(makeFile({ size: AVATAR_MAX_BYTES + 1 })),
    ).toEqual({
      valid: false,
      message: 'Image must be 2 MB or smaller.',
    })
    expect(validateAvatarFile(makeFile({ size: AVATAR_MAX_BYTES }))).toEqual({
      valid: true,
    })
  })
})

describe('resizeAvatarToWebp', () => {
  const originalCreateImageBitmap = globalThis.createImageBitmap
  const originalToBlob = HTMLCanvasElement.prototype.toBlob
  const originalGetContext = HTMLCanvasElement.prototype.getContext

  beforeEach(() => {
    globalThis.createImageBitmap = vi.fn().mockResolvedValue({
      width: 512,
      height: 256,
      close: vi.fn(),
    }) as unknown as typeof createImageBitmap

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext

    HTMLCanvasElement.prototype.toBlob = function toBlob(
      callback,
      type,
      quality,
    ) {
      expect(type).toBe('image/webp')
      expect(quality).toBe(0.85)
      callback(new Blob(['webp'], { type: 'image/webp' }))
    }
  })

  afterEach(() => {
    globalThis.createImageBitmap = originalCreateImageBitmap
    HTMLCanvasElement.prototype.toBlob = originalToBlob
    HTMLCanvasElement.prototype.getContext = originalGetContext
  })

  it('should downscale wide images to the max dimension cap', async () => {
    const blob = await resizeAvatarToWebp(makeFile({ type: 'image/png' }))
    expect(blob.type).toBe('image/webp')
  })
})

describe('withAvatarCacheBust', () => {
  it('should append a version query param to the public URL', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1719158400000)

    expect(
      withAvatarCacheBust(
        'https://example.supabase.co/storage/v1/object/public/avatars/u/avatar.webp',
      ),
    ).toBe(
      'https://example.supabase.co/storage/v1/object/public/avatars/u/avatar.webp?v=1719158400000',
    )
  })
})

describe('uploadUserAvatar', () => {
  const originalCreateImageBitmap = globalThis.createImageBitmap
  const originalToBlob = HTMLCanvasElement.prototype.toBlob
  const originalGetContext = HTMLCanvasElement.prototype.getContext

  beforeEach(() => {
    mockUpload.mockReset()
    mockGetPublicUrl.mockReset()
    mockGetUser.mockReset()
    mockGetUser.mockResolvedValue({
      data: { user: { id: TEST_USER_ID } },
      error: null,
    })
    mockUpload.mockResolvedValue({ error: null })
    mockGetPublicUrl.mockReturnValue({
      data: {
        publicUrl: `https://example.supabase.co/storage/v1/object/public/avatars/${TEST_USER_ID}/avatar.webp`,
      },
    })

    globalThis.createImageBitmap = vi.fn().mockResolvedValue({
      width: 512,
      height: 256,
      close: vi.fn(),
    }) as unknown as typeof createImageBitmap

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext

    HTMLCanvasElement.prototype.toBlob = function toBlob(callback) {
      callback(new Blob(['webp'], { type: 'image/webp' }))
    }
  })

  afterEach(() => {
    globalThis.createImageBitmap = originalCreateImageBitmap
    HTMLCanvasElement.prototype.toBlob = originalToBlob
    HTMLCanvasElement.prototype.getContext = originalGetContext
  })

  it('should upload a png input to the fixed webp storage path', async () => {
    const file = makeFile({ type: 'image/png' })

    const result = await avatarStorage.uploadUserAvatar({
      userId: TEST_USER_ID,
      file,
    })

    expect(mockUpload).toHaveBeenCalledWith(
      `${TEST_USER_ID}/avatar.webp`,
      expect.any(Blob),
      { upsert: true, contentType: 'image/webp' },
    )
    expect(result.publicUrl).toContain('/avatar.webp')
  })

  it('should reject upload when there is no authenticated session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(
      avatarStorage.uploadUserAvatar({
        userId: TEST_USER_ID,
        file: makeFile({ type: 'image/png' }),
      }),
    ).rejects.toMatchObject({
      message: 'You must be signed in to upload an image.',
    })

    expect(mockUpload).not.toHaveBeenCalled()
  })
})

describe('getAvatarPublicUrl', () => {
  it('should return the public URL from Supabase storage', () => {
    const path = buildAvatarStoragePath(TEST_USER_ID)
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.test/avatar.webp' },
    })

    expect(getAvatarPublicUrl(path)).toBe('https://example.test/avatar.webp')
  })
})
