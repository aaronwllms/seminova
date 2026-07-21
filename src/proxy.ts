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
     * - Next.js metadata images - /opengraph-image, /twitter-image, /icon (and nested)
     *
     * Must be a string literal — Next.js statically analyzes matcher entries.
     * Canonical pattern + tests: src/utils/proxy-matcher.ts
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|opengraph-image$|.*\\/opengraph-image$|twitter-image$|.*\\/twitter-image$|icon$|.*\\/icon$).*)',
  ],
}
