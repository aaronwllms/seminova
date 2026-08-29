import {
  APP_SETTINGS_REGISTRY,
  type BannerAppSettingRegistryEntry,
  type NonBannerAppSettingRegistryEntry,
} from '@/config/app-settings-registry'

const partitionRegistry = () => {
  const groupedNonBanner = new Map<string, NonBannerAppSettingRegistryEntry[]>()
  const bannerEntries: BannerAppSettingRegistryEntry[] = []

  for (const entry of APP_SETTINGS_REGISTRY) {
    if (entry.valueType === 'banner') {
      bannerEntries.push(entry)
      continue
    }

    const existing = groupedNonBanner.get(entry.group) ?? []
    groupedNonBanner.set(entry.group, [...existing, entry])
  }

  return { groupedNonBanner, bannerEntries }
}

const { groupedNonBanner, bannerEntries } = partitionRegistry()

export const GROUPED_NON_BANNER_REGISTRY_ENTRIES: ReadonlyMap<
  string,
  NonBannerAppSettingRegistryEntry[]
> = groupedNonBanner

export const BANNER_REGISTRY_ENTRIES: readonly BannerAppSettingRegistryEntry[] =
  bannerEntries
