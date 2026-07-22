import { InfoIcon } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'

import { REFERENCE_SECTION_SCROLL_CLASS } from '../_lib/reference-anchor-links'
import { ReferenceFormsTabs } from './reference-forms-tabs'

export const ReferenceFormsSection = () => {
  return (
    <section className="border-t py-10">
      <h2
        id="forms"
        className={`${REFERENCE_SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
      >
        Forms and save models
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Live demos of every shipped save pattern — mock persist only on this
        page.
      </p>

      <Alert variant="info" role="note" className="mt-4">
        <InfoIcon aria-hidden />
        <AlertDescription>
          Save model follows form shape — blur and upload confirm inline;
          explicit Save confirms with a toast.
        </AlertDescription>
      </Alert>

      <ReferenceFormsTabs />
    </section>
  )
}
