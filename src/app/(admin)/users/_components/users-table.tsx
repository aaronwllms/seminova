'use client'

import { useDataTable, DataTableShell } from '@/components/data-table1'
import { ErrorPanel } from '@/components/error-panel'
import { InlineError } from '@/components/inline-error'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AppError } from '@/types/app-error'

import {
  USERS_SEARCH_MIN_LENGTH,
  type AdminUserRow,
} from '../_lib/admin-user-row'
import { listUsersAction } from '../actions'
import { usersColumns } from './users-columns'

const SEARCH_DEBOUNCE_MS = 300

export const UsersTable = () => {
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [error, setError] = useState<AppError | null>(null)
  const [isPending, startTransition] = useTransition()

  const { table } = useDataTable({
    data: rows,
    columns: usersColumns,
    getRowId: (row) => row.id,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  const loadUsers = useCallback(() => {
    startTransition(async () => {
      const result = await listUsersAction({
        page,
        emailFilter: debouncedSearch || undefined,
      })

      if (!result.success) {
        setError({
          message: result.error.message,
          code: result.error.code,
          kind: result.error.kind,
        })
        setRows([])
        setHasNextPage(false)
        return
      }

      setError(null)
      setRows(result.data.rows)
      setHasNextPage(result.data.hasNextPage)
    })
  }, [debouncedSearch, page])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const showSearchHint =
    searchInput.trim().length > 0 &&
    searchInput.trim().length < USERS_SEARCH_MIN_LENGTH

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="users-email-search">Search by email</Label>
        <Input
          id="users-email-search"
          type="search"
          placeholder="Search by email…"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-describedby={
            showSearchHint ? 'users-email-search-hint' : undefined
          }
        />
        {showSearchHint ? (
          <p
            id="users-email-search-hint"
            className="text-muted-foreground text-sm"
          >
            Enter at least {USERS_SEARCH_MIN_LENGTH} characters to search email.
          </p>
        ) : null}
      </div>

      {error?.kind === 'fault' ? (
        <ErrorPanel message={error.message} code={error.code} />
      ) : error ? (
        <InlineError message={error.message} />
      ) : null}

      <div aria-busy={isPending}>
        <DataTableShell
          table={table}
          columns={usersColumns}
          isLoading={isPending}
          loadingLabel="Loading users…"
          emptyMessage="No users found."
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || isPending}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage || isPending}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
