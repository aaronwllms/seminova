import Link from 'next/link'

import { LandingAuthButtons } from '@/app/(marketing)/_components/landing-auth-buttons'
import { Button } from '@/components/ui/button'
import { APP_HOME } from '@/constants/app-paths'
import { createClient } from '@/supabase/server'
import { cn } from '@/utils/tailwind'

type LandingAuthSlotProps = {
  layout?: 'row' | 'stack'
  className?: string
}

export const LandingAuthSlot = async ({
  layout = 'row',
  className,
}: LandingAuthSlotProps) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return (
      <Button
        asChild
        size="sm"
        variant="default"
        className={cn(layout === 'stack' && 'w-full', className)}
      >
        <Link href={APP_HOME}>Open app</Link>
      </Button>
    )
  }

  return <LandingAuthButtons layout={layout} className={className} />
}
