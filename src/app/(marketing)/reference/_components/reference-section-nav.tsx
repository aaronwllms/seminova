'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useActiveAnchor } from '@/hooks/use-active-anchor'

import { REFERENCE_ANCHOR_LINKS } from '../_lib/reference-anchor-links'

export const ReferenceSectionNav = () => {
  const activeId = useActiveAnchor(REFERENCE_ANCHOR_LINKS)

  return (
    <nav
      aria-label="Reference sections"
      className="mt-8 flex flex-wrap justify-center gap-2 border-b pb-8"
    >
      {REFERENCE_ANCHOR_LINKS.map((link) => (
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
