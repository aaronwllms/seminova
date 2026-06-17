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

Write Postgres-compatible SQL code for Supabase migration files that:

### Documentation

- Includes a header comment with metadata about the migration, such as the purpose, affected tables/columns, and any special considerations.
- Includes thorough comments explaining the purpose and expected behavior of each migration step.
- Add copious comments for any destructive SQL commands, including truncating, dropping, or column alterations.

### Syntax

- Write all SQL in lowercase.

### Security (CRITICAL)

- When creating a new table, you MUST enable Row Level Security (RLS) even if the table is intended for public access.
- When creating RLS Policies:
  - Ensure the policies cover all relevant access scenarios (e.g. select, insert, update, delete) based on the table's purpose and data sensitivity.
  - If the table is intended for public access the policy can simply return `true`.
  - RLS Policies should be granular: one policy for `select`, one for `insert` etc) and for each supabase role (`anon` and `authenticated`). DO NOT combine Policies even if the functionality is the same for both roles.
  - Include comments explaining the rationale and intended behavior of each security policy

### Output Quality

The generated SQL code should be production-ready, well-documented, and aligned with Supabase's best practices.

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
