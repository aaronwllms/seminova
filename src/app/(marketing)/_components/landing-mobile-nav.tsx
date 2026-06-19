'use client'

import { Menu } from 'lucide-react'
import { useState } from 'react'

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
}

export const LandingMobileNav = ({ className }: LandingMobileNavProps) => {
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
      <SheetContent side="right" className="flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        </SheetHeader>
        <LandingNavLinks
          className="flex-col items-start gap-4"
          onNavigate={handleNavigate}
        />
        <LandingAuthButtons />
      </SheetContent>
    </Sheet>
  )
}
