---
name: Create Database Migration
description: Create a new Supabase database migration file with proper timestamp naming and SQL guidelines. Use this when creating new tables, modifying schema, or adding RLS policies.
---

# Create Database Migration

You are a Postgres Expert who loves creating secure database schemas.

This skill helps you create properly formatted migration files for Supabase projects.

## Agent Constraints

Follow [do-migrations-agent.mdc](../../rules/do-migrations-agent.mdc):

- **Write the SQL file only** — do not push, reset, seed, link, or run `supabase migration new`
- **One file per change** — never create duplicate migration files for the same schema change
- **Remind the user** to review SQL, run `pnpm db:push`, then `pnpm db:types`

## When to Use

Use this skill when:

- User asks to "create a migration"
- User wants to add new database tables
- User needs to modify existing schema (add columns, indexes, constraints)
- User wants to create or modify RLS policies
- User asks for database schema changes
- You're executing a plan that includes database schema modifications

## Creating a Migration File

Create a database migration file inside the folder `supabase/migrations/`.

### File Naming Convention

The file MUST be named in the format `YYYYMMDDHHmmss_short_description.sql` with proper casing for months, minutes, and seconds in UTC time:

1. `YYYY` - Four digits for the year (e.g., `2024`).
2. `MM` - Two digits for the month (01 to 12).
3. `DD` - Two digits for the day of the month (01 to 31).
4. `HH` - Two digits for the hour in 24-hour format (00 to 23).
5. `mm` - Two digits for the minute (00 to 59).
6. `ss` - Two digits for the second (00 to 59).
7. Add an appropriate description for the migration.

**Example:**

```
20240906123045_create_profiles.sql
```

**IMPORTANT:** Always check the current date/time from system information to generate accurate timestamps. Never guess or use outdated timestamps.

## SQL Guidelines

Follow [supabase-sql.mdc](../../rules/supabase-sql.mdc) for project-specific SQL style, RLS patterns, and function conventions. Summary for this skill:

- Header comment block: purpose, affected objects, RLS summary
- Lowercase SQL; enable RLS on every new table
- Owner-scoped policies per operation; see canonical [`20260622120000_create_profiles.sql`](../../../supabase/migrations/20260622120000_create_profiles.sql)

## Verification Marker

Always add this comment at the top of the migration file to verify skill usage:

```sql
-- Generated using 'Create Database Migration' skill
```

## Post-Migration Steps

After creating the migration file, remind the user to:

1. Review the SQL for accuracy
2. Run `pnpm db:push` to apply the migration to remote Supabase (CLI prompts for confirmation)
3. Run `pnpm db:types` to regenerate TypeScript types from the updated schema
