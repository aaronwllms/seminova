import { updateSession } from '@/supabase/proxy'
import { type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

// Keep in sync with PROXY_MATCHER_PATTERN in src/utils/proxy-matcher.ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|opengraph-image$|.*\\/opengraph-image$|twitter-image$|.*\\/twitter-image$).*)',
  ],
}
