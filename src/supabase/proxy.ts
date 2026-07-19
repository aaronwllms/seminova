import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  APP_HOME,
  CLIENT_LOGS_RELAY_PATH,
  PRIVACY_PATH,
  REFERENCE_PATH,
  TERMS_PATH,
  WORKFLOW_PATH,
} from '@/constants/app-paths'
import { getPublicSupabaseEnv, hasPublicSupabaseEnv } from '@/utils/env'
import { isAdmin } from '@/utils/admin'
import { appLog } from '@/utils/app-logger'
import { REQUEST_PATHNAME_LOG_HEADER } from '@/constants/request-log-context'
import { buildLoginRedirectUrl } from '@/utils/build-login-redirect-url'
import { withPathnameLogContext } from '@/utils/request-log-context'
import { parseAuthenticatedClaims } from '@/supabase/require-auth'

const MISSING_SUPABASE_ENV_MESSAGE =
  'Supabase environment variables are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY before deploying to production.'

function redirectWithAuthCookies(
  url: string | URL,
  supabaseResponse: NextResponse,
) {
  const redirectResponse = NextResponse.redirect(url)

  for (const { name, value } of supabaseResponse.cookies.getAll()) {
    redirectResponse.cookies.set(name, value)
  }

  return redirectResponse
}

const createForwardedResponse = (
  request: NextRequest,
  pathname: string,
): NextResponse => {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(REQUEST_PATHNAME_LOG_HEADER, pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export async function updateSession(request: NextRequest) {
  const rawPathname = request.nextUrl.pathname
  const pathname =
    rawPathname.length > 1 && rawPathname.endsWith('/')
      ? rawPathname.slice(0, -1)
      : rawPathname

  let supabaseResponse = createForwardedResponse(request, pathname)

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname === TERMS_PATH ||
    pathname === PRIVACY_PATH ||
    pathname === REFERENCE_PATH ||
    pathname === WORKFLOW_PATH ||
    pathname === CLIENT_LOGS_RELAY_PATH

  if (!hasPublicSupabaseEnv) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse(MISSING_SUPABASE_ENV_MESSAGE, { status: 503 })
    }

    if (!isPublicRoute) {
      return new NextResponse(MISSING_SUPABASE_ENV_MESSAGE, { status: 503 })
    }

    return supabaseResponse
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  let authCookiesUpdated = false

  const { supabaseUrl, publishableKey } = getPublicSupabaseEnv()
  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        authCookiesUpdated = true
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        supabaseResponse = createForwardedResponse(request, pathname)
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
  const sessionClaims =
    data?.claims !== undefined ? parseAuthenticatedClaims(data.claims) : null

  const clearLocalSession = async () => {
    await supabase.auth.signOut({ scope: 'local' })
  }

  if (!isPublicRoute && (error || !sessionClaims)) {
    if (error) {
      appLog.error(
        'proxy',
        'Session invalid on protected route',
        withPathnameLogContext(pathname, error),
      )
    }

    await clearLocalSession()

    const hasStrayAuthCode = request.nextUrl.searchParams.has('code')

    if (hasStrayAuthCode) {
      appLog.error(
        'proxy',
        'Stray auth code on protected route — email templates likely not routed through /auth/confirm',
        { pathname },
      )

      const errorUrl = new URL('/auth/error', request.url)
      errorUrl.searchParams.set('source', 'stray_code')
      return redirectWithAuthCookies(errorUrl, supabaseResponse)
    }

    const intendedPath = `${pathname}${request.nextUrl.search}`
    const loginUrl = buildLoginRedirectUrl(intendedPath, request.url)
    return redirectWithAuthCookies(loginUrl, supabaseResponse)
  }

  if (isPublicRoute && error) {
    appLog.error(
      'proxy',
      'Clearing stale session on public route',
      withPathnameLogContext(pathname, error),
    )
    await clearLocalSession()
  }

  const { pathname: adminPathname } = request.nextUrl
  const isAdminPath =
    adminPathname === '/admin' || adminPathname.startsWith('/admin/')

  if (isAdminPath && sessionClaims && !isAdmin(sessionClaims)) {
    const url = request.nextUrl.clone()
    url.pathname = APP_HOME
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

  if (!isPublicRoute && sessionClaims) {
    appLog.debug(
      'proxy',
      authCookiesUpdated ? 'Session token refreshed' : 'Session token reused',
      { pathname, refreshed: authCookiesUpdated },
    )
  }

  return supabaseResponse
}
