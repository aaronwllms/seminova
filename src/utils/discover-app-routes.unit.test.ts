/**
 * @vitest-environment node
 */
import { join } from 'node:path'
import {
  discoverAppRoutes,
  discoverMarketingRoutes,
  discoverMetadataImageFiles,
  isAllowedMetadataImageHome,
} from './discover-app-routes'

describe('discoverAppRoutes', () => {
  const appDir = join(process.cwd(), 'src/app')

  it('should discover routes from src/app', () => {
    const routes = discoverAppRoutes(appDir)

    expect(routes.length).toBeGreaterThan(0)
    expect(routes).toContain('/')
    expect(routes).toContain('/home')
    expect(routes).not.toContain('/profile')
    expect(routes).toContain('/admin')
    expect(routes).toContain('/auth/login')
  })
})

describe('discoverMarketingRoutes', () => {
  const appDir = join(process.cwd(), 'src/app')

  it('should discover only marketing route group pages', () => {
    const allRoutes = discoverAppRoutes(appDir)
    const marketingRoutes = discoverMarketingRoutes(appDir)

    expect(marketingRoutes).toContain('/')
    expect(marketingRoutes.every((route) => allRoutes.includes(route))).toBe(
      true,
    )
    expect(
      marketingRoutes.some(
        (route) =>
          route.startsWith('/auth') ||
          route.startsWith('/admin') ||
          route === '/home',
      ),
    ).toBe(false)
  })
})

describe('discoverMetadataImageFiles', () => {
  const appDir = join(process.cwd(), 'src/app')

  it('should discover metadata image files from src/app', () => {
    const files = discoverMetadataImageFiles(appDir)

    expect(files.length).toBeGreaterThan(0)
    expect(
      files.some((file) => file.relativePath === 'opengraph-image.tsx'),
    ).toBe(true)
    expect(
      files.some(
        (file) =>
          file.relativePath === '(marketing)/features/opengraph-image.tsx',
      ),
    ).toBe(true)
  })

  it('should allow only marketing, auth, or app-root metadata image homes', () => {
    const files = discoverMetadataImageFiles(appDir)

    expect(
      files.every((file) => isAllowedMetadataImageHome(file.dirSegments)),
    ).toBe(true)
  })
})
