import { createClient } from '@/supabase/server'
import type { JwtClaims } from '@/utils/admin'

import { UsersTable } from './_components/users-table'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims as JwtClaims | undefined
  const currentAdminUserId = claims?.sub?.trim() ?? ''

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
