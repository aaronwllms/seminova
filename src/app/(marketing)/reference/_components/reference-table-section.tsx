'use client'

import {
  DataTableShell,
  useDataTableShell,
} from '@/components/data-table-shell'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useReferenceShipments } from '../_lib/use-reference-shipments'
import { referenceShipmentsColumns } from './reference-shipments-columns'

const SEARCH_DEBOUNCE_MS = 300

export const ReferenceTableSection = () => {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { rows, hasNextPage, isLoading, isFetching } = useReferenceShipments({
    page,
    search: debouncedSearch,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  const { table } = useDataTableShell({
    data: rows,
    columns: referenceShipmentsColumns,
    getRowId: (row) => row.id,
  })

  return (
    <section id="table" className="border-t py-10">
      <h2 className="text-2xl font-semibold tracking-tight">Data table</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Live: search, sort, and pagination over a sample dataset.
      </p>

      <div className="bg-card mt-5 overflow-hidden rounded-xl border">
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

        <div className="flex items-center justify-end gap-2 border-t p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!hasNextPage || isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <p className="mt-5 max-w-prose text-[15px] leading-relaxed">
        The rows are a sample dataset, not real records — read it as the shape
        your own list view could take. While a page loads, rows show as loading
        placeholders instead of this content.
      </p>
    </section>
  )
}
