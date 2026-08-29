'use client'

import { useState } from 'react'

import { GROUPED_NON_BANNER_REGISTRY_ENTRIES } from '@/app/admin/settings/_lib/app-settings-partition'
import type {
  AppSettingKey,
  ResolvedAppSettings,
} from '@/config/app-settings-registry'
import { Card } from '@/components/ui/card'

import { AppSettingRow } from './app-setting-row'
import { BannerSettingsSection } from './banner-settings-section'

type AppSettingsPanelProps = {
  initialSettings: ResolvedAppSettings
}

export const AppSettingsPanel = ({
  initialSettings,
}: AppSettingsPanelProps) => {
  const [savedSettings, setSavedSettings] =
    useState<ResolvedAppSettings>(initialSettings)

  const handleSaved = <K extends AppSettingKey>(
    key: K,
    value: ResolvedAppSettings[K],
  ) => {
    setSavedSettings((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {[...GROUPED_NON_BANNER_REGISTRY_ENTRIES.entries()].map(
        ([group, entries]) => (
          <section key={group} className="flex flex-col gap-3">
            <h2 className="text-base font-medium">{group}</h2>
            <Card className="overflow-hidden py-0">
              {entries.map((entry) => (
                <AppSettingRow
                  key={entry.key}
                  entry={entry}
                  savedSettings={savedSettings}
                  onSaved={handleSaved}
                />
              ))}
            </Card>
          </section>
        ),
      )}
      <BannerSettingsSection
        savedSettings={savedSettings}
        onSaved={handleSaved}
      />
    </div>
  )
}
