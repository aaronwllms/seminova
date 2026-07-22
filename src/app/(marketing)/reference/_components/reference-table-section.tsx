import { InfoIcon } from 'lucide-react'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'

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
        Live: stat-tile filters, search, filter chips, refresh, sort, and
        pagination over a sample dataset.
      </p>

      <Alert variant="info" role="note" className="mt-4">
        <InfoIcon aria-hidden />
        <AlertDescription>
          Sample rows, not real records. Hard-refresh this page to see skeleton
          placeholders while the table loads.
        </AlertDescription>
      </Alert>
    </div>

    <Suspense fallback={<ReferenceTableDemoFallback />}>
      <ReferenceTableDemoEntry />
    </Suspense>
  </section>
)
