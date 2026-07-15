import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import {
  AVATAR_BUCKET,
  buildAvatarStoragePath,
} from '@/constants/storage-paths'

import { removeAvatarStorage } from './remove-avatar-storage'

const USER_ID = 'user-1'

const createMockClient = (remove: ReturnType<typeof vi.fn>): SupabaseClient =>
  ({
    storage: {
      from: vi.fn((bucket: string) => {
        expect(bucket).toBe(AVATAR_BUCKET)
        return { remove }
      }),
    },
  }) as unknown as SupabaseClient

describe('removeAvatarStorage', () => {
  it('should return ok when storage remove succeeds', async () => {
    const mockRemove = vi.fn().mockResolvedValue({ data: [], error: null })
    const client = createMockClient(mockRemove)

    const result = await removeAvatarStorage(client, USER_ID)

    expect(result).toEqual({ ok: true })
    expect(mockRemove).toHaveBeenCalledWith([buildAvatarStoragePath(USER_ID)])
  })

  it('should return the storage error without throwing', async () => {
    const storageError = { message: 'storage delete failed' }
    const mockRemove = vi
      .fn()
      .mockResolvedValue({ data: null, error: storageError })
    const client = createMockClient(mockRemove)

    const result = await removeAvatarStorage(client, USER_ID)

    expect(result).toEqual({ ok: false, error: storageError })
  })
})
