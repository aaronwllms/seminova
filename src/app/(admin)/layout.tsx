import { Suspense } from 'react'

import { AdminAuthGate } from '@/app/(admin)/_components/admin-auth-gate'
import { AdminShellSkeleton } from '@/app/(admin)/_components/admin-shell-skeleton'

type AdminLayoutProps = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminAuthGate>{children}</AdminAuthGate>
    </Suspense>
  )
}
