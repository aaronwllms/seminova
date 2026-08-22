'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { BannerPreviewThemeWrapper } from '@/app/admin/settings/_components/banner-preview-theme-wrapper'
import { BannerStartsAtField } from '@/app/admin/settings/_components/banner-starts-at-field'
import { saveAppSettingAction } from '@/app/admin/settings/_lib/actions'
import { AppBanner } from '@/components/app-banner'
import { AppErrorSurface } from '@/components/app-error-surface'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { AppSettingRegistryEntry } from '@/types/app-settings'
import type {
  BannerPersistence,
  BannerSettingValue,
  BannerVariant,
} from '@/types/banner'
import {
  BANNER_MODES,
  BANNER_PERSISTENCES,
  BANNER_VARIANTS,
} from '@/types/banner'
import type { AppError } from '@/types/app-error'
import { showSuccessToast } from '@/utils/app-toast'
import {
  bannerSettingFormSchema,
  bannerSettingValuesEqual,
  bannerValueToFormValues,
  formValuesToBannerValue,
  type BannerSettingFormValues,
} from '@/utils/banner-settings-schema'
import {
  BANNER_STATUS_BADGE_CLASSES,
  formatBannerStatusBadge,
} from '@/utils/format-banner-status-badge'
import { cn } from '@/utils/tailwind'

type BannerAppSettingRegistryEntry = Extract<
  AppSettingRegistryEntry,
  { readonly key: 'banner_public' | 'banner_authenticated' }
>

type BannerSettingRowProps = {
  entry: BannerAppSettingRegistryEntry
  savedValue: BannerSettingValue
  isExpanded: boolean
  onSaved: (
    key: BannerAppSettingRegistryEntry['key'],
    value: BannerSettingValue,
  ) => void
}

const MODE_LABELS: Record<(typeof BANNER_MODES)[number], string> = {
  off: 'Off',
  on: 'On',
  scheduled: 'Scheduled',
}

const PERSISTENCE_LABELS: Record<BannerPersistence, string> = {
  dismissible: 'Dismissible',
  persistent: 'Persistent',
}

const PERSISTENCE_HELP =
  "Persistent banners stay in view and cannot be dismissed. Use them for messages a user can't afford to miss."

const formatVariantLabel = (variant: BannerVariant): string =>
  variant.charAt(0).toUpperCase() + variant.slice(1)

const BANNER_COPY_SYNTAX_HINT =
  'Supports bold via **text** and links via [text](url).'

export const hasBannerPreviewContent = (value: BannerSettingValue): boolean =>
  value.headline.trim().length > 0

export const BannerSettingRow = ({
  entry,
  savedValue,
  isExpanded,
  onSaved,
}: BannerSettingRowProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [previewThemeOverride, setPreviewThemeOverride] = useState<
    'light' | 'dark' | null
  >(null)
  const { resolvedTheme } = useTheme()
  const previewTheme =
    previewThemeOverride ?? (resolvedTheme === 'dark' ? 'dark' : 'light')

  const statusBadge = formatBannerStatusBadge(savedValue)

  const form = useForm<BannerSettingFormValues>({
    resolver: zodResolver(bannerSettingFormSchema),
    defaultValues: bannerValueToFormValues(savedValue),
    mode: 'onChange',
  })

  const watchedValues = useWatch({ control: form.control })
  const draftMode = watchedValues?.mode ?? form.getValues('mode')
  const draftHeadline = watchedValues?.headline ?? form.getValues('headline')
  const draftDetail = watchedValues?.detail ?? form.getValues('detail')
  const draftBanner = formValuesToBannerValue({
    ...form.getValues(),
    ...watchedValues,
  })
  const isUnchanged = bannerSettingValuesEqual(draftBanner, savedValue)
  const isSaveDisabled = isSaving || !form.formState.isValid || isUnchanged
  const previewConfig = isExpanded ? draftBanner : savedValue
  const showPreview = hasBannerPreviewContent(previewConfig)

  useEffect(() => {
    form.reset(bannerValueToFormValues(savedValue))
  }, [form, savedValue])

  const handleSave = async () => {
    if (isSaveDisabled) {
      return
    }

    const parsed = bannerSettingFormSchema.safeParse(form.getValues())

    if (!parsed.success) {
      return
    }

    const nextValue = formValuesToBannerValue(parsed.data)

    setIsSaving(true)
    setError(null)

    const result = await saveAppSettingAction({
      key: entry.key,
      value: nextValue,
    })

    setIsSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    onSaved(entry.key, result.data.value as BannerSettingValue)
    showSuccessToast(`${entry.label} saved`)
  }

  return (
    <AccordionItem value={entry.key} className="border-b px-4 last:border-b-0">
      <AccordionTrigger className="hover:no-underline">
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-medium">{entry.label}</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-muted-foreground min-w-0 flex-1 text-sm leading-relaxed">
              {entry.description}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              {!isUnchanged ? (
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  Unsaved changes
                </span>
              ) : null}
              <Badge
                className={cn(
                  'shrink-0',
                  BANNER_STATUS_BADGE_CLASSES[statusBadge.tone],
                )}
              >
                {statusBadge.label}
              </Badge>
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pt-0 pb-4">
        <Form {...form}>
          <div className="flex flex-col gap-4 border-t pt-4">
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value)
                          setError(null)
                        }
                      }}
                      className="w-full"
                      disabled={isSaving}
                    >
                      {BANNER_MODES.map((mode) => (
                        <ToggleGroupItem
                          key={mode}
                          value={mode}
                          aria-label={MODE_LABELS[mode]}
                          className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground flex-1"
                        >
                          {MODE_LABELS[mode]}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {draftMode === 'scheduled' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="starts_at_local"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starts</FormLabel>
                      <FormControl>
                        <BannerStartsAtField
                          value={field.value}
                          disabled={isSaving}
                          onChange={(value) => {
                            field.onChange(value)
                            setError(null)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expires_at_local"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          disabled={isSaving}
                          onChange={(event) => {
                            field.onChange(event.target.value)
                            setError(null)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSaving}
                      onChange={(event) => {
                        field.onChange(event.target.value)
                        setError(null)
                      }}
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    {BANNER_COPY_SYNTAX_HINT}
                  </p>
                  <p className="text-muted-foreground text-right text-xs">
                    {draftHeadline.length} / 80
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="detail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detail (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSaving}
                      onChange={(event) => {
                        field.onChange(event.target.value)
                        setError(null)
                      }}
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    {BANNER_COPY_SYNTAX_HINT}
                  </p>
                  <p className="text-muted-foreground text-right text-xs">
                    {draftDetail.length} / 100
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
              <FormField
                control={form.control}
                name="variant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        setError(null)
                      }}
                      disabled={isSaving}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BANNER_VARIANTS.map((variant) => (
                          <SelectItem key={variant} value={variant}>
                            {formatVariantLabel(variant)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_icon"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0 pb-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        disabled={isSaving}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true)
                          setError(null)
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Show icon</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="persistence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persistence</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value)
                          setError(null)
                        }
                      }}
                      className="w-full"
                      disabled={isSaving}
                    >
                      {BANNER_PERSISTENCES.map((persistence) => (
                        <ToggleGroupItem
                          key={persistence}
                          value={persistence}
                          aria-label={PERSISTENCE_LABELS[persistence]}
                          className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground flex-1"
                        >
                          {PERSISTENCE_LABELS[persistence]}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    {PERSISTENCE_HELP}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showPreview ? (
              <div className="flex items-center justify-between gap-3">
                <FormLabel className="mb-0">Preview</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewThemeOverride((current) => {
                      const activeTheme =
                        current ?? (resolvedTheme === 'dark' ? 'dark' : 'light')

                      return activeTheme === 'light' ? 'dark' : 'light'
                    })
                  }
                >
                  {previewTheme === 'light' ? 'Preview dark' : 'Preview light'}
                </Button>
              </div>
            ) : null}
          </div>
        </Form>
      </AccordionContent>

      {showPreview ? (
        <div className={cn(isExpanded ? 'pb-4' : 'pb-3')}>
          <BannerPreviewThemeWrapper theme={previewTheme}>
            <AppBanner preview config={previewConfig} />
          </BannerPreviewThemeWrapper>
        </div>
      ) : null}

      {isExpanded ? (
        <div className="flex flex-col gap-2 border-t pt-4 pb-4">
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={isSaveDisabled}
              onClick={() => void handleSave()}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
          <AppErrorSurface error={error} />
        </div>
      ) : null}
    </AccordionItem>
  )
}
