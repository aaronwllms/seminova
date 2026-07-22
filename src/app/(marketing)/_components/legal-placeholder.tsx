const LEGAL_GENERATOR_URL =
  'https://app-privacy-policy-generator.firebaseapp.com/'

interface LegalPlaceholderProps {
  title: string
  /** Terms page: note the generator produces both policy types. */
  coversBothPolicies?: boolean
}

export const LegalPlaceholder = ({
  title,
  coversBothPolicies = false,
}: LegalPlaceholderProps) => (
  <div className="flex w-full flex-col gap-4">
    <h1 className="text-2xl font-bold">{title}</h1>
    <div className="max-w-prose font-serif text-[15px] leading-relaxed">
      <p className="text-muted-foreground">
        This is a placeholder for your legal policies. Replace it with your own
        Terms of Service and Privacy Policy when you spin off from the template
        — use a generator or engage counsel.
      </p>
    </div>
    <aside
      aria-label="Policy generator resources"
      className="border-border bg-muted max-w-prose rounded-lg border p-4 text-sm"
    >
      <p>
        Need a starting point? Try the{' '}
        <a
          className="text-primary font-medium underline underline-offset-4"
          href={LEGAL_GENERATOR_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          App Privacy Policy Generator
        </a>
        {coversBothPolicies
          ? ' — it produces both Terms of Service and Privacy Policy drafts.'
          : '.'}
      </p>
      <p className="text-muted-foreground mt-2">
        This is not legal advice. Review any generated policies with qualified
        counsel before publishing.
      </p>
    </aside>
  </div>
)
