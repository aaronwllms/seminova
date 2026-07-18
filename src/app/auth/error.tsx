'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { ErrorPanel } from '@/components/error-panel'
import { Button } from '@/components/ui/button'
import { LOGIN_PATH } from '@/constants/app-paths'
import { clientLog } from '@/utils/client-logger'

type AuthErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    clientLog.error('auth-error', 'Route error', error)
  }, [error])

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <ErrorPanel
        message="This sign-in page could not be loaded. Try again or return home."
        code={error.digest}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={LOGIN_PATH}>Sign in</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
