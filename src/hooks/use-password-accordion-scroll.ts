'use client'

import { useRef } from 'react'

const PASSWORD_ACCORDION_VALUE = 'password'
// debt: 200ms matches --animate-accordion-down in globals.css; drop when a post-layout hook replaces the timeout
const ACCORDION_ANIMATION_MS = 200

export const usePasswordAccordionScroll = () => {
  const passwordSectionRef = useRef<HTMLDivElement>(null)

  const handleAccordionValueChange = (value: string) => {
    if (value !== PASSWORD_ACCORDION_VALUE) return

    window.setTimeout(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      passwordSectionRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    }, ACCORDION_ANIMATION_MS)
  }

  return { passwordSectionRef, handleAccordionValueChange }
}
