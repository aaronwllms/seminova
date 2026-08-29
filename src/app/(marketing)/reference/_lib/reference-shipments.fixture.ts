import type { ReferenceShipment, ShipmentStatus } from './reference-shipment'

const CONSIGNEES = [
  'Alderman Freight',
  'Bosun & Kell',
  'Cortabel Logistics',
  'Drayford & Co',
  'Eastgate Carriers',
  'Fenwick Maritime',
  'Gullstrand Lines',
  'Harborlight Transit',
  'Inland Relay Co',
  'Juniper Forwarding',
  'Keelhaul Partners',
  'Lumen Cargo',
  'Meridian Haulage',
  'Northport Trading',
  'Orchard Supply Chain',
  'Pembroke Express',
  'Quayline Brokers',
  'Ridgeway Imports',
  'Summit Distribution',
  'Tidewater Consolidators',
  'Upland Freight',
  'Vantage Logistics',
  'Westmere Shipping',
  'Yarrow Transit',
  'Zephyr Global',
] as const

const ROUTE_PAIRS = [
  ['LIS', 'RTM'],
  ['SIN', 'LAX'],
  ['VLC', 'NYC'],
  ['HAM', 'BOS'],
  ['TYO', 'SEA'],
  ['DXB', 'FRA'],
  ['MEL', 'AKL'],
  ['BCN', 'MIA'],
  ['CPH', 'ORD'],
  ['ICN', 'YVR'],
] as const

const STATUSES: ShipmentStatus[] = ['Cleared', 'Held', 'In transit']

const DEPART_LABELS = [
  '14 Mar',
  '16 Mar',
  '18 Mar',
  '19 Mar',
  '21 Mar',
  '22 Mar',
  '24 Mar',
  '25 Mar',
  '27 Mar',
  '28 Mar',
  '30 Mar',
  '01 Apr',
  '03 Apr',
  '04 Apr',
  '06 Apr',
] as const

const pick = <T>(items: readonly T[], index: number): T => {
  if (items.length === 0) {
    throw new Error('pick: empty list')
  }
  const item = items[index % items.length]
  if (item === undefined) {
    throw new Error('pick: missing index')
  }
  return item
}

export const REFERENCE_SHIPMENTS_FIXTURE: ReferenceShipment[] = Array.from(
  { length: 72 },
  (_, index) => {
    const consignee = pick(CONSIGNEES, index)
    const [origin, destination] = pick(ROUTE_PAIRS, index)

    return {
      id: `shipment-${index + 1}`,
      consignee,
      route: `${origin} → ${destination}`,
      status: pick(STATUSES, index),
      departs: pick(DEPART_LABELS, index),
    }
  },
)
