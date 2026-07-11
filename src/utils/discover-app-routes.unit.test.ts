/**
 * @vitest-environment node
 */
import { join } from 'node:path'
import {
  discoverAppRoutes,
  discoverMarketingRoutes,
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
