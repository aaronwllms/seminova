import { QueryCache } from '@tanstack/react-query'
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('@/utils/app-logger', () => ({
  appLog: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

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
