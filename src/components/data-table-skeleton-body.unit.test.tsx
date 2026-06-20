import { render } from '@/test/test-utils'
import type { ColumnDef } from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'

import {
  DataTableSkeletonBody,
  DEFAULT_LOADING_ROW_COUNT,
} from './data-table-skeleton-body'

type TestRow = { id: string; name: string }

const testColumns: ColumnDef<TestRow, unknown>[] = [
  {
    accessorKey: 'name',
    meta: { skeletonClassName: 'h-5 w-32' },
  },
  {
    accessorKey: 'id',
  },
]

describe('DataTableSkeletonBody', () => {
  it('should render skeleton elements for each row and column', () => {
    const rowCount = 3
    const { container } = render(
      <table>
        <tbody>
          <DataTableSkeletonBody columns={testColumns} rowCount={rowCount} />
        </tbody>
      </table>,
    )

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons).toHaveLength(rowCount * testColumns.length)
  })

  it('should default to DEFAULT_LOADING_ROW_COUNT rows', () => {
    const { container } = render(
      <table>
        <tbody>
          <DataTableSkeletonBody columns={testColumns} />
        </tbody>
      </table>,
    )

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons).toHaveLength(
      DEFAULT_LOADING_ROW_COUNT * testColumns.length,
    )
  })

  it('should apply meta.skeletonClassName on a column', () => {
    const { container } = render(
      <table>
        <tbody>
          <DataTableSkeletonBody columns={testColumns} rowCount={1} />
        </tbody>
      </table>,
    )

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons[0]).toHaveClass('h-5', 'w-32')
  })
})
