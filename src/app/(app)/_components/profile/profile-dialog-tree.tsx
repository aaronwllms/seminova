import { getCurrentUserProfile } from '@/app/(app)/_lib/get-current-user-profile'
import { hasServerAuthSession } from '@/supabase/require-auth'

import { ProfileDialogBinder } from './profile-dialog-provider'

export const ProfileDialogTree = async () => {
  const isAuthenticated = await hasServerAuthSession()

  if (!isAuthenticated) {
    return null
  }

  const profile = await getCurrentUserProfile()

  return (
    <ProfileDialogBinder
      userId={profile.userId}
      email={profile.email}
      hasPassword={profile.hasPassword}
      profileLoadFailed={profile.profileLoadFailed}
      defaultValues={{
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      }}
    />
  )
}
