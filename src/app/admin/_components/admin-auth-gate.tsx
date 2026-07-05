import { redirect } from 'next/navigation'

import { AdminShell } from '@/app/admin/_components/admin-shell'
import { PROFILE_PATH } from '@/constants/app-paths'
import { createClient } from '@/supabase/server'
import { requireAuthClaims } from '@/supabase/require-auth'
import { isAdmin } from '@/utils/admin'

type AdminAuthGateProps = {
  children: React.ReactNode
}

export const AdminAuthGate = async ({ children }: AdminAuthGateProps) => {
  const supabase = await createClient()
  const claims = await requireAuthClaims(supabase)

  if (!isAdmin(claims)) {
    redirect(PROFILE_PATH)
  }

  const userEmail =
    typeof claims.email === 'string' ? claims.email : 'Signed-in user'

  return <AdminShell userEmail={userEmail}>{children}</AdminShell>
}
