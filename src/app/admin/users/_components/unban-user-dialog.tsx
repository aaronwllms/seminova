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
import { cn } from '@/utils/tailwind'

import type { UserMutationConfirmAction } from './user-mutation-confirm-action'

interface UnbanUserDialogProps {
  confirmAction: UserMutationConfirmAction | null
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export const UnbanUserDialog = ({
  confirmAction,
  isPending,
  onOpenChange,
  onConfirm,
}: UnbanUserDialogProps) => (
  <AlertDialog open={confirmAction !== null} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Unban user</AlertDialogTitle>
        <AlertDialogDescription>
          Restore sign-in access for {confirmAction?.email}? They will be able
          to sign in again immediately.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          disabled={isPending}
          className={cn(isPending && 'pointer-events-none opacity-50')}
          onClick={(event) => {
            event.preventDefault()
            onConfirm()
          }}
        >
          Unban
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
