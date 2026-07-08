import type { Metadata } from 'next'

import { createClient } from '@/supabase/server'
import { requireAuthClaims } from '@/supabase/require-auth'

import { UsersTable } from './_components/users-table'

export const metadata: Metadata = {
  title: 'Users',
}

export default async function UsersPage() {
  const supabase = await createClient()
  const claims = await requireAuthClaims(supabase)
  const currentAdminUserId = claims.sub

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Signed-up accounts from Supabase Auth. Admins can promote or demote
          roles from the table.
        </p>
      </div>
      <UsersTable currentAdminUserId={currentAdminUserId} />
    </div>
  )
}
