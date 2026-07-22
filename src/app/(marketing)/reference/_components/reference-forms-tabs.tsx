'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ReferencePerRowFormDemo } from './reference-per-row-form-demo'
import { ReferencePerSectionFormDemo } from './reference-per-section-form-demo'
import { ReferenceProfileSettingsPreview } from './reference-profile-settings-preview'

export const ReferenceFormsTabs = () => {
  return (
    <Tabs defaultValue="profile" className="mt-8">
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="profile" className="flex-1 sm:flex-none">
          Profile
        </TabsTrigger>
        <TabsTrigger value="per-row" className="flex-1 sm:flex-none">
          Per-row
        </TabsTrigger>
        <TabsTrigger value="per-section" className="flex-1 sm:flex-none">
          Per-section
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <p className="text-muted-foreground text-sm">
          Blur-save and upload-on-complete use an inline indicator; coupled
          password change uses explicit submit and a toast.
        </p>
        <div className="mt-4">
          <ReferenceProfileSettingsPreview />
        </div>
      </TabsContent>

      <TabsContent value="per-row" className="mt-6">
        <p className="text-muted-foreground text-sm">
          Independent admin config — one field, Save, toast. Use when each value
          stands alone.
        </p>
        <div className="mt-4">
          <ReferencePerRowFormDemo />
        </div>
      </TabsContent>

      <TabsContent value="per-section" className="mt-6">
        <p className="text-muted-foreground text-sm">
          Related admin fields commit as one unit — Save and toast. Use when the
          block must stay consistent.
        </p>
        <div className="mt-4">
          <ReferencePerSectionFormDemo />
        </div>
      </TabsContent>
    </Tabs>
  )
}
