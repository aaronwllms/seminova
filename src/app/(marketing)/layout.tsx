import { ProfileDialogHost } from '@/app/(app)/_components/profile/profile-dialog-host'
import { SiteFooter } from '@/components/site-footer'

import { MarketingTopStack } from './_components/marketing-top-stack'

type MarketingLayoutProps = {
  children: React.ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <ProfileDialogHost>
      <MarketingTopStack />
      {children}
      <SiteFooter variant="marketing" />
    </ProfileDialogHost>
  )
}
