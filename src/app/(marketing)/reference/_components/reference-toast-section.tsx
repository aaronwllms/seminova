'use client'

import { InfoIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  TOAST_ICON_VARIANTS,
  type ToastIconVariant,
  type ToastIconVariantConfig,
} from '@/utils/toast-icon-config'
import { cn } from '@/utils/tailwind'

import { SECTION_SCROLL_CLASS } from '@/constants/section-scroll'

const LOADING_TOAST_DELAY_MS = 2000

const TOAST_TRIGGER_LABEL: Record<ToastIconVariant, string> = {
  success: 'Show success toast',
  info: 'Show info toast',
  warning: 'Show warning toast',
  error: 'Show error toast',
  loading: 'Show loading toast',
}

const showReferenceToast = (variant: ToastIconVariant, message: string) => {
  switch (variant) {
    case 'success':
      toast.success(message)
      break
    case 'info':
      toast.info(message)
      break
    case 'warning':
      toast.warning(message)
      break
    case 'error':
      toast.error(message)
      break
    case 'loading':
      toast.promise(
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, LOADING_TOAST_DELAY_MS)
        }),
        {
          loading: message,
          success: 'Changes saved',
        },
      )
      break
  }
}

const ReferenceToastPreviewCard = ({
  icon: Icon,
  iconClassName,
  message,
}: Pick<ToastIconVariantConfig, 'icon' | 'iconClassName' | 'message'>) => {
  return (
    <div
      aria-hidden
      className="bg-popover text-popover-foreground flex min-h-11 flex-1 items-center gap-3 rounded-lg border px-4 py-3 shadow-sm"
    >
      <Icon className={cn('size-4 shrink-0', iconClassName)} />
      <span className="text-sm">{message}</span>
    </div>
  )
}

export const ReferenceToastSection = () => {
  return (
    <section className="border-t py-10">
      <h2
        id="toast"
        className={`${SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
      >
        Toast
      </h2>

      <Alert variant="info" role="note" className="mt-4">
        <InfoIcon aria-hidden />
        <AlertDescription>
          Live demos of all five Sonner variants with production icons and
          styling. Only success toasts are wired in the app today — the other
          four are configured and ready to use.
        </AlertDescription>
      </Alert>

      <ul className="mt-5 flex flex-col gap-3">
        {TOAST_ICON_VARIANTS.map(
          ({ variant, message, icon, iconClassName }) => (
            <li
              key={variant}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <ReferenceToastPreviewCard
                icon={icon}
                iconClassName={iconClassName}
                message={message}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 sm:w-52"
                onClick={() => showReferenceToast(variant, message)}
              >
                {TOAST_TRIGGER_LABEL[variant]}
              </Button>
            </li>
          ),
        )}
      </ul>
    </section>
  )
}
