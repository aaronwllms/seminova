'use client'

import { StatTile } from '@/components/stat-tile'
import { Skeleton } from '@/components/ui/skeleton'

import type { ReferenceShipmentStats } from '../_lib/reference-shipment-data'
import type { ShipmentStatus } from '../_lib/reference-shipment'

interface ReferenceStatTilesProps {
  stats: ReferenceShipmentStats | null
  isFullyUnfiltered: boolean
  selectedStatuses: ShipmentStatus[]
  isLoading: boolean
  onTotalClick: () => void
  onStatusToggle: (status: ShipmentStatus) => void
}

export const ReferenceStatTiles = ({
  stats,
  isFullyUnfiltered,
  selectedStatuses,
  isLoading,
  onTotalClick,
  onStatusToggle,
}: ReferenceStatTilesProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[3.625rem] rounded-xl" />
        ))}
      </div>
    )
  }

  const counts = stats ?? {
    total: 0,
    cleared: 0,
    held: 0,
    inTransit: 0,
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <StatTile
        label="Total"
        count={counts.total}
        role="total"
        selected={isFullyUnfiltered}
        tooltip="Clear all filters"
        onClick={onTotalClick}
      />
      <StatTile
        label="Cleared"
        count={counts.cleared}
        role="total"
        selected={selectedStatuses.includes('Cleared')}
        tooltip="Show cleared shipments only"
        onClick={() => onStatusToggle('Cleared')}
      />
      <StatTile
        label="Held"
        count={counts.held}
        role="total"
        selected={selectedStatuses.includes('Held')}
        tooltip="Show held shipments only"
        onClick={() => onStatusToggle('Held')}
      />
      <StatTile
        label="In transit"
        count={counts.inTransit}
        role="total"
        selected={selectedStatuses.includes('In transit')}
        tooltip="Show in-transit shipments only"
        onClick={() => onStatusToggle('In transit')}
      />
    </div>
  )
}
