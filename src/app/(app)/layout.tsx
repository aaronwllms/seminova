import { Suspense } from 'react'

import { AppShell } from './_components/app-shell'
import { AppShellFallback } from './_components/app-shell-fallback'

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
