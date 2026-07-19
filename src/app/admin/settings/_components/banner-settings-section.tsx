'use client'

import { useState } from 'react'

import { APP_SETTINGS_REGISTRY } from '@/config/app-settings-registry'
import { Accordion } from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import type { AppSettingKey, ResolvedAppSettings } from '@/types/app-settings'
import type { BannerSettingValue } from '@/types/banner'

import { BannerSettingRow } from './banner-setting-row'

type BannerSettingsSectionProps = {
  savedSettings: ResolvedAppSettings
  onSaved: (key: AppSettingKey, value: BannerSettingValue) => void
}

const BANNER_REGISTRY_ENTRIES = APP_SETTINGS_REGISTRY.filter(
  (entry) => entry.valueType === 'banner',
)

export const BannerSettingsSection = ({
  savedSettings,
  onSaved,
}: BannerSettingsSectionProps) => {
  const [openItem, setOpenItem] = useState('')

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-medium">Banners</h2>
      <Card className="overflow-hidden py-0">
        <Accordion
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
        >
          {BANNER_REGISTRY_ENTRIES.map((entry) => (
            <BannerSettingRow
              key={entry.key}
              entry={entry}
              savedValue={savedSettings[entry.key]}
              isExpanded={openItem === entry.key}
              onSaved={onSaved}
            />
          ))}
        </Accordion>
      </Card>
    </section>
  )
}
