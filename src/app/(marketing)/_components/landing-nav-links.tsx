import Link from 'next/link'

import { siteConfig } from '@/config/site'
import { cn } from '@/utils/tailwind'

type LandingNavLinksProps = {
  className?: string
  linkClassName?: string
  onNavigate?: () => void
}

const linkStyles =
  'text-muted-foreground hover:text-foreground transition-colors'

export const LandingNavLinks = ({
  className,
  linkClassName,
  onNavigate,
}: LandingNavLinksProps) => (
  <nav
    aria-label="Main"
    className={cn('flex items-center gap-6 text-sm', className)}
  >
    {siteConfig.nav.map((item) =>
      item.external ? (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className={cn(linkStyles, linkClassName)}
        >
          {item.label}
        </a>
      ) : (
        <Link
          key={item.label}
          href={item.href}
          onClick={onNavigate}
          className={cn(linkStyles, linkClassName)}
        >
          {item.label}
        </Link>
      ),
    )}
  </nav>
)
