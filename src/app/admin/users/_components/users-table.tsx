'use client'

import {
  useDataTableShell,
  DataTableShell,
} from '@/components/data-table-shell'
import { AppErrorSurface } from '@/components/app-error-surface'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AppError } from '@/types/app-error'

import {
  USERS_SEARCH_MIN_LENGTH,
  type AdminUserRow,
} from '../_lib/admin-user-row'
import { useAdminUserRoleMutation } from '../_lib/use-admin-user-role-mutation'
import { useAdminUsersList } from '../_lib/use-admin-users-list'
import {
  PromoteDemoteDialog,
  type RoleConfirmAction,
} from './promote-demote-dialog'
import { createUsersColumns } from './users-columns'

const SEARCH_DEBOUNCE_MS = 300

interface UsersTableProps {
  currentAdminUserId: string
}

export const UsersTable = ({ currentAdminUserId }: UsersTableProps) => {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [confirmAction, setConfirmAction] = useState<RoleConfirmAction | null>(
    null,
  )

  const {
    rows,
    hasNextPage,
    isLoading,
    isFetching,
    error: listError,
  } = useAdminUsersList({
    page,
    emailFilter: debouncedSearch || undefined,
  })

  const {
    mutate: mutateRole,
    isPending: isMutationPending,
    error: mutationError,
    variables: mutationVariables,
    reset: resetMutation,
  } = useAdminUserRoleMutation()

  const mutationAppError = mutationError
    ? (mutationError as unknown as AppError)
    : null

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  const handlePromote = useCallback(
    (row: AdminUserRow) => {
      resetMutation()
      setConfirmAction({ type: 'promote', userId: row.id, email: row.email })
    },
    [resetMutation],
  )

  const handleDemote = useCallback(
    (row: AdminUserRow) => {
      resetMutation()
      setConfirmAction({ type: 'demote', userId: row.id, email: row.email })
    },
    [resetMutation],
  )

  const pendingUserId = isMutationPending
    ? (mutationVariables?.userId ?? null)
    : null

  const columns = useMemo(
    () =>
      createUsersColumns({
        currentAdminUserId,
        pendingUserId,
        onPromote: handlePromote,
        onDemote: handleDemote,
      }),
    [currentAdminUserId, handleDemote, handlePromote, pendingUserId],
  )

  const { table } = useDataTableShell({
    data: rows,
    columns,
    getRowId: (row) => row.id,
  })

  const handleConfirmMutation = () => {
    if (!confirmAction) {
      return
    }

    const { type, userId } = confirmAction

    mutateRole(
      { type, userId },
      {
        onSettled: () => {
          setConfirmAction(null)
        },
      },
    )
  }

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

      {listError ? <AppErrorSurface error={listError} /> : null}

      <AppErrorSurface error={mutationAppError} />

      <div aria-busy={isFetching}>
        <DataTableShell
          table={table}
          columns={columns}
          isLoading={isLoading && rows.length === 0}
          loadingLabel="Loading users…"
          emptyMessage="No users found."
        />
      </div>

      <div className="flex items-center justify-end gap-2">
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

      <PromoteDemoteDialog
        confirmAction={confirmAction}
        isPending={pendingUserId !== null}
        onOpenChange={(open) => {
          if (!open && pendingUserId === null) {
            setConfirmAction(null)
          }
        }}
        onConfirm={handleConfirmMutation}
      />
    </div>
  )
}
