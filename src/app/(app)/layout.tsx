import type { Metadata } from 'next'
import { Suspense } from 'react'

import { AppShell } from './_components/app-shell'
import { AppShellFallback } from './_components/app-shell-fallback'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type AppLayoutProps = {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense fallback={<AppShellFallback>{children}</AppShellFallback>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  )
}
