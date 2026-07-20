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
      variant="outline"
      value={theme}
      onValueChange={(value) => {
        if (value) {
          setTheme(value)
        }
      }}
      className="justify-start"
    >
      <ToggleGroupItem
        value="light"
        aria-label="Light theme"
        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:hover:bg-accent data-[state=on]:hover:text-accent-foreground data-[state=on]:[&_svg]:text-accent-foreground"
      >
        <Sun size={ICON_SIZE} className="text-muted-foreground" />
        Light
      </ToggleGroupItem>
      <ToggleGroupItem
        value="dark"
        aria-label="Dark theme"
        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:hover:bg-accent data-[state=on]:hover:text-accent-foreground data-[state=on]:[&_svg]:text-accent-foreground"
      >
        <Moon size={ICON_SIZE} className="text-muted-foreground" />
        Dark
      </ToggleGroupItem>
      <ToggleGroupItem
        value="system"
        aria-label="System theme"
        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:hover:bg-accent data-[state=on]:hover:text-accent-foreground data-[state=on]:[&_svg]:text-accent-foreground"
      >
        <Laptop size={ICON_SIZE} className="text-muted-foreground" />
        System
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
