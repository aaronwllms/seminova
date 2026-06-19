---
name: create-security-review-plan
description: >-
  Plan Mode only: discover attack surfaces and produce a Cursor plan to run a
  read-only full-repo security audit via Build / Build in parallel. Executing the
  plan writes the live findings backlog to SECURITY_AUDIT.md at repo root. Use before
  launch, after auth/RLS changes, for periodic hygiene, or when the user asks for
  a security audit plan or whole-app security review.
disable-model-invocation: true
---

# Create Security Review Plan

**Plan Mode only.** Do not edit application code.

This skill **creates a plan**. It does **not** run the audit itself.

| Step                                              | Who                      | Output                                                |
| ------------------------------------------------- | ------------------------ | ----------------------------------------------------- |
| 1. Invoke `/create-security-review-plan`          | Agent in Plan Mode       | **Cursor plan** (surface map + workstream todos)      |
| 2. User clicks **Build** or **Build in parallel** | Cursor executes the plan | **Audit artifact** at `SECURITY_AUDIT.md` (repo root) |

The audit artifact is the committed findings backlog. Fixing findings is out of scope — the user handles that in separate chats. When actionable findings are cleared, use **`/archive-security-audit`** to snapshot to `archive/security-audits/`.

## Read first

1. [AGENTS.md](../../../AGENTS.md) — **Locked rules** (auth/routing, RLS, admin patterns)
2. [.cursor/rules/security.mdc](../../rules/security.mdc) — stack security patterns
3. [.cursor/skills/pre-release-review/SKILL.md](../pre-release-review/SKILL.md) — Step 4 criteria (reuse checks; Build pass is full-repo)
4. [audit-template.md](audit-template.md) — format for the **audit artifact** (written during Build, not during planning)

## What you produce (the Cursor plan)

Write a plan the user can **Build**. The plan must include:

### 1. Surface map (Phase 1 — discovery, read-only)

Inventory **current** repo state:

| Surface                  | Where to look                                                                    |
| ------------------------ | -------------------------------------------------------------------------------- |
| Routes & layouts         | `src/app/`, middleware/proxy (e.g. `src/supabase/proxy.ts`, `src/middleware.ts`) |
| Server actions           | `src/**/*action*.ts`, `'use server'` files                                       |
| API routes               | `src/app/api/`                                                                   |
| Repositories / DB access | `src/services/`, `src/**/repository*.ts`                                         |
| Migrations & RLS         | `supabase/migrations/`                                                           |
| Storage                  | bucket policies in migrations, upload utils                                      |
| Admin / privileged       | `src/app/admin/`, JWT `app_metadata` / role checks                               |
| Env & secrets            | `.env.example`, `NEXT_PUBLIC_*`, `SUPABASE_SECRET_KEY` references                  |

Table with **counts and key paths**. Note review hotspots — not findings yet.

If the user says **quick scan**, narrow scope and state it in the plan header.

### 2. Build todos (Phase 2 — parallel workstreams)

Create todos Cursor can run on **Build in parallel**. Default structure:

| Todo               | Build action                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `write-audit-file` | Create or refresh `SECURITY_AUDIT.md` at repo root with surface map + execution plan shell; findings `*(pending)*` |
| `run-w1-auth`      | Read-only W1 — Auth & routing                                                                                      |
| `run-w2-rls`       | Read-only W2 — Data layer / RLS                                                                                    |
| `run-w3-server`    | Read-only W3 — Server surface                                                                                      |
| `run-w4-storage`   | Read-only W4 — Storage                                                                                             |
| `run-w5-exposure`  | Read-only W5 — Exposure & secrets                                                                                  |
| `merge-findings`   | Merge workstream results into audit file (depends on W1–W5)                                                        |

**Build in parallel** runs W1–W5 concurrently. **merge-findings** runs after.

Each workstream todo in the plan body must include:

1. **Files** — explicit list from discovery
2. **Review checklist** — 5–8 bullets
3. **Agent prompt** — full copy-paste prompt (never “included elsewhere”)

Default workstreams:

| ID  | Scope                                                                       |
| --- | --------------------------------------------------------------------------- |
| W1  | Auth & routing vs AGENTS.md; middleware/proxy; layout gates; open redirects |
| W2  | RLS every table; shared vs user-owned vs FK-scoped per AGENTS.md            |
| W3  | Server actions + API routes: auth, IDOR, validation, error leakage          |
| W4  | Storage buckets, policies, upload validation, path scoping                  |
| W5  | Secrets, `SUPABASE_SECRET_KEY`, DTOs, admin-only mutations                  |

Example agent prompt:

```text
Read-only security workstream W1 (Auth & routing). Review only: [files].
Check: [checklist]. Read AGENTS.md locked auth/routing and .cursor/rules/security.mdc.
Return markdown: findings (Critical/High/Medium/Low) with evidence, scenario, remediation hint; plus Verified OK. Do not edit application code.
```

### 3. “What happens on Build” section

State clearly in the plan:

- **Build / Build in parallel** executes read-only workstreams — no application code changes
- **Deliverable:** `SECURITY_AUDIT.md` at repo root with findings, Verified OK, human/tooling follow-ups
- **Live file:** single `SECURITY_AUDIT.md` (same pattern as `TECH_DEBT_AUDIT.md`); set **`Generated:`** to the audit run date (`YYYY-MM-DD`) in the file header
- **Re-runs:** merge/replace content in `SECURITY_AUDIT.md` for the new audit cycle; do not create dated files at root (`/archive-security-audit` snapshots to `archive/security-audits/security-audit-YYYY-MM-DD.md`)
- User commits the audit file; fixes happen outside this skill

## Build execution rules (for when the user clicks Build)

These apply during plan execution — include them in the plan so Build agents follow them:

- **Read-only** — no browser, no exploitation, no application code edits
- Every finding: severity, evidence path, scenario, remediation hint
- **Do not invent issues** — clean areas → Verified OK
- **Human / tooling follow-ups:** `pnpm audit`, manual IDOR testing (not agent fix tasks)
- **merge-findings** dedupes and writes final artifact per [audit-template.md](audit-template.md)

## When this skill ends

Stop after the **Cursor plan** is ready for the user to review.

Tell the user: click **Build in parallel** to run the audit and produce `SECURITY_AUDIT.md` at the repo root.

Do not run Build yourself unless the user explicitly asks you to execute the plan in the same chat.

## Principles

- **Plan ≠ artifact** — skill produces the plan; Build produces the audit file
- **Discover first** — surface map reflects current repo
- **Multitask-ready** — each workstream todo is self-contained with a full agent prompt
- **Audit only** — never modify application code
- **Project truth in AGENTS.md**

## Plan quality bar

Before presenting the plan:

- [ ] Surface map has real paths and counts from discovery
- [ ] Every workstream has Files + Checklist + full Agent prompt in the plan body
- [ ] Build todos include merge step and audit file path (`SECURITY_AUDIT.md` at repo root)
- [ ] Plan states Build output is the audit artifact (not app code)
- [ ] No application code was modified during planning
