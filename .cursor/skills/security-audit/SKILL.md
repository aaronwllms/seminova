---
name: security-audit
description: >-
  Thorough, user-invoked security audit of the current codebase. Reads-only
  across auth, RLS, server surface, storage, and exposure, then writes
  SECURITY_AUDIT.md at repo root with severity-ranked findings, Verified OK
  items, and human/tooling follow-ups. Use before launch, after auth/RLS
  changes, for periodic hygiene, or when the user asks for a security audit or
  whole-app security review. Does not auto-invoke.
disable-model-invocation: true
---

# Security Audit

Conducts a deliberate, read-only security audit of an entire codebase and writes `SECURITY_AUDIT.md` at the repo root with severity-ranked findings.

**Agent mode required** — this skill writes a file. Do not run in Ask mode.

**Read-only** — this skill reviews and reports. It never edits application code, runs exploits, or opens a browser. Fixing findings happens in separate chats. When actionable findings are cleared, use **`/archive-security-audit`** to snapshot to `archive/security-audits/`.

**Not the same as:**

- **`pre-release-review`** — scoped to changed files before a PR; this skill is whole-repo
- **`tech-debt-audit`** — code health and architecture; catches only obvious security hygiene
- **`archive-security-audit`** — moves the completed audit to `archive/security-audits/`

## Read first

1. [AGENTS.md](../../../AGENTS.md) — **Locked rules** (auth/routing, RLS, admin patterns)
2. [.cursor/rules/security.mdc](../../rules/security.mdc) — stack security patterns
3. [.cursor/skills/pre-release-review/SKILL.md](../pre-release-review/SKILL.md) — Step 4 security criteria (this skill is the full-repo equivalent)
4. [audit-template.md](audit-template.md) — output format for `SECURITY_AUDIT.md`

## Phase 1 — Orient and map surfaces (read-only)

Do not form findings yet. Inventory the **current** repo state so the audit is grounded in what actually exists.

Use `TodoWrite` to publish a plan of the phases so the user can see progress.

Inventory each surface with **counts and key paths**:

| Surface                  | Where to look                                                                    |
| ------------------------ | -------------------------------------------------------------------------------- |
| Routes & layouts         | `src/app/`, middleware/proxy (e.g. `src/supabase/proxy.ts`, `src/middleware.ts`) |
| Server actions           | `src/**/*action*.ts`, `'use server'` files                                       |
| API routes               | `src/app/api/`                                                                   |
| Repositories / DB access | `src/services/`, `src/**/repository*.ts`                                         |
| Migrations & RLS         | `supabase/migrations/`                                                           |
| Storage                  | bucket policies in migrations, upload utils                                      |
| Admin / privileged       | `src/app/admin/`, JWT `app_metadata` / role checks                               |
| Env & secrets            | `.env.example`, `NEXT_PUBLIC_*`, `SUPABASE_SECRET_KEY` references                 |

Note review hotspots — not findings yet. This map becomes the surface-map section of the output file.

If the user says **quick scan**, narrow scope to the surfaces they name and state the narrowed scope in the output header.

## Phase 2 — Run the workstreams (read-only)

Audit each workstream against the cited files. Read AGENTS.md locked rules and `.cursor/rules/security.mdc` before judging — a pattern that looks wrong may be required by a locked rule.

| ID  | Scope                                                                       |
| --- | --------------------------------------------------------------------------- |
| W1  | Auth & routing vs AGENTS.md; middleware/proxy; layout gates; open redirects |
| W2  | RLS every table; shared vs user-owned vs FK-scoped per AGENTS.md            |
| W3  | Server actions + API routes: auth, IDOR, validation, error leakage          |
| W4  | Storage buckets, policies, upload validation, path scoping                  |
| W5  | Secrets, `SUPABASE_SECRET_KEY`, DTOs, admin-only mutations                  |

Per-workstream checklist (5–8 concrete checks each):

- **W1 — Auth & routing:** every non-public route requires a session; middleware/proxy boundary matches AGENTS.md public-vs-protected list; no open redirects; admin segments gated server-side; post-login redirect targets are safe.
- **W2 — Data layer / RLS:** RLS enabled on every table; policy scope matches the table's intent (user-owned `auth.uid()` vs shared-catalog vs FK-scoped) per AGENTS.md; separate policies per operation/role; no table relying on client-side filtering for isolation.
- **W3 — Server surface:** server actions and API routes authenticate the caller; no IDOR (user can't act on another user's row by changing an ID); inputs validated (Zod) before DB/external calls; errors don't leak internals or user existence.
- **W4 — Storage:** bucket read/write policies scope to the owning user (path segment = `auth.uid()`); uploads validated server-side (type, size, path); no world-writable buckets; public-read buckets intended.
- **W5 — Exposure & secrets:** no secrets in client code or committed files; `SUPABASE_SECRET_KEY` never in client or `NEXT_PUBLIC_*`; responses return only needed fields (DTO discipline); privileged mutations enforced server-side, not client-only.

For each finding: **severity** (Critical / High / Medium / Low), **evidence path**, **scenario** (how it's exploited), and **remediation hint**. Clean areas → record under **Verified OK**. **Do not invent issues** — if a workstream is solid, say so.

**Parallelism (large repos).** Default to running W1–W5 sequentially. If the repo is large (>50k LOC or >5 top-level modules), dispatch one subagent per workstream via the `Task` tool, each scoped to its files with its checklist and the read-only + citation requirements, then merge, dedupe, and rank the results. Subagents never edit code.

## Phase 3 — Write SECURITY_AUDIT.md

Write the audit to `SECURITY_AUDIT.md` at the repo root, following [audit-template.md](audit-template.md):

- **Header** — set `Generated:` to today (`YYYY-MM-DD`, conversation system date); state scope (full repo, or the narrowed quick-scan scope); surfaces inventoried (counts from Phase 1)
- **Surface map** — the Phase 1 inventory table with counts and key paths
- **Findings** — Critical / High / Medium / Low, each with evidence path, scenario, remediation hint; plus **Deferred / accepted risk**
- **Verified OK** — areas reviewed and found sound
- **Human / tooling follow-ups** — `pnpm audit` for dependency CVEs, manual IDOR testing with a second account, and anything else requiring a human or tool rather than static review

**Re-runs:** if `SECURITY_AUDIT.md` already exists, read it first, then merge/replace content for the new cycle and bump `Generated:`. Do not create dated files at root — `/archive-security-audit` snapshots to `archive/security-audits/security-audit-YYYY-MM-DD.md`.

## Rules

- **Read-only** — never edit application code, run exploits, or open a browser
- Every finding: severity, evidence path, scenario, remediation hint
- **Do not invent issues** — clean areas go under Verified OK
- Read code (and the relevant locked rules) before judging it
- Human/tooling items (`pnpm audit`, manual IDOR testing) are follow-ups, not agent fix tasks
- The user commits the audit file; fixes happen outside this skill

## When this skill ends

Stop after `SECURITY_AUDIT.md` is written. Tell the user the file is ready at the repo root, summarize the finding counts by severity, and note that fixes happen in separate chats and `/archive-security-audit` closes the cycle once actionable findings are cleared.

## Principles

- **Discover first** — surface map reflects the current repo before any finding is written
- **Audit only** — never modify application code
- **Severity by exploitability** — rank what an attacker could actually reach
- **Project truth in AGENTS.md** — respect locked rules; flag doc-vs-reality mismatches rather than treating a locked rule as a finding

## Output quality bar

Before finishing:

- [ ] Surface map has real paths and counts from discovery
- [ ] Every workstream W1–W5 was reviewed (or explicitly scoped out for a quick scan)
- [ ] Every finding has severity, evidence path, scenario, and remediation hint
- [ ] Verified OK and Human/tooling follow-ups sections are populated
- [ ] Output written to `SECURITY_AUDIT.md` at repo root with `Generated:` set to today
- [ ] No application code was modified
