'use client'

import { useQuery } from '@tanstack/react-query'

import {
  REFERENCE_SHIPMENT_STATS,
  type ReferenceShipmentStats,
} from './reference-shipment-data'
import { referenceShipmentsQueryKeys } from './reference-shipments-query-keys'
import { REFERENCE_SHIPMENTS_FETCH_DELAY_MS } from './use-reference-shipments'

export const useReferenceShipmentStats = () => {
  const query = useQuery({
    queryKey: referenceShipmentsQueryKeys.stats(),
    queryFn: async (): Promise<ReferenceShipmentStats> => {
      await new Promise((resolve) => {
        window.setTimeout(resolve, REFERENCE_SHIPMENTS_FETCH_DELAY_MS)
      })

      return REFERENCE_SHIPMENT_STATS
    },
  })

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
  }
}
