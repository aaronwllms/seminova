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

const inactiveLinkStyles =
  'text-muted-foreground hover:text-foreground transition-colors'
const activeLinkStyles =
  'text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors'

/**
 * v1 active matching: pathname only (hash ignored).
 * Home (`/`) and Features (`/#features`) both match `/` — Features is an in-page
 * anchor, not a separate route. Only the path-only Home link gets
 * aria-current="page". External links never active. Hash-aware Features-only
 * active state is deferred.
 */
export const isSiteNavLinkActive = (
  href: string,
  pathname: string,
  external?: boolean,
): boolean => {
  if (external) return false
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
        // Features shares visual active on `/` but is not a distinct page.
        const ariaCurrent =
          isActive && !item.href.includes('#') ? ('page' as const) : undefined

        if (item.external) {
          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              className={cn(inactiveLinkStyles, linkClassName)}
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
            className={cn(
              isActive ? activeLinkStyles : inactiveLinkStyles,
              linkClassName,
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
