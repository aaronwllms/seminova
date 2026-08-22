'use client'

import * as React from 'react'

const SCROLL_ON_THRESHOLD = 10
const SCROLL_OFF_THRESHOLD = 4

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

export const useScrolled = () => {
  const [scrolled, setScrolled] = React.useState(false)

  useIsomorphicLayoutEffect(() => {
    const onScroll = () => {
      setScrolled((prev) => {
        const y = window.scrollY
        if (!prev && y > SCROLL_ON_THRESHOLD) return true
        if (prev && y <= SCROLL_OFF_THRESHOLD) return false
        return prev
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return scrolled
}
