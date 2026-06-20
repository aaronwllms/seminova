import Image from 'next/image'

import { MarqueeItem } from '@/components/kibo-ui/marquee'
import type { LandingTechLogo } from '@/config/landing-content'
import { cn } from '@/utils/tailwind'

interface LandingTechStackItemProps {
  logo: LandingTechLogo
}

const logoImageClassName = 'h-9 w-auto object-contain'

export const LandingTechStackItem = ({ logo }: LandingTechStackItemProps) => (
  <MarqueeItem className="mx-4 lg:mx-6">
    <div className="flex items-center gap-1.5">
      <div className="relative flex h-9 shrink-0 items-center">
        {logo.srcDark ? (
          <>
            <Image
              src={logo.src}
              alt=""
              width={logo.width}
              height={logo.height}
              loading="lazy"
              className={cn(logoImageClassName, 'dark:hidden')}
              role="presentation"
            />
            <Image
              src={logo.srcDark}
              alt=""
              width={logo.width}
              height={logo.height}
              loading="lazy"
              className={cn(logoImageClassName, 'hidden dark:block')}
              role="presentation"
            />
          </>
        ) : (
          <Image
            src={logo.src}
            alt=""
            width={logo.width}
            height={logo.height}
            loading="lazy"
            className={logoImageClassName}
            role="presentation"
          />
        )}
      </div>
      <span className="text-muted-foreground text-base font-medium whitespace-nowrap">
        {logo.name}
      </span>
    </div>
  </MarqueeItem>
)
