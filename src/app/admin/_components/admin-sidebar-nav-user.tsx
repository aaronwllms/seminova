import { ProfileDialogProvider } from '@/app/(app)/_components/profile/profile-dialog-provider'
import { getCurrentUserProfile } from '@/app/(app)/_lib/get-current-user-profile'

import { AdminNavUser } from './admin-nav-user'

export const AdminSidebarNavUser = async () => {
  const profile = await getCurrentUserProfile()
  const email = profile.email || 'Signed-in user'

  return (
    <ProfileDialogProvider
      userId={profile.userId}
      email={email}
      profileLoadFailed={profile.profileLoadFailed}
      defaultValues={{
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      }}
    >
      <AdminNavUser
        displayName={profile.displayName}
        avatarUrl={profile.avatarUrl}
        email={email}
      />
    </ProfileDialogProvider>
  )
}
