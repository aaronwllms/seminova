'use client'

import { AppErrorSurface } from '@/components/app-error-surface'
import { Note } from '@/components/ui/note'
import type { AppError } from '@/types/app-error'

import { REFERENCE_SECTION_SCROLL_CLASS } from '../_lib/reference-anchor-links'

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

export const ReferenceFeedbackSection = () => {
  return (
    <section className="border-t py-10">
      <h2
        id="feedback"
        className={`${REFERENCE_SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
      >
        InlineError and ErrorPanel
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Live: two components, for operational and fault errors.
      </p>

      <Note className="mt-4">
        Shown together for comparison — in the product these appear
        individually, near their trigger.
      </Note>

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
        Every error carries a kind: operational or fault. Operational errors are
        things the user caused and can fix themselves — InlineError shows those
        next to the field, no border. Faults are on the app&apos;s side —
        ErrorPanel shows those with the error code in a neutral chip and a
        labeled Copy control that copies the message and code for a support
        request.
      </p>
    </section>
  )
}
