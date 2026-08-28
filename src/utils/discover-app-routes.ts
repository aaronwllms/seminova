import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SKIP_DIRS = new Set(['_components', '_lib'])

const METADATA_IMAGE_BASENAMES = new Set([
  'opengraph-image',
  'twitter-image',
  'icon',
])

const METADATA_IMAGE_EXTENSIONS = new Set([
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.svg',
  '.webp',
])

const isRouteGroup = (segment: string) =>
  segment.startsWith('(') && segment.endsWith(')')

const shouldSkipSegment = (segment: string) =>
  segment.startsWith('_') || SKIP_DIRS.has(segment) || isRouteGroup(segment)

const toUrlPath = (segments: string[]): string => {
  if (segments.length === 0) return '/'
  return `/${segments.join('/')}`
}

const isMetadataImageFile = (filename: string): boolean => {
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex <= 0) return false

  const basename = filename.slice(0, dotIndex)
  const extension = filename.slice(dotIndex)

  return (
    METADATA_IMAGE_BASENAMES.has(basename) &&
    METADATA_IMAGE_EXTENSIONS.has(extension)
  )
}

/** Allowed homes: `(marketing)/`, `auth/`, or a direct child of `src/app/`. */
export const isAllowedMetadataImageHome = (dirSegments: string[]): boolean => {
  if (dirSegments.length === 0) return true
  if (dirSegments.includes('auth')) return true
  if (dirSegments.includes('(marketing)')) return true
  return false
}

export interface DiscoveredMetadataImageFile {
  relativePath: string
  dirSegments: string[]
}

/**
 * Discover App Router metadata image files (`opengraph-image`, `twitter-image`, `icon`)
 * under an app directory tree.
 */
export const discoverMetadataImageFiles = (
  appDir: string,
): DiscoveredMetadataImageFile[] => {
  const files: DiscoveredMetadataImageFile[] = []

  const walk = (dir: string, locationSegments: string[]) => {
    if (!existsSync(dir)) return

    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        if (entry.startsWith('_') || SKIP_DIRS.has(entry)) {
          walk(fullPath, locationSegments)
          continue
        }
        walk(fullPath, [...locationSegments, entry])
        continue
      }

      if (!isMetadataImageFile(entry)) continue

      files.push({
        relativePath: fullPath.slice(appDir.length + 1),
        dirSegments: locationSegments,
      })
    }
  }

  walk(appDir, [])
  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

/**
 * Discover App Router URL paths from page.tsx and route.ts files under a directory.
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

/** Indexable marketing routes under the (marketing) route group. */
export const discoverMarketingRoutes = (appDir: string): string[] =>
  discoverAppRoutes(join(appDir, '(marketing)'))
