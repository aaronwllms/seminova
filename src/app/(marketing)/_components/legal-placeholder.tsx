type LegalPlaceholderProps = {
  title: string
}

export const LegalPlaceholder = ({ title }: LegalPlaceholderProps) => (
  <div className="flex w-full flex-col gap-2">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-muted-foreground max-w-prose text-sm">
      This is a placeholder for your legal policies. Replace it with your own
      Terms of Service and Privacy Policy when you spin off from the template —
      use a generator or engage counsel.
    </p>
  </div>
)
