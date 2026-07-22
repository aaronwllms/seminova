'use client'

import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckIcon,
  ChevronDownIcon,
  ChevronsUpDown,
  Copy,
  InfoIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MoreHorizontal,
  RefreshCw,
  ScrollText,
  Search,
  Settings,
  User,
  Users,
  XIcon,
  type LucideIcon,
} from 'lucide-react'

import { formatLogTimestampDisplay } from '@/app/admin/logs/_lib/format-log-timestamp-display'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/tailwind'

const EXTERNAL_LINK_CLASS = 'text-primary underline-offset-4 hover:underline'

const SEMANTIC_COLOR_TOKENS = [
  { name: 'Primary', cssVar: '--primary', className: 'bg-primary' },
  { name: 'Secondary', cssVar: '--secondary', className: 'bg-secondary' },
  { name: 'Muted', cssVar: '--muted', className: 'bg-muted' },
  { name: 'Accent', cssVar: '--accent', className: 'bg-accent' },
  {
    name: 'Destructive',
    cssVar: '--destructive',
    className: 'bg-destructive',
  },
  { name: 'Success', cssVar: '--success', className: 'bg-success' },
  { name: 'Warning', cssVar: '--warning', className: 'bg-warning' },
  { name: 'Info', cssVar: '--info', className: 'bg-info' },
] as const

const FONT_STACKS = [
  {
    name: 'Inter',
    role: 'Default UI — body, headings, and chrome',
    utility: 'font-sans',
    sample: 'The quick brown fox jumps over the lazy dog.',
    mono: false,
  },
  {
    name: 'Merriweather',
    role: 'Long-form — terms and privacy policy content',
    utility: 'font-serif',
    sample: 'The quick brown fox jumps over the lazy dog.',
    mono: false,
  },
  {
    name: 'JetBrains Mono',
    role: 'Monospace — codes, tags, paths, and structured data',
    utility: 'font-mono',
    mono: true,
  },
] as const

/** Most-used Lucide exports in src/ (by import frequency). */
const REFERENCE_ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: 'AlertCircle', Icon: AlertCircle },
  { name: 'AlertTriangle', Icon: AlertTriangle },
  { name: 'Check', Icon: Check },
  { name: 'CheckIcon', Icon: CheckIcon },
  { name: 'ChevronDownIcon', Icon: ChevronDownIcon },
  { name: 'ChevronsUpDown', Icon: ChevronsUpDown },
  { name: 'Copy', Icon: Copy },
  { name: 'InfoIcon', Icon: InfoIcon },
  { name: 'LayoutDashboard', Icon: LayoutDashboard },
  { name: 'Loader2', Icon: Loader2 },
  { name: 'LogOut', Icon: LogOut },
  { name: 'Menu', Icon: Menu },
  { name: 'MoreHorizontal', Icon: MoreHorizontal },
  { name: 'RefreshCw', Icon: RefreshCw },
  { name: 'ScrollText', Icon: ScrollText },
  { name: 'Search', Icon: Search },
  { name: 'Settings', Icon: Settings },
  { name: 'User', Icon: User },
  { name: 'Users', Icon: Users },
  { name: 'XIcon', Icon: XIcon },
]

const TYPE_SCALE_SAMPLES = [
  {
    label: 'H1 — Page title',
    className: 'text-3xl font-bold tracking-tight sm:text-4xl',
    sample: 'What you inherit',
  },
  {
    label: 'H2 — Section title',
    className: 'text-2xl font-semibold tracking-tight',
    sample: 'Forms and save models',
  },
  {
    label: 'H3 — Subsection title',
    className: 'text-lg font-semibold tracking-tight',
    sample: 'Explicit submit',
  },
  {
    label: 'Body',
    className: 'text-[15px] leading-relaxed',
    sample: 'Every component below is the one your spinoff imports.',
  },
  {
    label: 'Small',
    className: 'text-muted-foreground text-sm',
    sample: 'Live: blur-save, persisting through a mock function.',
  },
] as const

/** Fixed sample — matches formatLogTimestampDisplay unit test input (not live time). */
const REFERENCE_MONO_TIMESTAMP_ISO = '2026-07-18T14:32:07.412Z'

export const ReferenceDesignSystemTabs = () => {
  const monoTimestampSample = formatLogTimestampDisplay(
    REFERENCE_MONO_TIMESTAMP_ISO,
  )

  return (
    <Tabs defaultValue="colors" className="mt-8">
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="colors" className="flex-1 sm:flex-none">
          Colors
        </TabsTrigger>
        <TabsTrigger value="typography" className="flex-1 sm:flex-none">
          Typography
        </TabsTrigger>
        <TabsTrigger value="icons" className="flex-1 sm:flex-none">
          Icons
        </TabsTrigger>
      </TabsList>

      <TabsContent value="colors" className="mt-6">
        <p className="text-muted-foreground max-w-prose text-[15px] leading-relaxed">
          Semantic color tokens — values live in globals.css and switch with
          light/dark mode. Default theme based on{' '}
          <a
            href="https://tweakcn.com/editor/theme?p=dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className={EXTERNAL_LINK_CLASS}
          >
            Clean Slate
          </a>{' '}
          from{' '}
          <a
            href="https://tweakcn.com"
            target="_blank"
            rel="noopener noreferrer"
            className={EXTERNAL_LINK_CLASS}
          >
            tweakcn
          </a>
          .
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SEMANTIC_COLOR_TOKENS.map((token) => (
            <li key={token.cssVar} className="flex flex-col gap-2">
              <div
                className={cn('h-16 rounded-lg border', token.className)}
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium">{token.name}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {token.cssVar}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="typography" className="mt-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Type scale</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Heading and body styles used across marketing and app surfaces.
            </p>
            <ul className="mt-4 flex flex-col gap-6">
              {TYPE_SCALE_SAMPLES.map((sample) => (
                <li key={sample.label} className="flex flex-col gap-1">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {sample.label}
                  </p>
                  <p className={sample.className}>{sample.sample}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              Font families
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Sans, serif, and mono stacks from the inherited theme.
            </p>
            <ul className="mt-4 flex flex-col gap-6">
              {FONT_STACKS.map((font) => (
                <li key={font.name} className="flex flex-col gap-1">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {font.name}
                  </p>
                  <p className="text-muted-foreground text-xs">{font.role}</p>
                  {font.mono ? (
                    <p className="mt-1 font-mono text-sm tabular-nums">
                      {monoTimestampSample}
                    </p>
                  ) : (
                    <p className={cn(font.utility, 'mt-1')}>{font.sample}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="icons" className="mt-6">
        <p className="text-muted-foreground text-sm">
          <a
            href="https://lucide.dev/guide/packages/lucide-react"
            target="_blank"
            rel="noopener noreferrer"
            className={EXTERNAL_LINK_CLASS}
          >
            Lucide React
          </a>{' '}
          — shadcn&apos;s default icon library. Import icons by name from
          lucide-react.
        </p>
        <ul className="mt-4 grid grid-cols-4 gap-3 sm:gap-4">
          {REFERENCE_ICONS.map(({ name, Icon }) => (
            <li
              key={name}
              className="border-border flex flex-col items-center gap-2 rounded-lg border px-2 py-3 sm:px-4"
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <p className="text-muted-foreground text-center font-mono text-xs break-all">
                {name}
              </p>
            </li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  )
}
