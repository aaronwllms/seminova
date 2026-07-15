import type { SupabaseClient } from '@supabase/supabase-js'

import {
  AVATAR_BUCKET,
  buildAvatarStoragePath,
} from '@/constants/storage-paths'

export type RemoveAvatarStorageResult =
  | { ok: true }
  | { ok: false; error: unknown }

export const removeAvatarStorage = async (
  client: SupabaseClient,
  userId: string,
): Promise<RemoveAvatarStorageResult> => {
  try {
    const { error } = await client.storage
      .from(AVATAR_BUCKET)
      .remove([buildAvatarStoragePath(userId)])

    if (error) {
      return { ok: false, error }
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, error }
  }
}
