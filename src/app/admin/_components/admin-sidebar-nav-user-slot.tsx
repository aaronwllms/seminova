import { Suspense } from 'react'

import { AdminNavUserSkeleton } from '@/app/admin/_components/admin-nav-user-skeleton'
import { AdminSidebarNavUser } from '@/app/admin/_components/admin-sidebar-nav-user'

export const AdminSidebarNavUserSlot = () => (
  <Suspense fallback={<AdminNavUserSkeleton />}>
    <AdminSidebarNavUser />
  </Suspense>
)
