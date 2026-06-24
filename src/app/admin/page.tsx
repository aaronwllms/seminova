import { Users } from 'lucide-react'
import Link from 'next/link'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ADMIN_USERS } from '@/constants/admin-paths'

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
      <Link href={ADMIN_USERS} className="max-w-sm">
        <Card className="hover:bg-muted/50 transition-colors">
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
    </div>
  )
}
