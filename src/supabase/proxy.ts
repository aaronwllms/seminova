import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { LOGIN_PATH, PROFILE_PATH } from '@/constants/app-paths'
import { hasEnvVars } from '@/utils/env'
import { isAdmin, type JwtClaims } from '@/utils/admin'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data, error } = await supabase.auth.getClaims()
  const user = data?.claims

  const isPublicRoute =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/auth')

  if (!isPublicRoute && (error || !user)) {
    if (error) {
      console.error('[proxy] Session invalid on protected route', error)
    }

    await supabase.auth.signOut()

    const url = request.nextUrl.clone()
    url.pathname = LOGIN_PATH
    const redirectResponse = NextResponse.redirect(url)

    for (const { name, value } of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(name, value)
    }

    return redirectResponse
  }

  const { pathname } = request.nextUrl
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/')

  if (isAdminPath && user && !isAdmin(user as JwtClaims)) {
    const url = request.nextUrl.clone()
    url.pathname = PROFILE_PATH
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
