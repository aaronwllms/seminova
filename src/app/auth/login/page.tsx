import type { Metadata } from 'next'
import { Suspense } from 'react'

import { LoginForm } from '@/components/login-form'

export const metadata: Metadata = {
  title: 'Login',
}

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

const LoginFormWithNext = async ({ searchParams }: LoginPageProps) => {
  const { next } = await searchParams

  return <LoginForm next={next} />
}

export default function Page(props: LoginPageProps) {
  return (
    <Suspense fallback={<LoginForm />}>
      <LoginFormWithNext {...props} />
    </Suspense>
  )
}
