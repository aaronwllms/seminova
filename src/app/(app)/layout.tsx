import type { Metadata } from 'next'
import { Suspense } from 'react'

import { AuthenticatedBannerSlotEntry } from '@/components/authenticated-banner-slot-entry'

import { AppShell } from './_components/app-shell'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type AppLayoutProps = {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Suspense fallback={null}>
        <AuthenticatedBannerSlotEntry />
      </Suspense>
      <AppShell>{children}</AppShell>
    </>
  )
}
