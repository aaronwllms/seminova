import {
  SEARCHABLE_COLUMN,
  type ReferenceShipment,
  type ShipmentStatus,
} from './reference-shipment'
import { REFERENCE_SHIPMENTS_FIXTURE } from './reference-shipments.fixture'

export interface ReferenceShipmentStats {
  total: number
  cleared: number
  held: number
  inTransit: number
}

export const computeReferenceShipmentStats = (
  rows: ReferenceShipment[],
): ReferenceShipmentStats => ({
  total: rows.length,
  cleared: rows.filter((row) => row.status === 'Cleared').length,
  held: rows.filter((row) => row.status === 'Held').length,
  inTransit: rows.filter((row) => row.status === 'In transit').length,
})

export const REFERENCE_SHIPMENT_STATS = computeReferenceShipmentStats(
  REFERENCE_SHIPMENTS_FIXTURE,
)

export const filterReferenceShipments = (
  rows: ReferenceShipment[],
  {
    search,
    statuses,
  }: {
    search: string
    statuses: ShipmentStatus[]
  },
): ReferenceShipment[] => {
  let result = rows

  if (statuses.length > 0) {
    result = result.filter((row) => statuses.includes(row.status))
  }

  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) {
    return result
  }

  return result.filter((row) =>
    row[SEARCHABLE_COLUMN].toLowerCase().includes(normalizedSearch),
  )
}
