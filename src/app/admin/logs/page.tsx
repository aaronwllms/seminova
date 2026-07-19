import type { Metadata } from 'next'

import { LogsTable } from './_components/logs-table'

export const metadata: Metadata = {
  title: 'Logs',
}

export default function AdminLogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Logs</h1>
        <p className="text-muted-foreground text-sm">
          Runtime application logs.
        </p>
      </div>
      <LogsTable />
    </div>
  )
}
