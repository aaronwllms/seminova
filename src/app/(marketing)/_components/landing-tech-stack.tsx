import Image from 'next/image'

import { landingContent } from '@/config/landing-content'

import { LandingContainer } from './landing-container'

export const LandingTechStack = () => {
  const { techStack } = landingContent

  return (
    <section aria-label={techStack.label} className="bg-background py-7">
      <LandingContainer>
        <p className="sr-only">{techStack.label}</p>
        <ul className="text-muted-foreground flex flex-wrap items-center justify-center gap-8 md:gap-10">
          {techStack.logos.map((logo) => (
            <li key={logo.name} className="flex items-center">
              <span className="sr-only">{logo.name}</span>
              <Image
                src={logo.src}
                alt=""
                width={logo.width}
                height={logo.height}
                loading="lazy"
                className="h-5 w-auto opacity-80"
                role="presentation"
              />
            </li>
          ))}
        </ul>
      </LandingContainer>
    </section>
  )
}
