import { QueryCache } from '@tanstack/react-query'
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>()

  return {
    ...actual,
    unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
  }
})

vi.mock('@/utils/app-settings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/app-settings')>()
  const { APP_SETTINGS_REGISTRY } =
    await import('@/config/app-settings-registry')

  const registryDefaults = Object.fromEntries(
    APP_SETTINGS_REGISTRY.map((entry) => [entry.key, entry.default]),
  )

  return {
    ...actual,
    getAppSetting: vi.fn(
      async (key: keyof typeof registryDefaults) => registryDefaults[key],
    ),
  }
})

vi.mock('@/utils/persist-app-log', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/utils/persist-app-log')>()

  return {
    ...actual,
    persistAppLogRow: vi.fn().mockResolvedValue(undefined),
  }
})

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()

  return {
    ...actual,
    after: (callback: () => void | Promise<void>) => {
      void Promise.resolve(callback())
    },
  }
})

// MSW global setup is deferred until a real HTTP boundary needs it.
// Supabase/auth boundaries use vi.mock at module level per testing.mdc.

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

const queryCache = new QueryCache()

afterEach(() => {
  queryCache.clear()
})
