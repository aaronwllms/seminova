import type { Metadata } from 'next'
import { ScrollText, Settings, Users } from 'lucide-react'
import Link from 'next/link'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ADMIN_LOGS,
  ADMIN_SETTINGS,
  ADMIN_USERS,
} from '@/constants/admin-paths'

export const metadata: Metadata = {
  title: 'Admin',
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-muted-foreground text-sm">
          Console home for managing Seminova. Add more admin pages under this
          section as your product grows.
        </p>
      </div>
      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <Link href={ADMIN_USERS} className="block">
          <Card className="hover:bg-muted/50 duration-swept h-full transition-colors">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Users className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">Users</CardTitle>
                <CardDescription>
                  View accounts, search by email, and manage admin roles.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href={ADMIN_LOGS} className="block">
          <Card className="hover:bg-muted/50 duration-swept h-full transition-colors">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                <ScrollText className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">Logs</CardTitle>
                <CardDescription>
                  Browse runtime application logs with cursor paging.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href={ADMIN_SETTINGS} className="block">
          <Card className="hover:bg-muted/50 duration-swept h-full transition-colors">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Settings className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">Settings</CardTitle>
                <CardDescription>
                  Edit runtime configuration. Changes take effect immediately.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
