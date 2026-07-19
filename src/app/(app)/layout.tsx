import type { Metadata } from 'next'
import { connection } from 'next/server'

import { AuthenticatedBannerSlot } from '@/components/authenticated-banner-slot'
import { getResolvedAppSettings } from '@/utils/app-settings'
import { resolveLiveBannerSlot } from '@/utils/banner-dismiss-cookie'

import { AppShell } from './_components/app-shell'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type AppLayoutProps = {
  children: React.ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const settings = await getResolvedAppSettings()
  await connection()
  const authenticatedBanner = resolveLiveBannerSlot(
    settings.banner_authenticated,
    undefined,
  )

  return (
    <>
      {authenticatedBanner ? (
        <AuthenticatedBannerSlot
          key={authenticatedBanner.dismissKey}
          config={authenticatedBanner.config}
        />
      ) : null}
      <AppShell>{children}</AppShell>
    </>
  )
}
