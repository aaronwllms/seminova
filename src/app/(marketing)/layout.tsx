import { LandingFooter } from './_components/landing-footer'
import { LandingHeader } from './_components/landing-header'

type MarketingLayoutProps = {
  children: React.ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <LandingHeader />
      {children}
      <LandingFooter />
    </>
  )
}
