'use client'

import { useQuery } from '@tanstack/react-query'
import type { SortingState } from '@tanstack/react-table'

import {
  REFERENCE_SHIPMENTS_PAGE_SIZE,
  SEARCHABLE_COLUMN,
  type ReferenceShipment,
} from './reference-shipment'
import { REFERENCE_SHIPMENTS_FIXTURE } from './reference-shipments.fixture'

export const REFERENCE_SHIPMENTS_QUERY_KEY = 'reference-shipments' as const

export const REFERENCE_SHIPMENTS_FETCH_DELAY_MS = 400

const sortShipments = (
  rows: ReferenceShipment[],
  sorting: SortingState,
): ReferenceShipment[] => {
  if (sorting.length === 0) {
    return rows
  }

  const [{ id, desc }] = sorting

  return [...rows].sort((left, right) => {
    const leftValue = left[id as keyof ReferenceShipment]
    const rightValue = right[id as keyof ReferenceShipment]

    if (typeof leftValue !== 'string' || typeof rightValue !== 'string') {
      return 0
    }

    const comparison = leftValue.localeCompare(rightValue, undefined, {
      sensitivity: 'base',
    })

    return desc ? -comparison : comparison
  })
}

const filterShipments = (
  rows: ReferenceShipment[],
  search: string,
): ReferenceShipment[] => {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) {
    return rows
  }

  return rows.filter((row) =>
    row[SEARCHABLE_COLUMN].toLowerCase().includes(normalizedSearch),
  )
}

const paginateShipments = (
  rows: ReferenceShipment[],
  page: number,
): { rows: ReferenceShipment[]; hasNextPage: boolean } => {
  const start = (page - 1) * REFERENCE_SHIPMENTS_PAGE_SIZE
  const end = start + REFERENCE_SHIPMENTS_PAGE_SIZE

  return {
    rows: rows.slice(start, end),
    hasNextPage: end < rows.length,
  }
}

type UseReferenceShipmentsOptions = {
  page: number
  search: string
  sorting: SortingState
}

export const useReferenceShipments = ({
  page,
  search,
  sorting,
}: UseReferenceShipmentsOptions) => {
  const query = useQuery({
    queryKey: [REFERENCE_SHIPMENTS_QUERY_KEY, search, page, sorting],
    queryFn: async () => {
      await new Promise((resolve) => {
        window.setTimeout(resolve, REFERENCE_SHIPMENTS_FETCH_DELAY_MS)
      })

      const filtered = filterShipments(REFERENCE_SHIPMENTS_FIXTURE, search)
      const sorted = sortShipments(filtered, sorting)
      return paginateShipments(sorted, page)
    },
  })

  return {
    rows: query.data?.rows ?? [],
    hasNextPage: query.data?.hasNextPage ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}
