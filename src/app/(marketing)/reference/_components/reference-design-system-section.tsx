import { SECTION_SCROLL_CLASS } from '@/constants/section-scroll'
import { ReferenceDesignSystemTabs } from './reference-design-system-tabs'

export const ReferenceDesignSystemSection = () => {
  return (
    <section className="py-10">
      <h2
        id="design-system"
        className={`${SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
      >
        Design system
      </h2>

      <ReferenceDesignSystemTabs />
    </section>
  )
}
