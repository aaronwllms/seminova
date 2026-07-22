'use client'

// Showroom fixture — mirrors admin BannerSettingRow (related fields + one Save + toast).
// Compact: headline + detail only — not a full banner settings clone.
// Demo-only: referenceDemoMockPersist stub (simulated delay, no DB write).

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { showSuccessToast } from '@/utils/app-toast'

import { referenceDemoMockPersist } from '../_lib/reference-demo-persist'
import {
  referencePerSectionDemoSchema,
  type ReferencePerSectionDemoValues,
} from '../_lib/reference-settings-demo-schema'

const DEFAULT_VALUES: ReferencePerSectionDemoValues = {
  headline: 'Scheduled maintenance tonight',
  detail: 'Expect brief downtime after 11pm.',
}

const SECTION_LABEL = 'Public banner'
const SECTION_ACCORDION_VALUE = 'banner'

const valuesEqual = (
  a: ReferencePerSectionDemoValues,
  b: ReferencePerSectionDemoValues,
): boolean => a.headline === b.headline && a.detail === b.detail

export const ReferencePerSectionFormDemo = () => {
  const [savedValues, setSavedValues] =
    useState<ReferencePerSectionDemoValues>(DEFAULT_VALUES)
  const [isSaving, setIsSaving] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const form = useForm<ReferencePerSectionDemoValues>({
    resolver: zodResolver(referencePerSectionDemoSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  const watchedValues = useWatch({ control: form.control })
  const draftValues: ReferencePerSectionDemoValues = {
    headline: watchedValues.headline ?? form.getValues('headline'),
    detail: watchedValues.detail ?? form.getValues('detail'),
  }
  const isUnchanged = valuesEqual(draftValues, savedValues)
  const isSaveDisabled = isSaving || !form.formState.isValid || isUnchanged

  const handleSave = async () => {
    if (isSaveDisabled) {
      return
    }

    const parsed = referencePerSectionDemoSchema.safeParse(form.getValues())

    if (!parsed.success) {
      return
    }

    setIsSaving(true)

    const result = await referenceDemoMockPersist(parsed.data)

    setIsSaving(false)

    if (!result.success) {
      return
    }

    setSavedValues(result.data)
    form.reset(result.data)
    showSuccessToast(`${SECTION_LABEL} saved`)
  }

  return (
    <Card className="overflow-hidden py-0">
      <Accordion
        type="single"
        collapsible
        value={isExpanded ? SECTION_ACCORDION_VALUE : ''}
        onValueChange={(value) =>
          setIsExpanded(value === SECTION_ACCORDION_VALUE)
        }
      >
        <AccordionItem
          value={SECTION_ACCORDION_VALUE}
          className="border-none px-4"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium">{SECTION_LABEL}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                Shown on the marketing page.
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0 pb-4">
            <Form {...form}>
              <div className="flex flex-col gap-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headline</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSaving} />
                      </FormControl>
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
                        <Input {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={isSaveDisabled}
                    onClick={() => void handleSave()}
                  >
                    {isSaving ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </div>
            </Form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
