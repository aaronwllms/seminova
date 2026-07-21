import { connection } from 'next/server'
import { Suspense } from 'react'

import { REFERENCE_SECTION_SCROLL_CLASS } from '../_lib/reference-anchor-links'

import { ReferenceTableDemo } from './reference-table-demo'
import { ReferenceTableDemoFallback } from './reference-table-demo-fallback'

const ReferenceTableDemoEntry = async () => {
  await connection()
  return <ReferenceTableDemo />
}

export const ReferenceTableSection = () => (
  <section className="border-t py-10">
    <div className="mx-auto max-w-3xl px-4 sm:px-0">
      <h2
        id="table"
        className={`${REFERENCE_SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
      >
        Data table
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Live: search, sort, and pagination over a sample dataset.
      </p>
    </div>

    <Suspense fallback={<ReferenceTableDemoFallback />}>
      <ReferenceTableDemoEntry />
    </Suspense>

    <p className="mx-auto mt-5 max-w-prose px-4 text-[15px] leading-relaxed sm:px-0">
      The rows are a sample dataset, not real records — read it as the shape
      your own list view could take. While a page loads, rows show as loading
      placeholders instead of this content.
    </p>
  </section>
)
