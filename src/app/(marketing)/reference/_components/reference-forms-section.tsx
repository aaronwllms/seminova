'use client'

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

      <div className="mt-8">
        <ReferenceProfileSettingsPreview />
      </div>

      <p className="mt-8 max-w-prose text-[15px] leading-relaxed">
        The save model is a choice made per field, not per form. Blur-save fits
        a field that&apos;s valid on its own, like a name or a bio. Explicit
        submit fits fields that only mean something together, like a password
        change. Upload-on-complete fits files, where the upload finishing is
        itself the save. Signed-in profile settings uses all three in one modal.
      </p>
    </section>
  )
}
