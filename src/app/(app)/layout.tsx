import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { AuthenticatedBannerSlot } from '@/components/authenticated-banner-slot'
import { BANNER_DISMISSED_AUTHENTICATED_COOKIE } from '@/constants/banner-cookies'
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
  const cookieStore = await cookies()
  const authenticatedBanner = resolveLiveBannerSlot(
    settings.banner_authenticated,
    cookieStore.get(BANNER_DISMISSED_AUTHENTICATED_COOKIE)?.value,
  )

  return (
    <>
      {authenticatedBanner ? (
        <AuthenticatedBannerSlot
          key={authenticatedBanner.dismissKey}
          config={authenticatedBanner.config}
          dismissKey={authenticatedBanner.dismissKey}
        />
      ) : null}
      <AppShell>{children}</AppShell>
    </>
  )
}
