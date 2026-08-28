export function OrDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-card text-muted-foreground px-2">or</span>
      </div>
    </div>
  )
}
