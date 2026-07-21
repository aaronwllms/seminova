import { SiteFooter } from '@/components/site-footer'

import { MarketingFooterBorder } from './_components/marketing-footer-border'
import { MarketingStickyChrome } from './_components/marketing-sticky-chrome'

type MarketingLayoutProps = {
  children: React.ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <MarketingStickyChrome />
      {children}
      <MarketingFooterBorder>
        <SiteFooter logoHref="/" showTopBorder={false} />
      </MarketingFooterBorder>
    </>
  )
}
