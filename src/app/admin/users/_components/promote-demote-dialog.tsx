'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'

export type RoleConfirmAction = {
  type: 'promote' | 'demote'
  userId: string
  email: string
}

interface PromoteDemoteDialogProps {
  confirmAction: RoleConfirmAction | null
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export const PromoteDemoteDialog = ({
  confirmAction,
  isPending,
  onOpenChange,
  onConfirm,
}: PromoteDemoteDialogProps) => {
  const isDemote = confirmAction?.type === 'demote'

  return (
    <AlertDialog open={confirmAction !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDemote ? 'Demote from admin' : 'Promote to admin'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDemote
              ? `Remove admin access for ${confirmAction?.email}? They will lose access to admin pages after their session refreshes.`
              : `Grant admin access to ${confirmAction?.email}? They will need to sign in again to access admin pages.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant={isDemote ? 'destructive' : 'default'}
              disabled={isPending}
              className={cn(isPending && 'pointer-events-none opacity-50')}
              onClick={(event) => {
                event.preventDefault()
                onConfirm()
              }}
            >
              {isDemote ? 'Demote' : 'Promote'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
