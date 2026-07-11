'use client'

import { useEffect, useRef } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'

import type { ProfileFormValues } from '@/app/(app)/_lib/profile/profile-form-schema'

import { ProfilePasswordSection } from './profile-password-section'
import { ProfileSettingsForm } from './profile-settings-form'
import { ProfileThemeSegment } from './profile-theme-segment'

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

type ProfileModalContentProps = {
  userId: string
  email: string
  defaultValues: ProfileFormValues
}

export const ProfileModalContent = ({
  userId,
  email,
  defaultValues,
}: ProfileModalContentProps) => {
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

  return (
    <div className="flex w-full flex-col gap-6">
      <ProfileSettingsForm
        userId={userId}
        email={email}
        defaultValues={defaultValues}
      />

      <Separator className="bg-border/40" />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Appearance</h2>
          <p className="text-muted-foreground text-sm">
            Choose light, dark, or system theme for the app.
          </p>
        </div>
        <ProfileThemeSegment />
      </section>

      <Separator className="bg-border/40" />

      <Accordion
        type="single"
        collapsible
        onValueChange={handleAccordionValueChange}
      >
        <div ref={passwordSectionRef}>
          <AccordionItem
            value={PASSWORD_ACCORDION_VALUE}
            className="border-none"
          >
            <AccordionTrigger className="hover:bg-muted px-2 hover:no-underline">
              Change Password
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <ProfilePasswordSection email={email} />
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>
    </div>
  )
}
