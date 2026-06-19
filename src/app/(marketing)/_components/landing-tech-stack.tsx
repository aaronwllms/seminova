'use client'

import { useEffect, useState } from 'react'

import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
} from '@/components/kibo-ui/marquee'
import { landingContent } from '@/config/landing-content'

import { LandingContainer } from './landing-container'
import { LandingTechStackItem } from './landing-tech-stack-item'

export const LandingTechStack = () => {
  const { techStack } = landingContent
  const [shouldPlay, setShouldPlay] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePlay = () => setShouldPlay(!mediaQuery.matches)

    updatePlay()
    mediaQuery.addEventListener('change', updatePlay)
    return () => mediaQuery.removeEventListener('change', updatePlay)
  }, [])

  return (
    <section aria-label={techStack.label} className="bg-background py-7">
      <LandingContainer>
        <Marquee className="text-muted-foreground">
          <MarqueeContent play={shouldPlay}>
            {techStack.logos.map((logo) => (
              <LandingTechStackItem key={logo.name} logo={logo} />
            ))}
          </MarqueeContent>
          <MarqueeFade side="left" className="w-16 md:w-20" />
          <MarqueeFade side="right" className="w-16 md:w-20" />
        </Marquee>
      </LandingContainer>
    </section>
  )
}
