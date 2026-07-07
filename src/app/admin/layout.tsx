import type { Metadata } from 'next'
import { Suspense } from 'react'

import { AdminAuthGate } from '@/app/admin/_components/admin-auth-gate'
import { AdminShellSkeleton } from '@/app/admin/_components/admin-shell-skeleton'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

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
