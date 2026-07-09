import { SiteContainer } from '@/components/site-container'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { APP_HOME } from '@/constants/app-paths'

import { ProfileDialogProvider } from './profile/profile-dialog-provider'
import { AppNavUser } from './app-nav-user'
import { getCurrentUserProfile } from '../_lib/get-current-user-profile'

type AppShellProps = {
  children: React.ReactNode
}

export const AppShell = async ({ children }: AppShellProps) => {
  const profile = await getCurrentUserProfile()

  return (
    <ProfileDialogProvider
      userId={profile.userId}
      email={profile.email}
      profileLoadFailed={profile.profileLoadFailed}
      defaultValues={{
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
      }}
    >
      <SiteHeader
        logoHref={APP_HOME}
        showNav={false}
        rightSlot={
          <AppNavUser
            displayName={profile.displayName}
            avatarUrl={profile.avatarUrl}
            email={profile.email}
            isAdmin={profile.isAdmin}
          />
        }
        mobileNav={
          <AppNavUser
            displayName={profile.displayName}
            avatarUrl={profile.avatarUrl}
            email={profile.email}
            isAdmin={profile.isAdmin}
          />
        }
      />
      <main id="main-content" className="flex-1 py-8">
        <SiteContainer>{children}</SiteContainer>
      </main>
      <SiteFooter
        logoHref={APP_HOME}
        showNav={false}
        publicSiteLink={{ href: '/', label: 'Back to website' }}
      />
    </ProfileDialogProvider>
  )
}
