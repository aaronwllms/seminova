import { SeminovaLogo } from '@/components/seminova-logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SeminovaLogo href="/" className="text-foreground justify-center" />
        {children}
      </div>
    </div>
  )
}
