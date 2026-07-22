'use client'

import type { SortingState } from '@tanstack/react-table'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { filterReferenceShipments } from './reference-shipment-data'
import { REFERENCE_SHIPMENTS_FIXTURE } from './reference-shipments.fixture'
import type { ReferenceShipment, ShipmentStatus } from './reference-shipment'
import { referenceShipmentsQueryKeys } from './reference-shipments-query-keys'

export const REFERENCE_SHIPMENTS_FETCH_DELAY_MS = 400

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
  statuses: ShipmentStatus[]
}

export const useReferenceShipments = ({
  page,
  search,
  perPage,
  sorting,
  statuses,
}: UseReferenceShipmentsOptions) => {
  const query = useQuery({
    queryKey: referenceShipmentsQueryKeys.list({
      page,
      search,
      perPage,
      sorting,
      statuses,
    }),
    queryFn: async () => {
      await new Promise((resolve) => {
        window.setTimeout(resolve, REFERENCE_SHIPMENTS_FETCH_DELAY_MS)
      })

      const filtered = filterReferenceShipments(REFERENCE_SHIPMENTS_FIXTURE, {
        search,
        statuses,
      })
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
