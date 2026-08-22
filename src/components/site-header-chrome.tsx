'use client'

import * as React from 'react'

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
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const scrolled = useScrolled(sentinelRef)

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="-mb-px h-px" />
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
    </>
  )
}
