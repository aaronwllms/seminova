import { server } from '@/mocks/server'
import { QueryCache } from '@tanstack/react-query'
import '@testing-library/jest-dom/vitest'

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

beforeAll(() => server.listen())

afterEach(() => {
  server.resetHandlers()
  queryCache.clear()
})

afterAll(() => server.close())
