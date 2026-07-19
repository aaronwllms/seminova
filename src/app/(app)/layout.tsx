import type { Metadata } from 'next'

import { getResolvedAppSettings } from '@/utils/app-settings'

import { AppShell } from './_components/app-shell'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type AppLayoutProps = {
  children: React.ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const settings = await getResolvedAppSettings()

  return (
    <AppShell bannerConfig={settings.banner_authenticated}>{children}</AppShell>
  )
}
