import type { Metadata } from 'next'
import Link from 'next/link'

import { REFERENCE_PATH } from '@/constants/app-paths'

export const metadata: Metadata = {
  title: 'Home',
}

export default function AppHomePage() {
  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="text-2xl font-bold">Home</h1>
      <p className="text-muted-foreground max-w-prose text-sm">
        This is a placeholder for your authenticated landing page. Replace it
        with your product&apos;s real home when you spin off from the template.
      </p>
      <p className="text-muted-foreground max-w-prose text-sm">
        Browse the{' '}
        <Link
          href={REFERENCE_PATH}
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          pattern reference
        </Link>{' '}
        to see the components and interaction patterns your spinoff inherits.
      </p>
    </div>
  )
}
