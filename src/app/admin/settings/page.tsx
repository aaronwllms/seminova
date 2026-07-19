import type { Metadata } from 'next'

import { getResolvedAppSettings } from '@/utils/app-settings'

import { AppSettingsPanel } from './_components/app-settings-panel'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function AdminSettingsPage() {
  const settings = await getResolvedAppSettings()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Runtime configuration. Changes take effect immediately, no redeploy.
        </p>
      </div>
      <AppSettingsPanel initialSettings={settings} />
    </div>
  )
}
