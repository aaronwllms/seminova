import type { Database } from '@/types/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type ProfileFields = Pick<Profile, 'display_name' | 'avatar_url' | 'bio'>

export type ProfileFieldsView = {
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
}

export const profileFieldsToView = (
  fields: ProfileFields,
): ProfileFieldsView => ({
  displayName: fields.display_name,
  avatarUrl: fields.avatar_url,
  bio: fields.bio,
})

export const profilePartialToUpdate = (
  partial: Partial<ProfileFieldsView>,
): Pick<ProfileUpdate, 'display_name' | 'avatar_url' | 'bio'> => {
  const update: Pick<ProfileUpdate, 'display_name' | 'avatar_url' | 'bio'> = {}

  if (partial.displayName !== undefined) {
    update.display_name = partial.displayName
  }

  if (partial.bio !== undefined) {
    update.bio = partial.bio
  }

  if (partial.avatarUrl !== undefined) {
    update.avatar_url = partial.avatarUrl
  }

  return update
}
