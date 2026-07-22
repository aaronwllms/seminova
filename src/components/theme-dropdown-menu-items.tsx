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
          className="pl-8"
          onSelect={() => setTheme(value)}
        >
          <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
            {theme === value ? <Check className="size-4" /> : null}
          </span>
          <Icon />
          {label}
        </DropdownMenuItem>
      ))}
    </>
  )
}
