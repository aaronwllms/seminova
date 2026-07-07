import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'

import { getAuthErrorMessage } from '@/app/auth/_lib/auth-error-messages'

export const metadata: Metadata = {
  title: 'Auth error',
}

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>
}) {
  const params = await searchParams

  return (
    <p className="text-muted-foreground text-sm">
      {getAuthErrorMessage(params?.source)}
    </p>
  )
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Sorry, something went wrong.</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense>
          <ErrorContent searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  )
}
