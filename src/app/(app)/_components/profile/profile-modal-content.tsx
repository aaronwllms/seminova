'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

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
  hasPassword: boolean
  defaultValues: ProfileFormValues
}

export const ProfileModalContent = ({
  userId,
  email,
  hasPassword: initialHasPassword,
  defaultValues,
}: ProfileModalContentProps) => {
  const router = useRouter()
  const [hasPassword, setHasPassword] = useState(initialHasPassword)
  const { passwordSectionRef, handleAccordionValueChange } =
    usePasswordAccordionScroll()

  const handleFirstPasswordSet = useCallback(() => {
    setHasPassword(true)
    router.refresh()
  }, [router])

  return (
    <div className="flex w-full flex-col gap-6">
      <ProfileSettingsForm
        userId={userId}
        email={email}
        defaultValues={defaultValues}
      />

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Appearance</h2>
          <p className="text-muted-foreground text-sm">
            Choose light, dark, or system theme for the app.
          </p>
        </div>
        <ProfileThemeSegment />
      </section>

      <Separator />

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
            {/* debt: drop px-2 when the trigger is restyled — extra horizontal padding breaks the modal content column */}
            <AccordionTrigger className="hover:bg-muted px-2 hover:no-underline">
              {hasPassword ? 'Change Password' : 'Set Password'}
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <ProfilePasswordSection
                email={email}
                hasPassword={hasPassword}
                onFirstPasswordSet={handleFirstPasswordSet}
              />
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>
    </div>
  )
}
