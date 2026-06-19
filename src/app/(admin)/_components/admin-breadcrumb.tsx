'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const BREADCRUMB_LABELS: Record<string, string> = {
  users: 'Users',
}

export const AdminBreadcrumb = () => {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const currentSegment = segments.at(-1) ?? ''
  const currentLabel = BREADCRUMB_LABELS[currentSegment] ?? currentSegment

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/users">Home</Link>
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
