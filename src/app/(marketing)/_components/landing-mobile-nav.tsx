'use client'

import { Menu } from 'lucide-react'
import { useState } from 'react'

import { SeminovaLogo } from '@/components/seminova-logo'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/utils/tailwind'

import { LandingAuthButtons } from './landing-auth-buttons'
import { LandingNavLinks } from './landing-nav-links'

type LandingMobileNavProps = {
  className?: string
  authSlot: React.ReactNode
}

export const LandingMobileNav = ({
  className,
  authSlot,
}: LandingMobileNavProps) => {
  const [open, setOpen] = useState(false)

  const handleNavigate = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(className)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[min(280px,85vw)] flex-col gap-6 px-6 py-6 pt-12 sm:w-[300px] sm:max-w-none"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SeminovaLogo
            href="/"
            className="text-foreground"
            onNavigate={handleNavigate}
          />
        </SheetHeader>
        <LandingNavLinks
          className="flex-col items-start gap-1"
          linkClassName="flex min-h-11 w-full items-center py-2"
          onNavigate={handleNavigate}
        />
        {authSlot}
      </SheetContent>
    </Sheet>
  )
}
