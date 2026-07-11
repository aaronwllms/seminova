'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { USERS_PAGE_SIZE } from '@/app/admin/users/_lib/admin-user-row'

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

const paginateShipments = (
  rows: ReferenceShipment[],
  page: number,
): { rows: ReferenceShipment[]; hasNextPage: boolean } => {
  const start = (page - 1) * USERS_PAGE_SIZE
  const end = start + USERS_PAGE_SIZE

  return {
    rows: rows.slice(start, end),
    hasNextPage: end < rows.length,
  }
}

type UseReferenceShipmentsOptions = {
  page: number
  search: string
}

export const useReferenceShipments = ({
  page,
  search,
}: UseReferenceShipmentsOptions) => {
  const query = useQuery({
    queryKey: [REFERENCE_SHIPMENTS_QUERY_KEY, search, page],
    queryFn: async () => {
      await new Promise((resolve) => {
        window.setTimeout(resolve, REFERENCE_SHIPMENTS_FETCH_DELAY_MS)
      })

      const filtered = filterShipments(REFERENCE_SHIPMENTS_FIXTURE, search)
      return paginateShipments(filtered, page)
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
