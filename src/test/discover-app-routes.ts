import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SKIP_DIRS = new Set(['_components', '_lib'])

const isRouteGroup = (segment: string) =>
  segment.startsWith('(') && segment.endsWith(')')

const shouldSkipSegment = (segment: string) =>
  segment.startsWith('_') || SKIP_DIRS.has(segment) || isRouteGroup(segment)

const toUrlPath = (segments: string[]): string => {
  if (segments.length === 0) return '/'
  return `/${segments.join('/')}`
}

/**
 * Discover App Router URL paths from page.tsx and route.ts files under src/app/.
 * Route groups (parenthesized folders) contribute no URL segment.
 */
export const discoverAppRoutes = (appDir: string): string[] => {
  const routes = new Set<string>()

  const walk = (dir: string, segments: string[]) => {
    if (!existsSync(dir)) return

    const hasPage = existsSync(join(dir, 'page.tsx'))
    const hasRoute = existsSync(join(dir, 'route.ts'))

    if (hasPage || hasRoute) {
      routes.add(toUrlPath(segments))
    }

    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry)
      if (!statSync(fullPath).isDirectory()) continue
      if (shouldSkipSegment(entry)) {
        walk(fullPath, segments)
        continue
      }
      walk(fullPath, [...segments, entry])
    }
  }

  walk(appDir, [])
  return [...routes].sort()
}

export const isPublicAppRoute = (pathname: string): boolean =>
  pathname === '/' || pathname.startsWith('/auth/')
