import { updateSession } from '@/supabase/proxy'
import { type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - Next.js metadata images - /opengraph-image, /twitter-image, /icon (and nested),
     *   plus optional 5–6 char route-group hash suffix (see proxy-matcher.ts)
     *
     * Must be a string literal — Next.js statically analyzes matcher entries.
     * Hash suffix groups must be non-capturing (`(?:...)`) — capturing groups
     * fail `next build`. Canonical pattern + tests: src/utils/proxy-matcher.ts
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|opengraph-image(?:-[0-9a-z]{5,6})?$|.*\\/opengraph-image(?:-[0-9a-z]{5,6})?$|twitter-image(?:-[0-9a-z]{5,6})?$|.*\\/twitter-image(?:-[0-9a-z]{5,6})?$|icon(?:-[0-9a-z]{5,6})?$|.*\\/icon(?:-[0-9a-z]{5,6})?$).*)',
  ],
}
