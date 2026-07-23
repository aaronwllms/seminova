'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { siteConfig } from '@/config/site'
import { cn } from '@/utils/tailwind'

type SiteNavLinksProps = {
  className?: string
  linkClassName?: string
  onNavigate?: () => void
}

const linkBaseStyles =
  'rounded-md transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
const inactiveLinkStyles = 'text-muted-foreground hover:text-foreground'
const activeLinkStyles = 'text-foreground font-medium'

/**
 * v1 active matching: pathname only; in-page anchors (hash hrefs) never match.
 * Features is a route link (`/features`), not a hash anchor. External links
 * never active.
 */
export const isSiteNavLinkActive = (
  href: string,
  pathname: string,
  external?: boolean,
): boolean => {
  if (external) return false
  if (href.includes('#')) return false
  const path = href.split('#')[0] || '/'
  return path === pathname
}

export const SiteNavLinks = ({
  className,
  linkClassName,
  onNavigate,
}: SiteNavLinksProps) => {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main"
      className={cn('flex items-center gap-6 text-sm', className)}
    >
      {siteConfig.nav.map((item) => {
        const isActive = isSiteNavLinkActive(item.href, pathname, item.external)
        const ariaCurrent = isActive ? ('page' as const) : undefined
        const linkStyles = cn(
          linkBaseStyles,
          isActive ? activeLinkStyles : inactiveLinkStyles,
          linkClassName,
        )

        if (item.external) {
          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              className={linkStyles}
            >
              {item.label}
            </a>
          )
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={ariaCurrent}
            className={linkStyles}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
