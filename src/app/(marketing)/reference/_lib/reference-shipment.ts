export const SHIPMENT_STATUSES = ['Cleared', 'Held', 'In transit'] as const

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number]

export const SEARCHABLE_COLUMN = 'consignee' as const

export type ReferenceShipment = {
  id: string
  consignee: string
  route: string
  status: ShipmentStatus
  departs: string
}
