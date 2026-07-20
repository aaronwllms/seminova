import { LandingFooter } from './_components/landing-footer'
import { MarketingStickyChrome } from './_components/marketing-sticky-chrome'

type MarketingLayoutProps = {
  children: React.ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <MarketingStickyChrome />
      {children}
      <LandingFooter />
    </>
  )
}
