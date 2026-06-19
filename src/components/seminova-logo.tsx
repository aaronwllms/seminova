import { Sparkles } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/utils/tailwind'

type SeminovaLogoProps = {
  className?: string
  href?: string
}

export const SeminovaLogo = ({
  className,
  href = '/users',
}: SeminovaLogoProps) => {
  const content = (
    <>
      <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <span className="truncate font-semibold">Seminova</span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
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
