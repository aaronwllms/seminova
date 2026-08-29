'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

import { WORKFLOW_ANCHOR_LINKS } from '../_lib/workflow-anchor-links'

const DEFAULT_ACTIVE_ID = WORKFLOW_ANCHOR_LINKS[0]?.id ?? 'two-environments'

export const WorkflowSectionNav = () => {
  const [activeId, setActiveId] = useState<string>(DEFAULT_ACTIVE_ID)

  useEffect(() => {
    const elements = WORKFLOW_ANCHOR_LINKS.map((link) =>
      document.getElementById(link.id),
    ).filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              left.boundingClientRect.top - right.boundingClientRect.top,
          )

        if (intersecting.length > 0) {
          setActiveId(intersecting[0]?.target.id ?? DEFAULT_ACTIVE_ID)
        }
      },
      { rootMargin: '-96px 0px -55% 0px', threshold: 0 },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

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
