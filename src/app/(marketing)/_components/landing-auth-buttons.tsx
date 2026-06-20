import Link from 'next/link'

import { EnvVarWarning } from '@/components/env-var-warning'
import { Button } from '@/components/ui/button'
import { hasEnvVars } from '@/utils/env'
import { cn } from '@/utils/tailwind'

type LandingAuthButtonsProps = {
  className?: string
  layout?: 'row' | 'stack'
}

export const LandingAuthButtons = ({
  className,
  layout = 'row',
}: LandingAuthButtonsProps) => {
  if (!hasEnvVars) {
    return <EnvVarWarning />
  }

  const isStacked = layout === 'stack'

  return (
    <div
      className={cn(
        'flex gap-2',
        isStacked && 'w-full flex-col gap-3',
        className,
      )}
    >
      <Button
        asChild
        size="sm"
        variant="outline"
        className={cn(isStacked && 'w-full')}
      >
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button
        asChild
        size="sm"
        variant="default"
        className={cn(isStacked && 'w-full')}
      >
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  )
}
