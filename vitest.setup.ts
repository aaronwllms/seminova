import { QueryCache } from '@tanstack/react-query'
import '@testing-library/jest-dom/vitest'

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
