# Archived Cursor plans

Historical Cursor implementation plans — not shipped repo truth. For current routes, auth, and patterns, see [AGENTS.md](../../AGENTS.md).

## Path migration (Phase 6 Epic 2, shipped 2026-06-23)

- `src/app/(admin)/` → `src/app/admin/`
- Admin URLs: `/users` → `/admin/users`; admin home → `/admin`
- Post-login: admins → `/admin` (was `/users`); non-admins → `/profile` (was `/protected`, removed Phase 6 Epic 5)

Migration record: [phase_6_epic_2_admin_namespace_4f36c748.plan.md](phase_6_epic_2_admin_namespace_4f36c748.plan.md)

## Naming migration (Phase 8 Epic 7)

- Canonical data-table shell: `src/components/data-table-shell.tsx` (was `data-table1.tsx`)
- Hook: `useDataTableShell` (was `useDataTable`)

## Do not bulk-edit archived plan bodies

Paths and filenames in these files reflect planning-time layout. Current truth: [AGENTS.md](../../AGENTS.md) and [`src/constants/admin-paths.ts`](../../src/constants/admin-paths.ts).
