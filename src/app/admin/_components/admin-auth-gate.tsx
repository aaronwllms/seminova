import { redirect } from 'next/navigation'

import { AdminShell } from '@/app/admin/_components/admin-shell'
import { createClient } from '@/supabase/server'
import { isAdmin, type JwtClaims } from '@/utils/admin'

type AdminAuthGateProps = {
  children: React.ReactNode
}

export const AdminAuthGate = async ({ children }: AdminAuthGateProps) => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  const claims = data.claims as JwtClaims

  if (!isAdmin(claims)) {
    redirect('/protected')
  }

  const userEmail =
    typeof claims.email === 'string' ? claims.email : 'Signed-in user'

  return <AdminShell userEmail={userEmail}>{children}</AdminShell>
}
