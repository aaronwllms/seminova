import { Skeleton } from '@/components/ui/skeleton'

export const AdminShellSkeleton = () => (
  <div className="flex min-h-screen w-full">
    <aside
      aria-hidden
      className="bg-sidebar hidden w-64 shrink-0 border-r md:block"
    >
      <div className="flex flex-col gap-6 p-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
        <Skeleton className="mt-auto h-10 w-full" />
      </div>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  </div>
)
