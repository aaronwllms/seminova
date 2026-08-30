'use client'

import { Loader2, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface AdminRefreshButtonProps {
  label: string
  isRefreshing: boolean
  isFetching?: boolean
  onClick: () => void
}

export const AdminRefreshButton = ({
  label,
  isRefreshing,
  isFetching = false,
  onClick,
}: AdminRefreshButtonProps) => {
  const showRefreshSpinner = isRefreshing || isFetching

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="shrink-0"
      disabled={isRefreshing}
      onClick={onClick}
      aria-label={label}
      aria-busy={showRefreshSpinner}
    >
      {showRefreshSpinner ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <RefreshCw className="size-4" aria-hidden />
      )}
    </Button>
  )
}
