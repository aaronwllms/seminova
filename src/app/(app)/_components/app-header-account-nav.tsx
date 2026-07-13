import { ProfileDialogProvider } from '@/app/(app)/_components/profile/profile-dialog-provider'
import { getCurrentUserProfile } from '@/app/(app)/_lib/get-current-user-profile'

import { AppNavUser } from './app-nav-user'

// debt: desktop + mobile slots each mount a provider/dialog; consolidate via SiteHeader API if this grows
export const AppHeaderAccountNav = async () => {
  const profile = await getCurrentUserProfile()

  return (
    <ProfileDialogProvider
      userId={profile.userId}
      email={profile.email}
      profileLoadFailed={profile.profileLoadFailed}
      defaultValues={{
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      }}
    >
      <AppNavUser
        displayName={profile.displayName}
        avatarUrl={profile.avatarUrl}
        email={profile.email}
        isAdmin={profile.isAdmin}
      />
    </ProfileDialogProvider>
  )
}
