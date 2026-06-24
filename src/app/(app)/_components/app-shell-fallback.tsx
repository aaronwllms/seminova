import { SiteContainer } from '@/components/site-container'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { APP_HOME } from '@/constants/app-paths'

type AppShellFallbackProps = {
  children: React.ReactNode
}

export const AppShellFallback = ({ children }: AppShellFallbackProps) => (
  <>
    <SiteHeader logoHref={APP_HOME} showNav={false} />
    <main id="main-content" className="flex-1 py-8">
      <SiteContainer>{children}</SiteContainer>
    </main>
    <SiteFooter logoHref={APP_HOME} showNav={false} />
  </>
)
