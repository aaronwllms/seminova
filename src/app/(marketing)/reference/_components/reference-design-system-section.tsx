import {
  AlertCircle,
  Check,
  InfoIcon,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatLogTimestampDisplay } from '@/app/admin/logs/_lib/format-log-timestamp-display'
import { cn } from '@/utils/tailwind'

import { REFERENCE_SECTION_SCROLL_CLASS } from '../_lib/reference-anchor-links'

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

const REFERENCE_ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: 'Check', Icon: Check },
  { name: 'AlertCircle', Icon: AlertCircle },
  { name: 'Search', Icon: Search },
  { name: 'Users', Icon: Users },
  { name: 'Info', Icon: InfoIcon },
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

export const ReferenceDesignSystemSection = () => {
  const monoTimestampSample = formatLogTimestampDisplay(
    new Date().toISOString(),
  )

  return (
    <section className="py-10">
      <h2
        id="design-system"
        className={`${REFERENCE_SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
      >
        Design system
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Semantic tokens, typography, and icons from the inherited theme.
      </p>

      <Alert variant="info" role="note" className="mt-4">
        <InfoIcon aria-hidden />
        <AlertDescription>
          <p>
            Default theme based on{' '}
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
            — colors, typography, radius, shadows, and spacing.
          </p>
        </AlertDescription>
      </Alert>

      <div className="mt-8">
        <h3 className="text-lg font-semibold tracking-tight">Colors</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Semantic color tokens — values live in globals.css and switch with
          light/dark mode.
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
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-semibold tracking-tight">Fonts</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Font families from the inherited theme — sans, serif, and mono stacks.
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

      <div className="mt-10">
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

      <div className="mt-10">
        <h3 className="text-lg font-semibold tracking-tight">Icons</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Lucide React — shadcn&apos;s default icon library. Import icons by
          name from lucide-react.
        </p>
        <ul className="mt-4 flex flex-wrap gap-4">
          {REFERENCE_ICONS.map(({ name, Icon }) => (
            <li
              key={name}
              className="border-border flex min-w-[7rem] flex-col items-center gap-2 rounded-lg border px-4 py-3"
            >
              <Icon className="size-5" aria-hidden />
              <p className="text-muted-foreground font-mono text-xs">{name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
