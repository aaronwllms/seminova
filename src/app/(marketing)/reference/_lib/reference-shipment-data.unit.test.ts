import { describe, expect, it } from 'vitest'

import { SEARCHABLE_COLUMN } from './reference-shipment'
import { REFERENCE_SHIPMENTS_FIXTURE } from './reference-shipments.fixture'
import {
  computeReferenceShipmentStats,
  filterReferenceShipments,
} from './reference-shipment-data'

describe('reference-shipment-data', () => {
  it('should compute global stats from the full fixture', () => {
    const stats = computeReferenceShipmentStats(REFERENCE_SHIPMENTS_FIXTURE)

    expect(stats.total).toBe(REFERENCE_SHIPMENTS_FIXTURE.length)
    expect(stats.cleared + stats.held + stats.inTransit).toBe(stats.total)
  })

  it('should filter by status with OR semantics', () => {
    const filtered = filterReferenceShipments(REFERENCE_SHIPMENTS_FIXTURE, {
      search: '',
      statuses: ['Cleared', 'Held'],
    })

    expect(
      filtered.every(
        (row) => row.status === 'Cleared' || row.status === 'Held',
      ),
    ).toBe(true)
    expect(filtered.length).toBeGreaterThan(0)
  })

  it('should compose status filters with consignee search', () => {
    const filtered = filterReferenceShipments(REFERENCE_SHIPMENTS_FIXTURE, {
      search: 'Gullstrand',
      statuses: ['In transit'],
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.[SEARCHABLE_COLUMN]).toBe('Gullstrand Lines')
    expect(filtered[0]?.status).toBe('In transit')
  })
})
