import { getCurrentUserProfile } from '@/app/(app)/_lib/get-current-user-profile'

import { AppNavUser } from './app-nav-user'

type AppHeaderAccountNavProps = {
  showOpenApp?: boolean
}

// Requires an ancestor ProfileDialogHost.
export const AppHeaderAccountNav = async ({
  showOpenApp = false,
}: AppHeaderAccountNavProps = {}) => {
  const profile = await getCurrentUserProfile()

  return (
    <AppNavUser
      displayName={profile.displayName}
      avatarUrl={profile.avatarUrl}
      email={profile.email}
      isAdmin={profile.isAdmin}
      showOpenApp={showOpenApp}
    />
  )
}
