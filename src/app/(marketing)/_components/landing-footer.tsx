import { Github, type LucideIcon } from 'lucide-react'
import { Suspense } from 'react'

import { SeminovaLogo } from '@/components/seminova-logo'
import { siteConfig, type SiteSocialLink } from '@/config/site'

import { LandingContainer } from './landing-container'
import { LandingCopyright } from './landing-copyright'
import { LandingNavLinks } from './landing-nav-links'

const socialIcons = {
  github: Github,
} satisfies Record<SiteSocialLink['icon'], LucideIcon>

export const LandingFooter = () => (
  <footer className="bg-background border-t">
    <LandingContainer className="py-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <SeminovaLogo href="/" className="text-foreground" />
        <LandingNavLinks />
        <div className="flex gap-3">
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
          <LandingCopyright />
        </Suspense>
        <div className="flex gap-4">
          {siteConfig.legal.map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
      </div>
    </LandingContainer>
  </footer>
)
