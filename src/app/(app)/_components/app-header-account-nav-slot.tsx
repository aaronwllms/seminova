import { Suspense } from 'react'

import { AppHeaderAccountNav } from '@/app/(app)/_components/app-header-account-nav'
import { AppNavUserSkeleton } from '@/app/(app)/_components/app-nav-user-skeleton'

export const AppHeaderAccountNavSlot = () => (
  <Suspense fallback={<AppNavUserSkeleton />}>
    <AppHeaderAccountNav />
  </Suspense>
)
