import { cn } from '@/utils/tailwind'

import { REFERENCE_SECTION_SCROLL_CLASS } from '../_lib/reference-anchor-links'

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
] as const

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
  return (
    <section className="py-10">
      <h2
        id="design-system"
        className={`${REFERENCE_SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
      >
        Design system
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Semantic tokens and type scale from the inherited theme.
      </p>

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
    </section>
  )
}
