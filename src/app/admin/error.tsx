'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { ErrorPanel } from '@/components/error-panel'
import { Button } from '@/components/ui/button'
import { APP_HOME } from '@/constants/app-paths'

type AdminErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error('[admin-error] Route error', error)
  }, [error])

  return (
    <div className="flex w-full flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <ErrorPanel
        message="The admin console could not be loaded. Try again or return to the app."
        code={error.digest}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={APP_HOME}>Back to app</Link>
        </Button>
      </div>
    </div>
  )
}
