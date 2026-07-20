'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

import { REFERENCE_ANCHOR_LINKS } from '../_lib/reference-anchor-links'

export const ReferenceSectionNav = () => {
  const [activeId, setActiveId] = useState<string>(
    REFERENCE_ANCHOR_LINKS[0]?.id ?? 'forms',
  )

  useEffect(() => {
    const elements = REFERENCE_ANCHOR_LINKS.map((link) =>
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
          setActiveId(
            intersecting[0]?.target.id ?? REFERENCE_ANCHOR_LINKS[0].id,
          )
        }
      },
      { rootMargin: '-96px 0px -55% 0px', threshold: 0 },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

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
