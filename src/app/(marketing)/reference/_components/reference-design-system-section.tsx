import { InfoIcon } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'

import { REFERENCE_SECTION_SCROLL_CLASS } from '../_lib/reference-anchor-links'
import { ReferenceDesignSystemTabs } from './reference-design-system-tabs'

const EXTERNAL_LINK_CLASS = 'text-primary underline-offset-4 hover:underline'

export const ReferenceDesignSystemSection = () => {
  return (
    <section className="py-10">
      <h2
        id="design-system"
        className={`${REFERENCE_SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
      >
        Design system
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Semantic tokens, typography, and icons from the inherited theme.
      </p>

      <Alert variant="info" role="note" className="mt-4">
        <InfoIcon aria-hidden />
        <AlertDescription>
          <p>
            Default theme based on{' '}
            <a
              href="https://tweakcn.com/editor/theme?p=dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className={EXTERNAL_LINK_CLASS}
            >
              Clean Slate
            </a>{' '}
            from{' '}
            <a
              href="https://tweakcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className={EXTERNAL_LINK_CLASS}
            >
              tweakcn
            </a>
            — colors, typography, radius, shadows, and spacing.
          </p>
        </AlertDescription>
      </Alert>

      <ReferenceDesignSystemTabs />
    </section>
  )
}
