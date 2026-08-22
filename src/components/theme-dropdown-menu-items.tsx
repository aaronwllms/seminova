'use client'

import { Check, Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Laptop },
] as const

export const ThemeDropdownMenuItems = () => {
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
    <>
      <DropdownMenuSeparator />
      {THEME_OPTIONS.map(({ value, label, Icon }) => (
        <DropdownMenuItem
          key={value}
          aria-checked={theme === value}
          onSelect={() => {
            setTheme(value)
          }}
        >
          <Icon />
          {label}
          {theme === value ? (
            <Check className="text-muted-foreground ml-auto size-4" />
          ) : null}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
    </>
  )
}
