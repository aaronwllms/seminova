import { Skeleton } from '@/components/ui/skeleton'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export const AdminNavUserSkeleton = () => (
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        disabled
        aria-busy="true"
        aria-label="Loading account menu"
      >
        <Skeleton className="h-8 w-8 rounded-lg" aria-hidden="true" />
        <Skeleton className="h-3 flex-1" aria-hidden="true" />
        <Skeleton className="ml-auto size-4" aria-hidden="true" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
)
