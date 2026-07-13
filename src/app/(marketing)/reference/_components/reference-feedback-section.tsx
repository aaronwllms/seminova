'use client'

import { AppErrorSurface } from '@/components/app-error-surface'
import type { AppError } from '@/types/app-error'
import { cn } from '@/utils/tailwind'
import { TOAST_ICON_VARIANTS } from '@/utils/toast-icon-config'

const OPERATIONAL_DEMO_ERROR: AppError = {
  kind: 'operational',
  message: "That username's already taken. Try another.",
  code: 'USERNAME_TAKEN',
}

const FAULT_DEMO_ERROR: AppError = {
  kind: 'fault',
  message: 'Could not save your profile. Please try again.',
  code: 'DEMO_FAULT',
}

const StaticToastCard = ({
  message,
  icon: Icon,
  iconClassName,
}: {
  message: string
  icon: (typeof TOAST_ICON_VARIANTS)[number]['icon']
  iconClassName: string
}) => {
  return (
    <div className="bg-card flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 shadow-sm">
      <Icon className={cn('size-4 shrink-0', iconClassName)} aria-hidden />
      <span className="text-sm">{message}</span>
    </div>
  )
}

export const ReferenceFeedbackSection = () => {
  return (
    <>
      <section className="border-t py-10">
        <h2 id="feedback" className="text-2xl font-semibold tracking-tight">
          InlineError and ErrorPanel
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Live: two components, for operational and fault errors.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs">
              InlineError — operational
            </p>
            <AppErrorSurface error={OPERATIONAL_DEMO_ERROR} />
          </div>
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs">
              ErrorPanel — fault
            </p>
            <AppErrorSurface error={FAULT_DEMO_ERROR} />
          </div>
        </div>

        <p className="mt-5 max-w-prose text-[15px] leading-relaxed">
          Every error carries a kind: operational or fault. Operational errors
          are things the user caused and can fix themselves — InlineError shows
          those next to the field, no border. Faults are on the app&apos;s side
          — ErrorPanel shows those with the error code in a neutral chip and a
          labeled Copy control that copies the message and code for a support
          request.
        </p>
      </section>

      <section className="border-t py-10">
        <h2 id="toast" className="text-2xl font-semibold tracking-tight">
          Toast
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Static: all five variants, each at the moment it appears.
        </p>

        <div className="mt-5 flex max-w-sm flex-col gap-2.5">
          {TOAST_ICON_VARIANTS.map((toast) => (
            <StaticToastCard
              key={toast.variant}
              message={toast.message}
              icon={toast.icon}
              iconClassName={toast.iconClassName}
            />
          ))}
        </div>

        <p className="mt-5 max-w-prose text-[15px] leading-relaxed">
          Five variants: success, info, warning, error, and loading. Today only
          success is actually called anywhere in the app — the other four are
          configured and ready, but nothing triggers them yet. Toasts confirm or
          narrate something in progress and then get out of the way on their
          own.
        </p>
      </section>
    </>
  )
}
