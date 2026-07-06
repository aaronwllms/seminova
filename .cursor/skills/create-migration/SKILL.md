---
name: create-migration
description: >-
  Create a Supabase migration file — correct UTC timestamp, one file per
  change, project SQL conventions. Use when adding or altering tables, columns,
  indexes, constraints, or RLS policies, or when executing a plan that includes
  schema changes.
---

# Create Migration

Write a properly named, correctly ordered migration file under `supabase/migrations/`.

## Constraints

Governed by [do-migrations-agent.mdc](../../rules/do-migrations-agent.mdc) (auto-attaches on migration and plan files). In short: write the SQL file only — never push, reset, seed, link, or run `supabase migration new`, and never create two files for one change.

## File creation

### Name

Format: `YYYYMMDDHHmmss_short_description.sql` (UTC), e.g. `20240906123045_create_profiles.sql`.

### Get the timestamp — do not guess it

Guessing the date produces migrations that apply out of sequence. Ground it instead:

1. **Read the real UTC time** — run `date -u +%Y%m%d%H%M%S`. Never hand-write the timestamp.
2. **Confirm ordering** — Supabase applies migrations in filename order, so the new file must sort *after* every existing one. List `supabase/migrations/` and take the newest filename's timestamp prefix. If the value from step 1 is not strictly greater than that prefix (clock skew, or two migrations in the same second), set the timestamp to `newest existing prefix + 1 second` so ordering is guaranteed.

## SQL guidelines

Follow [supabase-sql.mdc](../../rules/supabase-sql.mdc) for style, RLS patterns, and function conventions:

- Header comment block: purpose, affected objects, RLS summary
- Lowercase SQL; enable RLS on every new table
- Owner-scoped policies per operation — see the canonical [`20260622120000_create_profiles.sql`](../../../supabase/migrations/20260622120000_create_profiles.sql)

## Verification marker

Add this as the first line so skill usage is traceable:

```sql
-- Generated using the create-migration skill
```

## After creating the file

Remind the user to review the SQL, then run `pnpm db:push` and `pnpm db:types` themselves (per [do-migrations-agent.mdc](../../rules/do-migrations-agent.mdc) — the CLI prompts before applying).