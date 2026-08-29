import { connection } from 'next/server'
import { Suspense } from 'react'

import { SECTION_SCROLL_CLASS } from '@/constants/section-scroll'

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
        className={`${SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
      >
        Data table
      </h2>
      <p className="text-muted-foreground mt-4 max-w-prose text-[15px] leading-relaxed">
        Sample data on the same shell as admin Users and Logs — stat-tile
        filters, search, filter chips, refresh, sort, and pagination.
      </p>
    </div>

    <Suspense fallback={<ReferenceTableDemoFallback />}>
      <ReferenceTableDemoEntry />
    </Suspense>
  </section>
)
