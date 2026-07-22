import type { SortingState } from '@tanstack/react-table'

import type { ShipmentStatus } from './reference-shipment'

export const referenceShipmentsQueryKeys = {
  all: ['reference-shipments'] as const,
  stats: () => [...referenceShipmentsQueryKeys.all, 'stats'] as const,
  list: (params: {
    page: number
    search: string
    perPage: number
    sorting: SortingState
    statuses: ShipmentStatus[]
  }) => [...referenceShipmentsQueryKeys.all, 'list', params] as const,
}
