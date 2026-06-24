import { createClient } from '@/supabase/server'
import { getPostAuthRedirectPath, type AppMetadata } from '@/utils/admin'
import { isSafeRedirect } from '@/utils/is-safe-redirect'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next')

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const fallback = getPostAuthRedirectPath(
        user?.app_metadata as AppMetadata,
      )
      const destination =
        next && isSafeRedirect(next, request.url) ? next : fallback
      redirect(destination)
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`)
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`)
}
