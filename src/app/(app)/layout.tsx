import type { Metadata } from 'next'

import { loadAuthenticatedBannerSlot } from '@/components/authenticated-banner-slot-entry'

import { AppShell } from './_components/app-shell'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type AppLayoutProps = {
  children: React.ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const { banner, pin } = await loadAuthenticatedBannerSlot()

  return (
    <AppShell banner={banner} pin={pin}>
      {children}
    </AppShell>
  )
}
