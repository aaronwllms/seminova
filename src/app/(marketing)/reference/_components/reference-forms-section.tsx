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
      <p className="text-muted-foreground mt-4 max-w-prose text-[15px] leading-relaxed">
        Live demos of every shipped save pattern — mock persist only on this
        page. Save model follows form shape: blur and upload confirm inline;
        explicit Save confirms with a toast.
      </p>

      <ReferenceFormsTabs />
    </section>
  )
}
