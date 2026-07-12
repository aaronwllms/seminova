import {
  AlertCircle,
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/tailwind'

export type ToastIconVariant =
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'loading'

export interface ToastIconVariantConfig {
  variant: ToastIconVariant
  message: string
  icon: LucideIcon
  iconClassName: string
}

export const TOAST_ICON_VARIANTS: readonly ToastIconVariantConfig[] = [
  {
    variant: 'success',
    message: 'Changes saved',
    icon: CircleCheckIcon,
    iconClassName: 'text-success',
  },
  {
    variant: 'info',
    message: 'Password expires in 3 days',
    icon: InfoIcon,
    iconClassName: 'text-primary',
  },
  {
    variant: 'warning',
    message: "You're near your storage limit",
    icon: TriangleAlertIcon,
    iconClassName: 'text-warning',
  },
  {
    variant: 'error',
    message: "Couldn't save your changes",
    icon: AlertCircle,
    iconClassName: 'text-destructive',
  },
  {
    variant: 'loading',
    message: 'Working on it...',
    icon: Loader2Icon,
    iconClassName: 'text-muted-foreground animate-spin',
  },
] as const

const SONNER_VARIANT_KEYS = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error',
  loading: 'loading',
} as const satisfies Record<ToastIconVariant, ToastIconVariant>

export const createSonnerToastIcons = (): Record<
  'success' | 'info' | 'warning' | 'error' | 'loading',
  ReactNode
> => {
  return TOAST_ICON_VARIANTS.reduce(
    (icons, { variant, icon: Icon, iconClassName }) => {
      icons[SONNER_VARIANT_KEYS[variant]] = (
        <Icon className={cn('size-4', iconClassName)} />
      )
      return icons
    },
    {} as Record<
      'success' | 'info' | 'warning' | 'error' | 'loading',
      ReactNode
    >,
  )
}
