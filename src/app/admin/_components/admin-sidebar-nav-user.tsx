import { getCurrentUserProfile } from '@/app/(app)/_lib/get-current-user-profile'

import { AdminNavUser } from './admin-nav-user'

export const AdminSidebarNavUser = async () => {
  const profile = await getCurrentUserProfile()
  const email = profile.email || 'Signed-in user'

  return (
    <AdminNavUser
      displayName={profile.displayName}
      avatarUrl={profile.avatarUrl}
      email={email}
    />
  )
}
