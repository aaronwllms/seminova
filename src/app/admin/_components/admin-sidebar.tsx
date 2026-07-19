'use client'

import { ScrollText, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { syncAdminSettingsVisitKey } from '@/app/admin/settings/_lib/admin-settings-visit-key'
import { SeminovaLogo } from '@/components/seminova-logo'
import {
  ADMIN_LOGS,
  ADMIN_SETTINGS,
  ADMIN_USERS,
} from '@/constants/admin-paths'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

const NAV_ITEMS = [
  { title: 'Users', href: ADMIN_USERS, icon: Users },
  { title: 'Logs', href: ADMIN_LOGS, icon: ScrollText },
  { title: 'Settings', href: ADMIN_SETTINGS, icon: Settings },
] as const

type AdminSidebarProps = {
  navUserSlot: React.ReactNode
}

export const AdminSidebar = ({ navUserSlot }: AdminSidebarProps) => {
  const pathname = usePathname()
  syncAdminSettingsVisitKey(pathname)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <SeminovaLogo href="/" className="hover:bg-transparent" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{navUserSlot}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
