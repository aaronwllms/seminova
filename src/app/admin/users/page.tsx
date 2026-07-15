import type { Metadata } from 'next'

import { getDisplayAuthClaims } from '@/supabase/require-auth'

import { UsersTable } from './_components/users-table'

export const metadata: Metadata = {
  title: 'Users',
}

export default async function UsersPage() {
  const claims = await getDisplayAuthClaims()
  const currentAdminUserId = claims.sub

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Signed-up accounts from Supabase Auth. Admins can promote, demote,
          ban, or unban users from the table.
        </p>
      </div>
      <UsersTable currentAdminUserId={currentAdminUserId} />
    </div>
  )
}
