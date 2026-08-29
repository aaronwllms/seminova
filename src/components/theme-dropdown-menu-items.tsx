'use client'

import { Check, Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useMounted } from '@/hooks/use-mounted'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Laptop },
] as const

export const ThemeDropdownMenuItems = () => {
  const mounted = useMounted()
  const { theme, setTheme } = useTheme()

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
