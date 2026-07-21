'use client'

import { useEffect, useRef } from 'react'

const PASSWORD_ACCORDION_VALUE = 'password'
const ACCORDION_ANIMATION_MS = 200

const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3)

const findScrollContainer = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement

  while (parent) {
    const { overflowY } = getComputedStyle(parent)

    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent
    }

    parent = parent.parentElement
  }

  return null
}

export const usePasswordAccordionScroll = () => {
  const passwordSectionRef = useRef<HTMLDivElement>(null)
  const scrollTweenFrameRef = useRef<number | null>(null)

  const cancelScrollTween = () => {
    if (scrollTweenFrameRef.current !== null) {
      cancelAnimationFrame(scrollTweenFrameRef.current)
      scrollTweenFrameRef.current = null
    }
  }

  const scrollPasswordSectionToTop = () => {
    const section = passwordSectionRef.current
    if (!section) return

    const scrollContainer = findScrollContainer(section)
    if (!scrollContainer) return

    const startScrollTop = scrollContainer.scrollTop
    const containerTop = scrollContainer.getBoundingClientRect().top
    const sectionTop = section.getBoundingClientRect().top
    const targetScrollTop = startScrollTop + (sectionTop - containerTop)

    cancelScrollTween()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scrollContainer.scrollTop = targetScrollTop
      return
    }

    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / ACCORDION_ANIMATION_MS, 1)
      const easedProgress = easeOutCubic(progress)

      scrollContainer.scrollTop =
        startScrollTop + (targetScrollTop - startScrollTop) * easedProgress

      if (progress < 1) {
        scrollTweenFrameRef.current = requestAnimationFrame(tick)
      } else {
        scrollTweenFrameRef.current = null
      }
    }

    scrollTweenFrameRef.current = requestAnimationFrame(tick)
  }

  const handleAccordionValueChange = (value: string) => {
    cancelScrollTween()

    if (value === PASSWORD_ACCORDION_VALUE) {
      scrollPasswordSectionToTop()
    }
  }

  useEffect(() => cancelScrollTween, [])

  return { passwordSectionRef, handleAccordionValueChange }
}
