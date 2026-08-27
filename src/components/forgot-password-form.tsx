'use client'

import { createClient } from '@/supabase/client'
import { EmailOtpRequestCard } from '@/components/email-otp-request-card'
import Link from 'next/link'

export function ForgotPasswordForm(
  props: React.ComponentPropsWithoutRef<'div'>,
) {
  return (
    <EmailOtpRequestCard
      send={async (email) => {
        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        })
        if (error) throw error
      }}
      verify={async (email, token) => {
        const supabase = createClient()
        const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'recovery',
        })
        if (error) throw error

        return '/auth/update-password'
      }}
      title="Reset Your Password"
      successTitle="Complete password reset"
      description="Type in your email and we'll send you a link to reset your password"
      successDescription="Use the link or code from your email"
      successBody={() => (
        <p className="text-muted-foreground text-sm">
          If you registered using your email and password, you will receive a
          password reset email. If you received an email, enter the code below,
          or follow the link instead.
        </p>
      )}
      submitLabel="Send reset email"
      footer={
        <>
          Already have an account?{' '}
          <Link
            href="/auth/login"
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
