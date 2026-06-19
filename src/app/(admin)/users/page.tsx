import { UsersTable } from './_components/users-table'

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Signed-up accounts from Supabase Auth. Admin promotion stays CLI-only.
        </p>
      </div>
      <UsersTable />
    </div>
  )
}
