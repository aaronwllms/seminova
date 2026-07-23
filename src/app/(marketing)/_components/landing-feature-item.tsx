import type { FeatureCapability } from '@/config/features-content'

type LandingFeatureItemProps = {
  capability: FeatureCapability
}

export const LandingFeatureItem = ({ capability }: LandingFeatureItemProps) => {
  const Icon = capability.icon

  return (
    <div className="flex gap-6 md:block md:space-y-4">
      <span className="bg-accent flex size-10 shrink-0 items-center justify-center rounded-full md:size-12">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <h3 className="font-medium tracking-tight md:mb-2 md:text-xl">
          {capability.name}
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          {capability.blurb}
        </p>
      </div>
    </div>
  )
}
