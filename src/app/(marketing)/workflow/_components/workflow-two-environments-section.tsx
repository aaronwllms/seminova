import Image from 'next/image'

import { MarketingDisplayCard } from '@/components/marketing-display-card'
import { cn } from '@/utils/tailwind'

import { WORKFLOW_ENVIRONMENTS } from '../_lib/workflow-page-content'
import { WORKFLOW_SECTION_SCROLL_CLASS } from '../_lib/workflow-anchor-links'

const environmentLogoClassName = 'h-6 w-auto object-contain'

export const WorkflowTwoEnvironmentsSection = () => (
  <section aria-labelledby="two-environments" className="border-t py-10">
    <div className="mx-auto max-w-3xl px-4 sm:px-0">
      <h2
        className={`${WORKFLOW_SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
        id="two-environments"
      >
        Two environments
      </h2>
      <p className="text-muted-foreground mt-4 max-w-prose text-[15px] leading-relaxed">
        Seminova&apos;s planning system runs across two tools with a hard
        boundary between them. Requirements flow from planning to
        implementation; repo truth flows back so the next pass starts from what
        is actually shipped.
      </p>
    </div>

    <div className="mx-auto mt-6 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-0">
      {WORKFLOW_ENVIRONMENTS.map((environment) => (
        <MarketingDisplayCard key={environment.name}>
          <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <div className="relative flex h-6 shrink-0 items-center">
              {'srcDark' in environment.logo ? (
                <>
                  <Image
                    src={environment.logo.src}
                    alt=""
                    width={environment.logo.width}
                    height={environment.logo.height}
                    className={cn(environmentLogoClassName, 'dark:hidden')}
                    role="presentation"
                  />
                  <Image
                    src={environment.logo.srcDark}
                    alt=""
                    width={environment.logo.width}
                    height={environment.logo.height}
                    className={cn(
                      environmentLogoClassName,
                      'hidden dark:block',
                    )}
                    role="presentation"
                  />
                </>
              ) : (
                <Image
                  src={environment.logo.src}
                  alt=""
                  width={environment.logo.width}
                  height={environment.logo.height}
                  className={environmentLogoClassName}
                  role="presentation"
                />
              )}
            </div>
            {environment.name}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">Owns</p>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed">
            {environment.owns.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </MarketingDisplayCard>
      ))}
    </div>
  </section>
)
