'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { BannerPreviewThemeWrapper } from '@/app/admin/settings/_components/banner-preview-theme-wrapper'
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
import type { BannerSettingValue, BannerVariant } from '@/types/banner'
import { BANNER_MODES, BANNER_VARIANTS } from '@/types/banner'
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

type BannerSettingRowProps<
  K extends 'banner_public' | 'banner_authenticated' = 'banner_public',
> = {
  entry: AppSettingRegistryEntry<K>
  savedValue: BannerSettingValue
  isExpanded: boolean
  onSaved: (key: K, value: BannerSettingValue) => void
}

const MODE_LABELS: Record<(typeof BANNER_MODES)[number], string> = {
  off: 'Off',
  on: 'On',
  scheduled: 'Scheduled',
}

const formatVariantLabel = (variant: BannerVariant): string =>
  variant.charAt(0).toUpperCase() + variant.slice(1)

export const hasBannerPreviewContent = (value: BannerSettingValue): boolean =>
  value.headline.trim().length > 0

export const BannerSettingRow = <
  K extends 'banner_public' | 'banner_authenticated',
>({
  entry,
  savedValue,
  isExpanded,
  onSaved,
}: BannerSettingRowProps<K>) => {
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
            <p className="text-muted-foreground text-sm leading-relaxed">
              {entry.description}
            </p>
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
                      <div className="flex items-center gap-2">
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
                        {field.value ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSaving}
                            onClick={() => {
                              field.onChange('')
                              setError(null)
                            }}
                          >
                            Clear
                          </Button>
                        ) : null}
                      </div>
                      {!field.value ? (
                        <p className="text-muted-foreground text-xs">Now</p>
                      ) : null}
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

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                disabled={isSaveDisabled}
                onClick={() => void handleSave()}
              >
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
              <AppErrorSurface error={error} />
            </div>

            {showPreview ? (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between gap-3">
                  <FormLabel className="mb-0">Preview</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPreviewThemeOverride((current) => {
                        const activeTheme =
                          current ??
                          (resolvedTheme === 'dark' ? 'dark' : 'light')

                        return activeTheme === 'light' ? 'dark' : 'light'
                      })
                    }
                  >
                    {previewTheme === 'light'
                      ? 'Preview dark'
                      : 'Preview light'}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </Form>
      </AccordionContent>

      {showPreview ? (
        <div className="pb-3">
          <BannerPreviewThemeWrapper theme={previewTheme}>
            <AppBanner preview config={previewConfig} />
          </BannerPreviewThemeWrapper>
        </div>
      ) : null}
    </AccordionItem>
  )
}
