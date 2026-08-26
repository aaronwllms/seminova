import { getPageMetadata } from '@/config/site'
import { featuresContent } from '@/config/features-content'
import { SiteContainer } from '@/components/site-container'

import { FeaturesCategorySection } from './_components/features-category-section'

import { features } from '../_lib/page-meta'

export const metadata = getPageMetadata(features)

export default function FeaturesPage() {
  return (
    <main id="main-content" className="bg-background py-12">
      <SiteContainer>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything in the box
          </h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-[15px] leading-relaxed">
            A full inventory of what ships with the template — auth, an admin
            console, a design system, observability, and the agent workflow that
            builds it. This is the whole shelf.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-6xl space-y-10">
          {featuresContent.categories.map((category) => (
            <FeaturesCategorySection key={category.id} category={category} />
          ))}
        </div>
      </SiteContainer>
    </main>
  )
}
