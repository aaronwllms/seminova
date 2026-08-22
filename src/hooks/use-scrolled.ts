'use client'

import * as React from 'react'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

const isIntersectingViewport = (element: Element) => {
  const rect = element.getBoundingClientRect()
  const rootHeight = window.innerHeight ?? document.documentElement.clientHeight
  const rootWidth = window.innerWidth ?? document.documentElement.clientWidth

  return (
    rect.bottom > 0 &&
    rect.top < rootHeight &&
    rect.right > 0 &&
    rect.left < rootWidth
  )
}

export const useScrolled = (sentinelRef: React.RefObject<Element | null>) => {
  const [scrolled, setScrolled] = React.useState(false)

  useIsomorphicLayoutEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const updateFromIntersection = (isIntersecting: boolean) => {
      setScrolled(!isIntersecting)
    }

    updateFromIntersection(isIntersectingViewport(sentinel))

    const observer = new IntersectionObserver(
      ([entry]) => {
        updateFromIntersection(entry.isIntersecting)
      },
      { threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinelRef])

  return scrolled
}
