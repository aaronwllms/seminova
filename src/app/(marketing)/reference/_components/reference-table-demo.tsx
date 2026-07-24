'use client'

// Showroom fixture over static sample data — not production admin behavior.
// Client-side sort + pagination is the sanctioned exception (no server to page against; see data-tables.mdc).
// Search debounce uses the shared useDebouncedValue hook from Epic 1.

import type { SortingState } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'

import {
  DataTableShell,
  useDataTableShell,
} from '@/components/data-table-shell'
import { DataTablePaginationControls } from '@/components/data-table-pagination-controls'
import { TableFetchDimWrapper } from '@/components/table-fetch-dim-wrapper'
import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
  type DataTablePageSize,
} from '@/constants/data-table'
import { useToggleFilterSet } from '@/hooks/use-toggle-filter-set'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

import {
  hasActiveReferenceListFilters,
  type ReferenceListFilters,
} from '../_lib/reference-list-filters'
import type { ShipmentStatus } from '../_lib/reference-shipment'
import { useReferenceShipmentStats } from '../_lib/use-reference-shipment-stats'
import { useReferenceShipmentsRefresh } from '../_lib/use-reference-shipments-refresh'
import { useReferenceShipments } from '../_lib/use-reference-shipments'

import { ReferenceFilteredEmptyState } from './reference-filtered-empty-state'
import { referenceShipmentsColumns } from './reference-shipments-columns'
import { ReferenceStatTiles } from './reference-stat-tiles'
import { ReferenceToolbar } from './reference-toolbar'

export const ReferenceTableDemo = () => {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<DataTablePageSize>(
    DATA_TABLE_DEFAULT_PAGE_SIZE,
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [trackedDebouncedSearch, setTrackedDebouncedSearch] =
    useState(debouncedSearch)
  const {
    activeValues: selectedStatusSet,
    toggle: toggleStatus,
    clearAll: clearStatusFilters,
  } = useToggleFilterSet<ShipmentStatus>()

  const selectedStatuses = useMemo(
    () => [...selectedStatusSet],
    [selectedStatusSet],
  )

  const appliedSearch = debouncedSearch.trim() || null

  const filters: ReferenceListFilters = useMemo(
    () => ({
      statuses: selectedStatuses,
      search: appliedSearch,
    }),
    [appliedSearch, selectedStatuses],
  )

  if (trackedDebouncedSearch !== debouncedSearch) {
    setTrackedDebouncedSearch(debouncedSearch)
    setPage(1)
  }

  const { refresh, isRefreshing } = useReferenceShipmentsRefresh()
  const { stats, isLoading: isStatsLoading } = useReferenceShipmentStats()
  const { rows, hasNextPage, isLoading, isFetching } = useReferenceShipments({
    page,
    search: debouncedSearch.trim(),
    perPage,
    sorting,
    statuses: selectedStatuses,
  })

  const handleSortingChange = useCallback((next: SortingState) => {
    setSorting(next)
    setPage(1)
  }, [])

  const handlePageSizeChange = useCallback((nextPageSize: number) => {
    setPerPage(nextPageSize as DataTablePageSize)
    setPage(1)
  }, [])

  const handleResetFilters = useCallback(() => {
    clearStatusFilters()
    setSearchInput('')
    setPage(1)
  }, [clearStatusFilters])

  const handleRemoveFilterChip = useCallback(
    (id: string) => {
      switch (id) {
        case 'Cleared':
        case 'Held':
        case 'In transit':
          if (selectedStatusSet.has(id)) {
            toggleStatus(id)
            setPage(1)
          }
          break
        case 'search':
          setSearchInput('')
          setPage(1)
          break
      }
    },
    [selectedStatusSet, toggleStatus],
  )

  const handleStatusToggle = useCallback(
    (status: ShipmentStatus) => {
      toggleStatus(status)
      setPage(1)
    },
    [toggleStatus],
  )

  const { table } = useDataTableShell({
    data: rows,
    columns: referenceShipmentsColumns,
    getRowId: (row) => row.id,
    manualSorting: true,
    sorting,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      handleSortingChange(next)
    },
  })

  const showFilteredEmptyState =
    !isLoading && rows.length === 0 && hasActiveReferenceListFilters(filters)

  return (
    <div className="mx-auto mt-5 max-w-6xl px-4 sm:px-0">
      <div className="flex flex-col gap-4">
        <ReferenceStatTiles
          stats={stats}
          isFullyUnfiltered={!hasActiveReferenceListFilters(filters)}
          selectedStatuses={selectedStatuses}
          isLoading={isStatsLoading}
          onTotalClick={handleResetFilters}
          onStatusToggle={handleStatusToggle}
        />

        <ReferenceToolbar
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          filters={filters}
          onRemoveFilter={handleRemoveFilterChip}
          onClearAllFilters={handleResetFilters}
          onRefresh={() => {
            void refresh()
          }}
          isRefreshing={isRefreshing}
        />

        <TableFetchDimWrapper
          isFetching={isFetching}
          hasStaleRows={rows.length > 0}
        >
          <DataTableShell
            table={table}
            columns={referenceShipmentsColumns}
            isLoading={isLoading && rows.length === 0}
            loadingLabel="Loading shipments…"
            emptyMessage="No shipments found."
            emptyContent={
              showFilteredEmptyState ? (
                <ReferenceFilteredEmptyState
                  onResetFilters={handleResetFilters}
                  onRefresh={() => {
                    void refresh()
                  }}
                  isRefreshing={isRefreshing}
                />
              ) : undefined
            }
          />
        </TableFetchDimWrapper>

        <DataTablePaginationControls
          page={page}
          hasNextPage={hasNextPage}
          isPending={isFetching}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
          pageSize={perPage}
          pageSizeOptions={DATA_TABLE_PAGE_SIZE_OPTIONS}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  )
}
