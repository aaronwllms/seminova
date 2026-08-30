'use client'

import { useEffect, useState } from 'react'

/** Returns the id of the top-most intersecting section heading. */
export const useActiveAnchor = (links: readonly { id: string }[]): string => {
  const ids = links.map((link) => link.id).join('\n')
  const [activeId, setActiveId] = useState(links[0]?.id ?? '')

  useEffect(() => {
    const idList = ids.split('\n')
    const elements = idList
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) {
      return
    }

    const fallbackId = idList[0] ?? ''

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              left.boundingClientRect.top - right.boundingClientRect.top,
          )

        if (intersecting.length > 0) {
          setActiveId(intersecting[0]?.target.id ?? fallbackId)
        }
      },
      { rootMargin: '-96px 0px -55% 0px', threshold: 0 },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [ids])

  return activeId
}
