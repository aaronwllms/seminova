import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { DATA_TABLE_DEFAULT_PAGE_SIZE } from '@/constants/data-table'

import { SEARCHABLE_COLUMN } from './reference-shipment'
import { filterReferenceShipments } from './reference-shipment-data'
import { REFERENCE_SHIPMENTS_FIXTURE } from './reference-shipments.fixture'
import {
  sortReferenceShipments,
  useReferenceShipments,
} from './use-reference-shipments'

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
          perPage: DATA_TABLE_DEFAULT_PAGE_SIZE,
          sorting: [],
          statuses: [],
        }),
      { wrapper: createWrapper(queryClient) },
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.rows).toEqual([])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
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
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rows).toHaveLength(DATA_TABLE_DEFAULT_PAGE_SIZE)
    expect(result.current.hasNextPage).toBe(true)
  })

  it('should clear hasNextPage on the final page', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const lastPage = Math.ceil(
      REFERENCE_SHIPMENTS_FIXTURE.length / DATA_TABLE_DEFAULT_PAGE_SIZE,
    )

    const { result } = renderHook(
      () =>
        useReferenceShipments({
          page: lastPage,
          search: '',
          perPage: DATA_TABLE_DEFAULT_PAGE_SIZE,
          sorting: [],
          statuses: [],
        }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasNextPage).toBe(false)
  })

  it('should sort the full fixture before paginating', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const perPage = 10

    const { result } = renderHook(
      () =>
        useReferenceShipments({
          page: 1,
          search: '',
          perPage,
          sorting: [{ id: 'consignee', desc: true }],
          statuses: [],
        }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const expectedFirstPage = sortReferenceShipments(
      REFERENCE_SHIPMENTS_FIXTURE,
      [{ id: 'consignee', desc: true }],
    ).slice(0, perPage)

    expect(result.current.rows).toEqual(expectedFirstPage)
    expect(result.current.rows[0]?.consignee).toBe('Zephyr Global')
  })

  it('should paginate using the selected page size', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const { result } = renderHook(
      () =>
        useReferenceShipments({
          page: 1,
          search: '',
          perPage: 25,
          sorting: [],
          statuses: [],
        }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rows).toHaveLength(25)
    expect(result.current.hasNextPage).toBe(true)
  })

  it('should apply status tile filters before paginating', async () => {
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
          statuses: ['Held'],
        }),
      { wrapper: createWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rows.every((row) => row.status === 'Held')).toBe(true)
    expect(result.current.rows[0]?.[SEARCHABLE_COLUMN]).toBeDefined()
  })
})
