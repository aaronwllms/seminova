'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useActiveAnchor } from '@/hooks/use-active-anchor'

import { WORKFLOW_ANCHOR_LINKS } from '../_lib/workflow-anchor-links'

export const WorkflowSectionNav = () => {
  const activeId = useActiveAnchor(WORKFLOW_ANCHOR_LINKS)

  return (
    <nav
      aria-label="Workflow sections"
      className="mt-8 flex flex-wrap justify-center gap-2 pb-8"
    >
      {WORKFLOW_ANCHOR_LINKS.map((link) => (
        <Button
          key={link.id}
          asChild
          variant={activeId === link.id ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
        >
          <Link href={`#${link.id}`}>{link.label}</Link>
        </Button>
      ))}
    </nav>
  )
}
