'use client'

import { createClient } from '@/supabase/client'
import { EmailOtpRequestCard } from '@/components/email-otp-request-card'
import Link from 'next/link'

import { getPostAuthRedirectPath } from '@/utils/admin'
import { isUsableRedirectNext } from '@/utils/is-safe-redirect'

type SignInLinkFormProps = React.ComponentPropsWithoutRef<'div'> & {
  next?: string | null
}

export function SignInLinkForm({ next, ...props }: SignInLinkFormProps) {
  const loginHref = next
    ? `/auth/login?${new URLSearchParams({ next }).toString()}`
    : '/auth/login'

  const buildSignInLinkOptions = () => {
    const options: {
      shouldCreateUser: true
      emailRedirectTo?: string
    } = { shouldCreateUser: true }

    if (next && isUsableRedirectNext(next, window.location.origin)) {
      options.emailRedirectTo = `${window.location.origin}${next}`
    }

    return options
  }

  return (
    <EmailOtpRequestCard
      send={async (email) => {
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: buildSignInLinkOptions(),
        })
        if (error) throw error
      }}
      verify={async (email, token) => {
        const supabase = createClient()
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        })
        if (error) throw error

        return next && isUsableRedirectNext(next, window.location.origin)
          ? next
          : getPostAuthRedirectPath(data.user?.app_metadata)
      }}
      title="Sign in with email"
      successTitle="Complete sign-in"
      description="Enter your email and we'll send you a sign in link"
      successDescription="Use the link or code from your email"
      successBody={(email) => (
        <p className="text-muted-foreground text-sm">
          We sent a sign-in link to {email}. Enter the code from that email
          below, or follow the link instead.
        </p>
      )}
      submitLabel="Send sign-in link"
      footer={
        <>
          Prefer password sign-in?{' '}
          <Link
            href={loginHref}
            prefetch={false}
            className="underline underline-offset-4"
          >
            Login
          </Link>
        </>
      }
      {...props}
    />
  )
}
