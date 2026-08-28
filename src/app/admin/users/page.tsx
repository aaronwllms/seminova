import type { Metadata } from 'next'
import { Suspense } from 'react'

import { getDisplayAuthClaims } from '@/supabase/require-auth'

import { UsersTable } from './_components/users-table'
import { UsersTableFallback } from './_components/users-table-fallback'

export const metadata: Metadata = {
  title: 'Users',
}

const UsersTableSlot = async () => {
  const claims = await getDisplayAuthClaims()
  return <UsersTable currentAdminUserId={claims.sub} />
}

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Admins can promote, demote, ban, or unban users from the table.
        </p>
      </div>
      <Suspense fallback={<UsersTableFallback />}>
        <UsersTableSlot />
      </Suspense>
    </div>
  )
}
