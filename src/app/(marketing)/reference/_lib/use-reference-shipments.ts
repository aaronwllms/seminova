'use client'

import type { SortingState } from '@tanstack/react-table'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { SEARCHABLE_COLUMN, type ReferenceShipment } from './reference-shipment'
import { REFERENCE_SHIPMENTS_FIXTURE } from './reference-shipments.fixture'

export const REFERENCE_SHIPMENTS_QUERY_KEY = 'reference-shipments' as const

export const REFERENCE_SHIPMENTS_FETCH_DELAY_MS = 400

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

type ReferenceSortColumn = keyof Pick<
  ReferenceShipment,
  'consignee' | 'route' | 'status' | 'departs'
>

const isReferenceSortColumn = (
  columnId: string,
): columnId is ReferenceSortColumn =>
  columnId === 'consignee' ||
  columnId === 'route' ||
  columnId === 'status' ||
  columnId === 'departs'

export const sortReferenceShipments = (
  rows: ReferenceShipment[],
  sorting: SortingState,
): ReferenceShipment[] => {
  const activeSort = sorting[0]

  if (!activeSort || !isReferenceSortColumn(activeSort.id)) {
    return rows
  }

  const directionMultiplier = activeSort.desc ? -1 : 1

  const sortColumn: ReferenceSortColumn = activeSort.id

  return [...rows].sort((left, right) => {
    const leftValue = String(left[sortColumn])
    const rightValue = String(right[sortColumn])

    return (
      directionMultiplier *
      leftValue.localeCompare(rightValue, undefined, {
        sensitivity: 'base',
      })
    )
  })
}

const paginateShipments = (
  rows: ReferenceShipment[],
  page: number,
  perPage: number,
): { rows: ReferenceShipment[]; hasNextPage: boolean } => {
  const start = (page - 1) * perPage
  const end = start + perPage

  return {
    rows: rows.slice(start, end),
    hasNextPage: end < rows.length,
  }
}

type UseReferenceShipmentsOptions = {
  page: number
  search: string
  perPage: number
  sorting: SortingState
}

export const useReferenceShipments = ({
  page,
  search,
  perPage,
  sorting,
}: UseReferenceShipmentsOptions) => {
  const query = useQuery({
    queryKey: [REFERENCE_SHIPMENTS_QUERY_KEY, search, page, perPage, sorting],
    queryFn: async () => {
      await new Promise((resolve) => {
        window.setTimeout(resolve, REFERENCE_SHIPMENTS_FETCH_DELAY_MS)
      })

      const filtered = filterShipments(REFERENCE_SHIPMENTS_FIXTURE, search)
      const sorted = sortReferenceShipments(filtered, sorting)
      return paginateShipments(sorted, page, perPage)
    },
    placeholderData: keepPreviousData,
  })

  return {
    rows: query.data?.rows ?? [],
    hasNextPage: query.data?.hasNextPage ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}
