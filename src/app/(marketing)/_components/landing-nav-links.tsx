import Link from 'next/link'

import { siteConfig } from '@/config/site'
import { cn } from '@/utils/tailwind'

type LandingNavLinksProps = {
  className?: string
  onNavigate?: () => void
}

export const LandingNavLinks = ({
  className,
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
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {item.label}
        </a>
      ) : (
        <Link
          key={item.label}
          href={item.href}
          onClick={onNavigate}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {item.label}
        </Link>
      ),
    )}
  </nav>
)
