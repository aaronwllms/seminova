'use client'

import { useState } from 'react'

import { APP_SETTINGS_REGISTRY } from '@/config/app-settings-registry'
import { Card } from '@/components/ui/card'
import type { AppSettingKey, ResolvedAppSettings } from '@/types/app-settings'

import { AppSettingRow } from './app-setting-row'

type AppSettingsPanelProps = {
  initialSettings: ResolvedAppSettings
}

const GROUPED_REGISTRY_ENTRIES = (() => {
  const groups = new Map<string, (typeof APP_SETTINGS_REGISTRY)[number][]>()

  for (const entry of APP_SETTINGS_REGISTRY) {
    const existing = groups.get(entry.group) ?? []
    groups.set(entry.group, [...existing, entry])
  }

  return groups
})()

export const AppSettingsPanel = ({
  initialSettings,
}: AppSettingsPanelProps) => {
  const [savedSettings, setSavedSettings] =
    useState<ResolvedAppSettings>(initialSettings)
  const groupedEntries = GROUPED_REGISTRY_ENTRIES

  const handleSaved = <K extends AppSettingKey>(
    key: K,
    value: ResolvedAppSettings[K],
  ) => {
    setSavedSettings((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {[...groupedEntries.entries()].map(([group, entries]) => (
        <section key={group} className="flex flex-col gap-3">
          <h2 className="text-base font-medium">{group}</h2>
          <Card className="overflow-hidden py-0">
            {entries.map((entry) => (
              <AppSettingRow
                key={`${entry.key}-${savedSettings[entry.key]}`}
                entry={entry}
                savedValue={savedSettings[entry.key]}
                onSaved={handleSaved}
              />
            ))}
          </Card>
        </section>
      ))}
    </div>
  )
}
