import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AdminShell } from '@/app/admin/_components/admin-shell'
import { APP_HOME } from '@/constants/app-paths'
import { parseSidebarOpenCookie } from '@/components/ui/sidebar/cookie'
import { SIDEBAR_COOKIE_NAME } from '@/components/ui/sidebar/constants'
import { getDisplayAuthClaims } from '@/supabase/require-auth'
import { isAdmin } from '@/utils/admin'

type AdminAuthGateProps = {
  children: React.ReactNode
}

export const AdminAuthGate = async ({ children }: AdminAuthGateProps) => {
  const claims = await getDisplayAuthClaims()

  if (!isAdmin(claims)) {
    redirect(APP_HOME)
  }

  const userEmail =
    typeof claims.email === 'string' ? claims.email : 'Signed-in user'

  const cookieStore = await cookies()
  const defaultSidebarOpen = parseSidebarOpenCookie(
    cookieStore.get(SIDEBAR_COOKIE_NAME)?.value,
  )

  return (
    <AdminShell userEmail={userEmail} defaultSidebarOpen={defaultSidebarOpen}>
      {children}
    </AdminShell>
  )
}
