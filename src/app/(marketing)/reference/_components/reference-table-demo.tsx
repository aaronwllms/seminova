'use client'

import type { SortingState } from '@tanstack/react-table'
import { useCallback, useEffect, useState } from 'react'

import {
  DataTableShell,
  useDataTableShell,
} from '@/components/data-table-shell'
import { DataTablePaginationControls } from '@/components/data-table-pagination-controls'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  DATA_TABLE_DEFAULT_PAGE_SIZE,
  DATA_TABLE_PAGE_SIZE_OPTIONS,
} from '@/constants/data-table'

import { useReferenceShipments } from '../_lib/use-reference-shipments'
import { referenceShipmentsColumns } from './reference-shipments-columns'

const SEARCH_DEBOUNCE_MS = 300

export const ReferenceTableDemo = () => {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DATA_TABLE_DEFAULT_PAGE_SIZE)
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { rows, hasNextPage, isLoading, isFetching } = useReferenceShipments({
    page,
    search: debouncedSearch,
    perPage,
    sorting,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  const handleSortingChange = useCallback((next: SortingState) => {
    setSorting(next)
    setPage(1)
  }, [])

  const handlePageSizeChange = useCallback((nextPageSize: number) => {
    setPerPage(nextPageSize)
    setPage(1)
  }, [])

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

  return (
    <div className="mx-auto mt-5 max-w-6xl px-4 sm:px-0">
      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="border-b p-3">
          <Label htmlFor="reference-shipments-search" className="sr-only">
            Search shipments
          </Label>
          <Input
            id="reference-shipments-search"
            type="search"
            placeholder="Search shipments"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        <div aria-busy={isFetching}>
          <DataTableShell
            table={table}
            columns={referenceShipmentsColumns}
            isLoading={isLoading && rows.length === 0}
            loadingLabel="Loading shipments…"
            emptyMessage="No shipments found."
            className="rounded-none border-0"
          />
        </div>

        <DataTablePaginationControls
          className="border-t p-3"
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
