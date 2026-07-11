import { Github, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { SeminovaLogo } from '@/components/seminova-logo'
import { SiteContainer } from '@/components/site-container'
import { SiteCopyright } from '@/components/site-copyright'
import { SiteNavLinks } from '@/components/site-nav-links'
import { siteConfig, type SiteSocialLink } from '@/config/site'
import { cn } from '@/utils/tailwind'

const socialIcons = {
  github: Github,
} satisfies Record<SiteSocialLink['icon'], LucideIcon>

type SiteFooterProps = {
  logoHref?: string
  showNav?: boolean
  publicSiteLink?: { href: string; label: string }
}

export const SiteFooter = ({
  logoHref = '/',
  showNav = true,
  publicSiteLink,
}: SiteFooterProps) => (
  <footer className="bg-background border-t">
    <SiteContainer className="py-6">
      <div
        className={cn(
          // debt: grid track string coupled with site-header.tsx — change both together
          'flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center',
        )}
      >
        <SeminovaLogo
          href={logoHref}
          className="text-foreground min-w-0 justify-self-start"
        />
        {showNav ? <SiteNavLinks className="justify-self-center" /> : null}
        <div className="flex gap-3 justify-self-end md:col-start-3">
          {siteConfig.social.map((social) => {
            const Icon = socialIcons[social.icon]

            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <Icon className="size-5" aria-hidden />
              </a>
            )
          })}
        </div>
      </div>
      <div className="text-muted-foreground mt-4 flex flex-col gap-4 border-t pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <Suspense
          fallback={<span>© {siteConfig.name}. All rights reserved.</span>}
        >
          <SiteCopyright />
        </Suspense>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {publicSiteLink ? (
            <a
              href={publicSiteLink.href}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {publicSiteLink.label}
            </a>
          ) : null}
          <div className="flex gap-4">
            {siteConfig.legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SiteContainer>
  </footer>
)
