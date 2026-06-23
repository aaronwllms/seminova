import { SiteContainer } from '@/components/site-container'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { APP_HOME } from '@/constants/app-paths'

import { AppNavUser } from './app-nav-user'
import { getCurrentUserProfile } from '../_lib/get-current-user-profile'

type AppShellProps = {
  children: React.ReactNode
}

export const AppShell = async ({ children }: AppShellProps) => {
  const profile = await getCurrentUserProfile()

  return (
    <>
      <SiteHeader
        logoHref={APP_HOME}
        showNav={false}
        rightSlot={<AppNavUser {...profile} />}
        mobileNav={<AppNavUser {...profile} />}
      />
      <main id="main-content" className="flex-1 py-8">
        <SiteContainer>{children}</SiteContainer>
      </main>
      <SiteFooter logoHref={APP_HOME} showNav={false} />
    </>
  )
}
