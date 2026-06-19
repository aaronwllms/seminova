import type { LandingFeature } from '@/config/landing-content'

type LandingFeatureItemProps = {
  feature: LandingFeature
}

export const LandingFeatureItem = ({ feature }: LandingFeatureItemProps) => {
  const Icon = feature.icon

  return (
    <div className="flex gap-6 md:block md:space-y-4">
      <span className="bg-accent flex size-10 shrink-0 items-center justify-center rounded-full md:size-12">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <h3 className="font-medium tracking-tight md:mb-2 md:text-xl">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          {feature.description}
        </p>
      </div>
    </div>
  )
}
