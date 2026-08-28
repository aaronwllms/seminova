import { ProfileDialogProvider } from '@/app/(app)/_components/profile/profile-dialog-provider'
import { getCurrentUserProfile } from '@/app/(app)/_lib/get-current-user-profile'

import { AppNavUser } from './app-nav-user'

type AppHeaderAccountNavProps = {
  showOpenApp?: boolean
}

// debt: desktop + mobile slots each mount a provider/dialog; consolidate via SiteHeader API if this grows
export const AppHeaderAccountNav = async ({
  showOpenApp = false,
}: AppHeaderAccountNavProps = {}) => {
  const profile = await getCurrentUserProfile()

  return (
    <ProfileDialogProvider
      userId={profile.userId}
      email={profile.email}
      hasPassword={profile.hasPassword}
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
        showOpenApp={showOpenApp}
      />
    </ProfileDialogProvider>
  )
}
