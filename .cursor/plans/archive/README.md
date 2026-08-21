# Archived Cursor plans

Historical Cursor implementation plans — not shipped product truth. Part of the [Cursor configuration layout](../../README.md). For current routes, auth, and patterns, see the code ([LEXICON.md](../../../LEXICON.md) and [AGENTS.md](../../../AGENTS.md) § Hard constraints as needed).

**Cursor indexing:** this directory is in [`.cursorindexingignore`](../../../.cursorindexingignore) — excluded from @Codebase search, still readable via @-mention. See [`.cursor/README.md` › Ignore files](../../README.md#ignore-files-repo-root).

## Path migration (Phase 6 Epic 2, shipped 2026-06-23)

- `src/app/(admin)/` → `src/app/admin/`
- Admin URLs: `/users` → `/admin/users`; admin home → `/admin`
- Post-login: admins → `/admin` (was `/users`); non-admins → `/profile` (was `/protected`, removed Phase 6 Epic 5)

Migration record: [phase_6_epic_2_admin_namespace_4f36c748.plan.md](phase_6_epic_2_admin_namespace_4f36c748.plan.md)

## Naming migration (Phase 8 Epic 7)

- Canonical data-table shell: `src/components/data-table-shell.tsx` (was `data-table1.tsx`)
- Hook: `useDataTableShell` (was `useDataTable`)

Migration record: [phase_8_epic_7_types_eb5ab925.plan.md](phase_8_epic_7_types_eb5ab925.plan.md)

## Do not bulk-edit archived plan bodies

> [!IMPORTANT]
> Paths and filenames in these files reflect planning-time layout. Current truth: the code and [`src/constants/admin-paths.ts`](../../../src/constants/admin-paths.ts).
