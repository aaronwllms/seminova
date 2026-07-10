import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import {
  REFERENCE_SHIPMENTS_PAGE_SIZE,
  SEARCHABLE_COLUMN,
} from './reference-shipment'
import { REFERENCE_SHIPMENTS_FIXTURE } from './reference-shipments.fixture'
import { useReferenceShipments } from './use-reference-shipments'

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return Wrapper
}

describe('useReferenceShipments', () => {
  it('should return filtered rows after the artificial delay', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const { result } = renderHook(
      () =>
        useReferenceShipments({
          page: 1,
          search: 'Alderman',
          sorting: [],
        }),
      { wrapper: createWrapper(queryClient) },
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.rows).toEqual([])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const expectedRows = REFERENCE_SHIPMENTS_FIXTURE.filter((row) =>
      row[SEARCHABLE_COLUMN].toLowerCase().includes('alderman'),
    ).slice(0, REFERENCE_SHIPMENTS_PAGE_SIZE)

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
          sorting: [],
        }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rows).toHaveLength(REFERENCE_SHIPMENTS_PAGE_SIZE)
    expect(result.current.hasNextPage).toBe(true)
  })

  it('should clear hasNextPage on the final page', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const lastPage = Math.ceil(
      REFERENCE_SHIPMENTS_FIXTURE.length / REFERENCE_SHIPMENTS_PAGE_SIZE,
    )

    const { result } = renderHook(
      () =>
        useReferenceShipments({
          page: lastPage,
          search: '',
          sorting: [],
        }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasNextPage).toBe(false)
  })
})
