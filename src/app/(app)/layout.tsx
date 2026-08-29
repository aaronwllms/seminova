import type { Metadata } from 'next'
import { Suspense } from 'react'

import { loadAuthenticatedBannerSlot } from '@/components/authenticated-banner-slot-entry'

import { AppShell } from './_components/app-shell'
import { ProfileDialogHost } from './_components/profile/profile-dialog-host'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type AppLayoutProps = {
  children: React.ReactNode
}

const ResolvedAppShell = async ({ children }: AppLayoutProps) => {
  const { banner, pin } = await loadAuthenticatedBannerSlot()

  return (
    <AppShell banner={banner} pin={pin}>
      {children}
    </AppShell>
  )
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <ProfileDialogHost>
      <Suspense
        fallback={
          <AppShell banner={null} pin={false}>
            {children}
          </AppShell>
        }
      >
        <ResolvedAppShell>{children}</ResolvedAppShell>
      </Suspense>
    </ProfileDialogHost>
  )
}
