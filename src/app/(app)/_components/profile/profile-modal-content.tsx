'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { usePasswordAccordionScroll } from '@/hooks/use-password-accordion-scroll'

import type { ProfileFormValues } from '@/app/(app)/_lib/profile/profile-form-schema'

import { ProfilePasswordSection } from './profile-password-section'
import { ProfileSettingsForm } from './profile-settings-form'
import { ProfileThemeSegment } from './profile-theme-segment'

const PASSWORD_ACCORDION_VALUE = 'password'

type ProfileModalContentProps = {
  userId: string
  email: string
  defaultValues: ProfileFormValues
}

export const ProfileModalContent = ({
  userId,
  email,
  defaultValues,
}: ProfileModalContentProps) => {
  const { passwordSectionRef, handleAccordionValueChange } =
    usePasswordAccordionScroll()

  return (
    <div className="flex w-full flex-col gap-6">
      <ProfileSettingsForm
        userId={userId}
        email={email}
        defaultValues={defaultValues}
      />

      <Separator className="bg-border/40" />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Appearance</h2>
          <p className="text-muted-foreground text-sm">
            Choose light, dark, or system theme for the app.
          </p>
        </div>
        <ProfileThemeSegment />
      </section>

      <Separator className="bg-border/40" />

      <Accordion
        type="single"
        collapsible
        onValueChange={handleAccordionValueChange}
      >
        <div ref={passwordSectionRef}>
          <AccordionItem
            value={PASSWORD_ACCORDION_VALUE}
            className="border-none"
          >
            <AccordionTrigger className="hover:bg-muted px-2 hover:no-underline">
              Change Password
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <ProfilePasswordSection email={email} />
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>
    </div>
  )
}
