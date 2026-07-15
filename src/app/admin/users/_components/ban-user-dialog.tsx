'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ADMIN_BAN_DURATIONS,
  ADMIN_BAN_DURATION_LABELS,
  type AdminBanDuration,
} from '@/constants/admin-ban'

import type { UserMutationConfirmAction } from './user-mutation-confirm-action'

interface BanUserDialogProps {
  confirmAction: UserMutationConfirmAction | null
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (banDuration: AdminBanDuration) => void
}

export const BanUserDialog = ({
  confirmAction,
  isPending,
  onOpenChange,
  onConfirm,
}: BanUserDialogProps) => {
  const [banDuration, setBanDuration] = useState<AdminBanDuration>('24h')

  return (
    <Dialog
      open={confirmAction !== null}
      onOpenChange={(open) => {
        if (!open) {
          setBanDuration('24h')
        }
        onOpenChange(open)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban user</DialogTitle>
          <DialogDescription>
            Block sign-in for {confirmAction?.email}. Choose how long the ban
            should last.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ban-duration">Ban duration</Label>
          <Select
            value={banDuration}
            onValueChange={(value) => setBanDuration(value as AdminBanDuration)}
            disabled={isPending}
          >
            <SelectTrigger id="ban-duration">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {ADMIN_BAN_DURATIONS.map((duration) => (
                <SelectItem key={duration} value={duration}>
                  {ADMIN_BAN_DURATION_LABELS[duration]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => onConfirm(banDuration)}
          >
            Ban user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
