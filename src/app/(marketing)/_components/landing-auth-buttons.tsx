import Link from 'next/link'

import { EnvVarWarning } from '@/components/env-var-warning'
import { Button } from '@/components/ui/button'
import { hasEnvVars } from '@/utils/env'

export const LandingAuthButtons = () => {
  if (!hasEnvVars) {
    return <EnvVarWarning />
  }

  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  )
}
