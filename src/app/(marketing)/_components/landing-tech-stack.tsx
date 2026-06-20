'use client'

import { useEffect, useState } from 'react'

import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
} from '@/components/kibo-ui/marquee'
import { Badge } from '@/components/ui/badge'
import { landingContent } from '@/config/landing-content'

import { LandingContainer } from './landing-container'
import { LandingTechStackItem } from './landing-tech-stack-item'

const TRACK_REPEAT_COUNT = 3

export const LandingTechStack = () => {
  const { techStack } = landingContent
  const [shouldPlay, setShouldPlay] = useState(true)

  const trackLogos = Array.from(
    { length: TRACK_REPEAT_COUNT },
    () => techStack.logos,
  ).flat()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePlay = () => setShouldPlay(!mediaQuery.matches)

    updatePlay()
    mediaQuery.addEventListener('change', updatePlay)
    return () => mediaQuery.removeEventListener('change', updatePlay)
  }, [])

  return (
    <section
      aria-labelledby="tech-stack-label"
      className="bg-background pt-7 pb-12 md:pb-14"
    >
      <LandingContainer>
        <div className="mb-6 flex justify-center md:mb-8">
          <Badge variant="secondary" id="tech-stack-label">
            {techStack.label}
          </Badge>
        </div>
        <Marquee className="text-muted-foreground">
          <MarqueeContent autoFill={false} play={shouldPlay}>
            {trackLogos.map((logo, index) => (
              <LandingTechStackItem key={`${logo.name}-${index}`} logo={logo} />
            ))}
          </MarqueeContent>
          <MarqueeFade side="left" className="w-16 md:w-20" />
          <MarqueeFade side="right" className="w-16 md:w-20" />
        </Marquee>
      </LandingContainer>
    </section>
  )
}
