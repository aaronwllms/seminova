import type { FeatureCategory } from '@/config/features-content'

import { FeatureCapabilityCard } from './feature-capability-card'

type FeaturesCategorySectionProps = {
  category: FeatureCategory
}

export const FeaturesCategorySection = ({
  category,
}: FeaturesCategorySectionProps) => {
  const CategoryIcon = category.icon

  return (
    <section aria-labelledby={`features-${category.id}`}>
      <div className="mb-4 flex items-center gap-2.5 px-0.5">
        <CategoryIcon className="text-muted-foreground size-5" aria-hidden />
        <h2
          id={`features-${category.id}`}
          className="text-lg font-medium tracking-tight"
        >
          {category.name}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.capabilities.map((capability) => (
          <FeatureCapabilityCard
            key={capability.name}
            capability={capability}
          />
        ))}
      </div>
    </section>
  )
}
