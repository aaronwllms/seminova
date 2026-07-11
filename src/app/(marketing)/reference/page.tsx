import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { REFERENCE_PATH } from '@/constants/app-paths'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/tailwind'

import { LandingContainer } from '../_components/landing-container'
import { ReferenceFeedbackSection } from './_components/reference-feedback-section'
import { ReferenceFormsSection } from './_components/reference-forms-section'
import { ReferenceTableSection } from './_components/reference-table-section'
import { ReferenceTableSectionFallback } from './_components/reference-table-section-fallback'

const ANCHOR_LINKS = [
  { href: '#forms', label: 'Forms and save models' },
  { href: '#feedback', label: 'InlineError and ErrorPanel' },
  { href: '#toast', label: 'Toast' },
  { href: '#table', label: 'Data table' },
] as const

export const metadata: Metadata = {
  title: 'Pattern Reference',
  description:
    'Live demos of the blur-save form pattern, error surfaces, toast variants, and canonical data table your spinoff inherits from Seminova.',
  alternates: {
    canonical: REFERENCE_PATH,
  },
}

export default function ReferencePage() {
  return (
    <main id="main-content" className="bg-background py-12">
      <LandingContainer>
        <div className="mx-auto max-w-3xl">
          <div className="px-4 text-center sm:px-0">
            <Badge variant="secondary" className="mb-3">
              Pattern reference
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What you inherit
            </h1>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-[15px] leading-relaxed">
              Every component below is the one your spinoff imports. Nothing
              here is a reimplementation.
            </p>
          </div>

          <nav
            aria-label="Reference sections"
            className="mt-8 flex flex-wrap justify-center gap-2 border-b pb-8"
          >
            {ANCHOR_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-muted-foreground hover:text-foreground rounded-md border px-3 py-1.5 text-sm transition-colors',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="px-4 sm:px-0">
            <ReferenceFormsSection />
            <ReferenceFeedbackSection />
            <Suspense fallback={<ReferenceTableSectionFallback />}>
              <ReferenceTableSection />
            </Suspense>
          </div>
        </div>
      </LandingContainer>
    </main>
  )
}
