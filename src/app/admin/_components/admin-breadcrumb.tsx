'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ADMIN_HOME } from '@/constants/admin-paths'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const BREADCRUMB_LABELS: Record<string, string> = {
  admin: 'Admin',
  users: 'Users',
}

export const AdminBreadcrumb = () => {
  const pathname = usePathname()
  const isDashboard = pathname === ADMIN_HOME
  const segments = pathname.split('/').filter(Boolean)
  const currentSegment = segments.at(-1) ?? ''
  const currentLabel = BREADCRUMB_LABELS[currentSegment] ?? currentSegment

  if (isDashboard) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Admin</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href={ADMIN_HOME}>Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {currentLabel ? (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
