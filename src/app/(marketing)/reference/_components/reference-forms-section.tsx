import { InfoIcon } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'

import { REFERENCE_SECTION_SCROLL_CLASS } from '../_lib/reference-anchor-links'
import { ReferenceProfileSettingsPreview } from './reference-profile-settings-preview'

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
        Live: blur-save, explicit submit, and upload-on-complete — all wired to
        local mock handlers on this page.
      </p>

      <Alert variant="info" role="note" className="mt-4">
        <InfoIcon aria-hidden />
        <AlertDescription>
          Save model is per field, not per form — blur-save for standalone
          fields, explicit submit for coupled fields, upload-on-complete for
          files. Profile settings uses all three in one modal.
        </AlertDescription>
      </Alert>

      <div className="mt-8">
        <ReferenceProfileSettingsPreview />
      </div>
    </section>
  )
}
