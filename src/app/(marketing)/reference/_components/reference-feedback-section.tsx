'use client'

import { InfoIcon } from 'lucide-react'

import { AppErrorSurface } from '@/components/app-error-surface'
import { Alert, AlertDescription } from '@/components/ui/alert'
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

      <Alert variant="info" role="note" className="mt-4">
        <InfoIcon aria-hidden />
        <AlertDescription>
          Live demos of InlineError (operational) and ErrorPanel (fault,
          copyable code) — shown together here for comparison; in the product
          they appear individually, near their trigger.
        </AlertDescription>
      </Alert>

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
    </section>
  )
}
