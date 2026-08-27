import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SignInLinkForm } from '@/components/sign-in-link-form'

export const metadata: Metadata = {
  title: 'Sign in with email',
}

type SignInLinkPageProps = {
  searchParams: Promise<{ next?: string }>
}

const SignInLinkFormWithNext = async ({
  searchParams,
}: SignInLinkPageProps) => {
  const { next } = await searchParams

  return <SignInLinkForm next={next} />
}

export default function Page(props: SignInLinkPageProps) {
  return (
    <Suspense fallback={<SignInLinkForm />}>
      <SignInLinkFormWithNext {...props} />
    </Suspense>
  )
}
