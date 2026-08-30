import { render, screen } from '@/test/test-utils'
import type { ColumnDef } from '@tanstack/react-table'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DataTableShell, useDataTableShell } from './data-table-shell'

type TestRow = { id: string; name: string }

const testColumns: ColumnDef<TestRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.original.name,
  },
]

type ShellHarnessProps = {
  data: TestRow[]
  isLoading?: boolean
  onRowClick?: (row: TestRow) => void
}

const ShellHarness = ({ data, isLoading, onRowClick }: ShellHarnessProps) => {
  const { table } = useDataTableShell({
    data,
    columns: testColumns,
    getRowId: (row) => row.id,
  })

  return (
    <DataTableShell
      table={table}
      columns={testColumns}
      isLoading={isLoading}
      onRowClick={onRowClick}
    />
  )
}

describe('DataTableShell', () => {
  it('should show the default empty message when not loading and there are no rows', () => {
    render(<ShellHarness data={[]} />)

    expect(screen.getByText('No results.')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="skeleton"]')).toBeNull()
  })

  it('should show skeleton rows and the loading label when loading with no rows', () => {
    render(<ShellHarness data={[]} isLoading />)

    expect(document.querySelector('[data-slot="skeleton"]')).not.toBeNull()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByText('No results.')).toBeNull()
  })

  it('should render row text when data is present', () => {
    render(<ShellHarness data={[{ id: '1', name: 'Alpha' }]} />)

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="skeleton"]')).toBeNull()
  })

  it('should keep existing row text visible while loading when rows are already present', () => {
    render(<ShellHarness data={[{ id: '1', name: 'Alpha' }]} isLoading />)

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="skeleton"]')).toBeNull()
  })

  it('should activate the row when Enter is pressed', async () => {
    const user = userEvent.setup({ delay: null })
    const onRowClick = vi.fn()
    const row = { id: '1', name: 'Alpha' }

    render(<ShellHarness data={[row]} onRowClick={onRowClick} />)

    const tableRow = screen.getByRole('row', { name: 'View row details' })
    tableRow.focus()

    await user.keyboard('{Enter}')

    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(onRowClick).toHaveBeenCalledWith(row)
  })

  it('should activate the row when Space is pressed', async () => {
    const user = userEvent.setup({ delay: null })
    const onRowClick = vi.fn()
    const row = { id: '1', name: 'Alpha' }

    render(<ShellHarness data={[row]} onRowClick={onRowClick} />)

    const tableRow = screen.getByRole('row', { name: 'View row details' })
    tableRow.focus()

    await user.keyboard(' ')

    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(onRowClick).toHaveBeenCalledWith(row)
  })
})
