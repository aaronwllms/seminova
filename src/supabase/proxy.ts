import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { LOGIN_PATH, PROFILE_PATH } from '@/constants/app-paths'
import { getPublicSupabaseEnv, hasPublicSupabaseEnv } from '@/utils/env'
import { isAdmin, type JwtClaims } from '@/utils/admin'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const isPublicRoute =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/auth')

  if (!hasPublicSupabaseEnv) {
    if (process.env.NODE_ENV === 'production' && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = LOGIN_PATH
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const { supabaseUrl, publishableKey } = getPublicSupabaseEnv()
  const supabase = createServerClient(supabaseUrl, publishableKey, {
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
  })

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data, error } = await supabase.auth.getClaims()
  const user = data?.claims

  const clearLocalSession = async () => {
    await supabase.auth.signOut({ scope: 'local' })
  }

  if (!isPublicRoute && (error || !user)) {
    if (error) {
      console.error('[proxy] Session invalid on protected route', error)
    }

    await clearLocalSession()

    const url = request.nextUrl.clone()
    url.pathname = LOGIN_PATH
    const redirectResponse = NextResponse.redirect(url)

    for (const { name, value } of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(name, value)
    }

    return redirectResponse
  }

  if (isPublicRoute && error) {
    console.error('[proxy] Clearing stale session on public route', error)
    await clearLocalSession()
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
