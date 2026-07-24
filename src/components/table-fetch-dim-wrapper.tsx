'use client'

import type { ReactNode } from 'react'

import { useTableFetchDim } from '@/hooks/use-table-fetch-dim'
import { cn } from '@/utils/tailwind'

interface TableFetchDimWrapperProps {
  isFetching: boolean
  hasStaleRows: boolean
  children: ReactNode
}

export const TableFetchDimWrapper = ({
  isFetching,
  hasStaleRows,
  children,
}: TableFetchDimWrapperProps) => {
  const isDimmed = useTableFetchDim(isFetching, hasStaleRows)

  return (
    <div
      aria-busy={isFetching}
      className={cn(
        'duration-swept transition-opacity',
        isDimmed && 'opacity-60',
      )}
    >
      {children}
    </div>
  )
}
