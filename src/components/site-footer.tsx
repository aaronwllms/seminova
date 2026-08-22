import { Github, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { SeminovaLogo } from '@/components/seminova-logo'
import { SiteContainer } from '@/components/site-container'
import { SiteCopyright } from '@/components/site-copyright'
import {
  siteConfig,
  type SiteNavLink,
  type SiteSocialLink,
} from '@/config/site'
import { cn } from '@/utils/tailwind'

const socialIcons = {
  github: Github,
} satisfies Record<SiteSocialLink['icon'], LucideIcon>

// debt: motion-tier lint does not resolve identifiers passed to cn() back to their declaration; a future removal of duration-swept from this constant won't be caught. Upgrade path: extend local/motion-tier to scan top-level string constants. (Same gap as site-nav-links.tsx linkBaseStyles.)
const footerLinkStyles =
  'text-muted-foreground hover:text-foreground focus-visible:ring-ring duration-swept rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none'

type SiteFooterProps = {
  variant?: 'marketing' | 'app'
}

const FooterLink = ({ link }: { link: SiteNavLink }) =>
  link.external ? (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={footerLinkStyles}
    >
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={footerLinkStyles}>
      {link.label}
    </Link>
  )

const SocialLinks = ({ className }: { className?: string }) => (
  <div className={cn('flex gap-3', className)}>
    {siteConfig.social.map((social) => {
      const Icon = socialIcons[social.icon]

      return (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          className={footerLinkStyles}
        >
          <Icon className="size-5" aria-hidden />
        </a>
      )
    })}
  </div>
)

const LegalLinks = () => (
  <div className="flex gap-4">
    {siteConfig.legal.map((item) => (
      <Link key={item.label} href={item.href} className={footerLinkStyles}>
        {item.label}
      </Link>
    ))}
  </div>
)

const Copyright = () => (
  <Suspense fallback={<span>© {siteConfig.name}. All rights reserved.</span>}>
    <SiteCopyright />
  </Suspense>
)

/**
 * Marketing: brand column plus grouped link columns, driven entirely by
 * siteConfig.footer — adding a column or link is a config edit, not a layout
 * change.
 *
 * App: a single utility line. Authenticated users don't need re-marketing;
 * the app footer exists for legal reachability and to stay out of the way.
 */
export const SiteFooter = ({ variant = 'marketing' }: SiteFooterProps) => {
  if (variant === 'app') {
    return (
      <footer className="bg-background border-t">
        <SiteContainer className="py-4">
          <div className="text-muted-foreground flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <Copyright />
            <div className="flex items-center gap-4">
              <LegalLinks />
              <SocialLinks />
            </div>
          </div>
        </SiteContainer>
      </footer>
    )
  }

  return (
    <footer className="bg-background border-t">
      <SiteContainer className="py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div className="col-span-2 md:col-span-1">
            <SeminovaLogo href="/" className="text-foreground min-w-0" />
            <p className="text-muted-foreground mt-3 max-w-[34ch] text-sm">
              {siteConfig.description}
            </p>
            <SocialLinks className="mt-4" />
          </div>
          {siteConfig.footer.map((column) => (
            <div key={column.heading}>
              <h2 className="text-foreground text-xs font-medium">
                {column.heading}
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground mt-10 flex flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <Copyright />
          <LegalLinks />
        </div>
      </SiteContainer>
    </footer>
  )
}
