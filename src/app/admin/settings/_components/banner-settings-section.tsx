'use client'

import { useEffect, useState } from 'react'

import { useResetOnChange } from '@/hooks/use-reset-on-change'
import { usePathname } from 'next/navigation'

import { BANNER_REGISTRY_ENTRIES } from '@/app/admin/settings/_lib/app-settings-partition'
import { syncAdminSettingsVisitKey } from '@/app/admin/settings/_lib/admin-settings-visit-key'
import {
  APP_SETTINGS_GROUP_BANNERS,
  type AppSettingKey,
  type ResolvedAppSettings,
} from '@/config/app-settings-registry'
import { Accordion } from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import type { BannerSettingValue } from '@/types/banner'

import { BannerSettingRow } from './banner-setting-row'

type BannerSettingsSectionProps = {
  savedSettings: ResolvedAppSettings
  onSaved: (key: AppSettingKey, value: BannerSettingValue) => void
}

export const BannerSettingsSection = ({
  savedSettings,
  onSaved,
}: BannerSettingsSectionProps) => {
  const pathname = usePathname()
  const settingsVisitKey = syncAdminSettingsVisitKey(pathname)
  const [openItem, setOpenItem] = useState('')

  useResetOnChange(settingsVisitKey, () => setOpenItem(''))

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setOpenItem('')
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-medium">{APP_SETTINGS_GROUP_BANNERS}</h2>
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
