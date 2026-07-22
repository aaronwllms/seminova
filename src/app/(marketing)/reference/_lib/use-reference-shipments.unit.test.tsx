import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DATA_TABLE_DEFAULT_PAGE_SIZE } from '@/constants/data-table'

import { filterReferenceShipments } from './reference-shipment-data'
import { REFERENCE_SHIPMENTS_FIXTURE } from './reference-shipments.fixture'

vi.mock('./use-reference-shipments', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('./use-reference-shipments')>()

  return {
    ...actual,
    REFERENCE_SHIPMENTS_FETCH_DELAY_MS: 0,
  }
})

import { useReferenceShipments } from './use-reference-shipments'

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return Wrapper
}

describe('useReferenceShipments', () => {
  it('should return filtered rows for the current query', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const { result } = renderHook(
      () =>
        useReferenceShipments({
          page: 1,
          search: 'Alderman',
          perPage: DATA_TABLE_DEFAULT_PAGE_SIZE,
          sorting: [],
          statuses: [],
        }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.rows.length).toBeGreaterThan(0)
    })

    const expectedRows = filterReferenceShipments(REFERENCE_SHIPMENTS_FIXTURE, {
      search: 'Alderman',
      statuses: [],
    }).slice(0, DATA_TABLE_DEFAULT_PAGE_SIZE)

    expect(result.current.rows).toEqual(expectedRows)
  })

  it('should derive hasNextPage from fixture bounds', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const { result } = renderHook(
      () =>
        useReferenceShipments({
          page: 1,
          search: '',
          perPage: DATA_TABLE_DEFAULT_PAGE_SIZE,
          sorting: [],
          statuses: [],
        }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.rows).toHaveLength(DATA_TABLE_DEFAULT_PAGE_SIZE)
    })

    expect(result.current.hasNextPage).toBe(true)
  })
})
