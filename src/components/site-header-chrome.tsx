'use client'

import * as React from 'react'

import { useScrolled } from '@/hooks/use-scrolled'
import { cn } from '@/utils/tailwind'

type SiteHeaderChromeBaseProps = {
  banner?: React.ReactNode
  children: React.ReactNode
}

type SiteHeaderChromeProps = SiteHeaderChromeBaseProps &
  ({ pin?: false; sticky?: boolean } | { pin: true; sticky?: true })

const frostSurfaceClasses = (scrolled: boolean) =>
  cn(
    'duration-swept border-b transition-colors motion-reduce:transition-none',
    scrolled
      ? 'border-border bg-background/95 backdrop-blur'
      : 'border-transparent bg-transparent',
  )

export const SiteHeaderChrome = ({
  banner,
  pin = false,
  sticky = true,
  children,
}: SiteHeaderChromeProps) => {
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const scrolled = useScrolled(sentinelRef)

  if (pin) {
    return (
      <>
        <div ref={sentinelRef} aria-hidden className="-mb-px h-px" />
        <div className={cn(frostSurfaceClasses(scrolled), 'sticky top-0 z-50')}>
          {banner}
          <header>{children}</header>
        </div>
      </>
    )
  }

  return (
    <>
      {banner}
      <div ref={sentinelRef} aria-hidden className="-mb-px h-px" />
      <header
        className={cn(
          frostSurfaceClasses(scrolled),
          sticky && 'sticky top-0 z-50',
        )}
      >
        {children}
      </header>
    </>
  )
}
