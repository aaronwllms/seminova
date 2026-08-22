import Link from 'next/link'

import { siteConfig } from '@/config/site'
import { cn } from '@/utils/tailwind'

type SeminovaLogoProps = {
  className?: string
  href: string | null
  onNavigate?: () => void
}

export const SeminovaLogo = ({
  className,
  href,
  onNavigate,
}: SeminovaLogoProps) => {
  const Logo = siteConfig.Logo

  const content = (
    <>
      <span className="bg-primary text-primary-foreground ring-primary-foreground/20 flex size-7 shrink-0 items-center justify-center rounded-lg shadow-xs ring-1 ring-inset">
        <Logo className="size-4" aria-hidden />
      </span>
      <span className="truncate font-semibold tracking-tight">
        {siteConfig.name}
      </span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          'text-sidebar-foreground flex items-center gap-2 overflow-hidden',
          className,
        )}
      >
        {content}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'text-sidebar-foreground flex items-center gap-2 overflow-hidden',
        className,
      )}
    >
      {content}
    </div>
  )
}
