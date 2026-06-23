'use client'

import { useDataTable, DataTableShell } from '@/components/data-table1'
import { ErrorPanel } from '@/components/error-panel'
import { InlineError } from '@/components/inline-error'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AppError } from '@/types/app-error'
import {
  getRoleMutationToastMessage,
  type RoleMutationSuccessStatus,
} from '@/utils/admin-role-mutations'
import { showSuccessToast } from '@/utils/app-toast'

import {
  USERS_SEARCH_MIN_LENGTH,
  type AdminUserRow,
} from '../_lib/admin-user-row'
import {
  demoteUserAction,
  listUsersAction,
  promoteUserAction,
} from '../actions'
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
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [error, setError] = useState<AppError | null>(null)
  const [actionError, setActionError] = useState<AppError | null>(null)
  const [confirmAction, setConfirmAction] = useState<RoleConfirmAction | null>(
    null,
  )
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handlePromote = useCallback((row: AdminUserRow) => {
    setActionError(null)
    setConfirmAction({ type: 'promote', userId: row.id, email: row.email })
  }, [])

  const handleDemote = useCallback((row: AdminUserRow) => {
    setActionError(null)
    setConfirmAction({ type: 'demote', userId: row.id, email: row.email })
  }, [])

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

  const { table } = useDataTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
  })

  const handleConfirmMutation = () => {
    if (!confirmAction) {
      return
    }

    const { type, userId } = confirmAction
    setPendingUserId(userId)

    startTransition(async () => {
      const result =
        type === 'promote'
          ? await promoteUserAction({ userId })
          : await demoteUserAction({ userId })

      setPendingUserId(null)
      setConfirmAction(null)

      if (!result.success) {
        setActionError({
          message: result.error.message,
          code: result.error.code,
          kind: result.error.kind,
        })
        return
      }

      setActionError(null)
      showSuccessToast(
        getRoleMutationToastMessage(
          result.data.status as RoleMutationSuccessStatus,
        ),
      )
      loadUsers()
    })
  }

  const showSearchHint =
    searchInput.trim().length > 0 &&
    searchInput.trim().length < USERS_SEARCH_MIN_LENGTH

  const displayError = actionError ?? error

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

      {displayError?.kind === 'fault' ? (
        <ErrorPanel message={displayError.message} code={displayError.code} />
      ) : displayError ? (
        <InlineError message={displayError.message} />
      ) : null}

      <div aria-busy={isPending}>
        <DataTableShell
          table={table}
          columns={columns}
          isLoading={isPending && rows.length === 0}
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
