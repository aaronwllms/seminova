'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { AppErrorSurface } from '@/components/app-error-surface'
import { BlurSaveTextField } from '@/components/blur-save-text-field'
import { Form } from '@/components/ui/form'
import { useBlurSaveField } from '@/hooks/use-blur-save-field'

import {
  referenceDemoFormInputSchema,
  type ReferenceDemoFormInputValues,
  type ReferenceDemoPartialValues,
} from '../_lib/reference-demo-form-schema'
import { referenceDemoPersist } from '../_lib/reference-demo-persist'

const DEFAULT_VALUES: ReferenceDemoFormInputValues = {
  displayName: 'Maya Rodriguez',
}

type ReferenceLastSaved = {
  displayName: string | null
}

export const ReferenceFormsSection = () => {
  const form = useForm<ReferenceDemoFormInputValues>({
    resolver: zodResolver(referenceDemoFormInputSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const { saveStates, formError, createTextBlurHandler } = useBlurSaveField<
    ReferenceDemoFormInputValues,
    'displayName',
    'displayName',
    ReferenceLastSaved,
    ReferenceDemoPartialValues
  >({
    form,
    inFlightKeys: ['displayName'] as const,
    initialLastSaved: {
      displayName: DEFAULT_VALUES.displayName.trim() || null,
    },
    persist: referenceDemoPersist,
    faultFallbackMessage: 'Could not save. Please try again.',
  })

  const handleDisplayNameBlur = createTextBlurHandler('displayName', {
    refresh: false,
    toPayload: (trimmed) => ({ displayName: trimmed }),
    lastSaved: {
      get: (snapshot) => snapshot.displayName,
      set: (snapshot, value) => {
        snapshot.displayName = value
      },
    },
  })

  return (
    <section id="forms" className="py-10">
      <h2 className="text-2xl font-semibold tracking-tight">
        Forms and save models
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Live: blur-save, persisting through a mock function.
      </p>

      <Form {...form}>
        <div className="bg-card mt-5 rounded-xl border p-5">
          <AppErrorSurface error={formError} className="mb-4" />
          <BlurSaveTextField
            control={form.control}
            name="displayName"
            label="Display name"
            placeholder="Your display name"
            controlType="input"
            saveState={saveStates.displayName}
            onSavedComplete={() => undefined}
            onBlurSave={handleDisplayNameBlur}
          />
        </div>
      </Form>

      <p className="mt-5 max-w-prose text-[15px] leading-relaxed">
        The save model is a choice made per field, not per form. Blur-save fits
        a field that&apos;s valid on its own, like a name or a bio. Explicit
        submit fits fields that only mean something together, like a password
        change — see the profile password section in the app shell.
        Upload-on-complete fits files, where the upload finishing is itself the
        save — see avatar upload in profile settings. All three are documented
        in `forms.mdc`, but only blur-save ships as a ready-to-use component
        here — the other two are best understood in place, on the profile page.
      </p>
    </section>
  )
}
