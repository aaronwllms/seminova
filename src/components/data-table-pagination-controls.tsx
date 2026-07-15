'use client'

import { useId } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/tailwind'

export interface DataTablePaginationControlsProps {
  page: number
  hasNextPage: boolean
  isPending: boolean
  onPrevious: () => void
  onNext: () => void
  pageSize: number
  pageSizeOptions: readonly number[]
  onPageSizeChange: (size: number) => void
  className?: string
}

export const DataTablePaginationControls = ({
  page,
  hasNextPage,
  isPending,
  onPrevious,
  onNext,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  className,
}: DataTablePaginationControlsProps) => {
  const pageSizeId = useId()

  return (
    <div
      className={cn('flex flex-wrap items-center justify-end gap-4', className)}
    >
      <div className="flex items-center gap-2">
        <Label htmlFor={pageSizeId} className="text-sm whitespace-nowrap">
          Rows per page
        </Label>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
          disabled={isPending}
        >
          <SelectTrigger
            id={pageSizeId}
            className="h-8 w-[70px]"
            aria-label="Rows per page"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || isPending}
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage || isPending}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
