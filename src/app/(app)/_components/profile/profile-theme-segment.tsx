'use client'

import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const ICON_SIZE = 16

export const ProfileThemeSegment = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard for next-themes
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={(value) => {
        if (value) {
          setTheme(value)
        }
      }}
      className="justify-start"
    >
      <ToggleGroupItem value="light" aria-label="Light theme">
        <Sun size={ICON_SIZE} className="text-muted-foreground" />
        Light
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark theme">
        <Moon size={ICON_SIZE} className="text-muted-foreground" />
        Dark
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="System theme">
        <Laptop size={ICON_SIZE} className="text-muted-foreground" />
        System
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
