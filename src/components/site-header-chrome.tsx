'use client'

import { useScrolled } from '@/hooks/use-scrolled'
import { cn } from '@/utils/tailwind'

type SiteHeaderChromeProps = {
  sticky?: boolean
  children: React.ReactNode
}

export const SiteHeaderChrome = ({
  sticky = true,
  children,
}: SiteHeaderChromeProps) => {
  const scrolled = useScrolled()

  return (
    <header
      className={cn(
        'duration-swept border-b transition-colors motion-reduce:transition-none',
        scrolled
          ? 'border-border bg-background/95 backdrop-blur'
          : 'border-transparent bg-transparent',
        sticky && 'sticky top-0 z-50',
      )}
    >
      {children}
    </header>
  )
}
