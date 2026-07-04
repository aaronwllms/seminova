---
name: audit-security
description: >-
  Thorough, user-invoked security audit of the current codebase. Two explicitly
  invoked run modes: full pass (full-repo security audit) and sync pass
  (incremental update of open findings only). Reads across auth, RLS, server
  surface, storage, exposure, and transport/abuse hardening, then writes or
  updates SECURITY_AUDIT.md at repo root with severity-ranked findings, Verified
  OK items, and human/tooling
  follow-ups. Use before launch, after auth/RLS changes, for periodic hygiene,
  or when the user asks for a security audit or whole-app security review. Does
  not auto-invoke.
disable-model-invocation: true
---

# Security Audit

Conducts a deliberate, read-only security audit of an entire codebase and writes `SECURITY_AUDIT.md` at the repo root with severity-ranked findings.

**Agent mode required** — this skill writes a file. Do not run in Ask mode.

**Read-only** — this skill reviews and reports. It never edits application code, runs exploits, or opens a browser. Fixing findings happens in separate chats.

**Not the same as:**

- **`pre-release-review`** — scoped to changed files before a PR; this skill is whole-repo
- **`audit-tech-debt`** — code health and architecture; catches only obvious security hygiene

## Run modes

**Mode gate** — first step, before anything else: if the invocation does not state full pass or sync, ask the user which mode and stop. Do not proceed on an assumed or inferred mode, even when context makes one seem obvious (e.g. `SECURITY_AUDIT.md` already exists, so sync "must" be intended). Only after the mode is explicit, continue below.

The existing **quick scan** scoping option still applies within either mode.

**Full pass** — Phase 1 (surface map) → Phase 2 (workstreams W1–W6) → Phase 3 (write the deliverable). On a full pass, also prune the Resolved appendix: delete any entry older than the previous full audit date.

**Sync pass** — read the existing `SECURITY_AUDIT.md` → gather narrow evidence for open findings only (re-read only the files those findings cite; no full workstream sweep) → verify each affected finding in code → make minimal edits → report what changed. Escalate to a full pass (after telling the user) if the file is stale, mostly wrong, or too many new findings surface mid-sync.

**Verify-in-code gate (both modes):** nothing is marked resolved without confirming the fix exists in the code. Resolved findings are removed from the Findings table and moved to the Resolved appendix with the date, keeping their ID.

## Read first

1. [AGENTS.md](../../../AGENTS.md) — **Hard constraints** (auth boundary, admin gate, RLS patterns)
2. [.cursor/rules/security.mdc](../../rules/security.mdc) — stack security patterns
3. [.cursor/skills/pre-release-review/SKILL.md](../pre-release-review/SKILL.md) — Step 4 security criteria (this skill is the full-repo equivalent)

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

Audit each workstream against the cited files. Read AGENTS.md § Hard constraints and `.cursor/rules/security.mdc` before judging — a pattern that looks wrong may be required by a hard constraint.

| ID  | Scope                                                                       |
| --- | --------------------------------------------------------------------------- |
| W1  | Auth & routing vs AGENTS.md; middleware/proxy; layout gates; open redirects |
| W2  | RLS every table; shared vs user-owned vs FK-scoped per AGENTS.md            |
| W3  | Server actions + API routes: auth, IDOR, validation, error leakage          |
| W4  | Storage buckets, policies, upload validation, path scoping                  |
| W5  | Secrets, `SUPABASE_SECRET_KEY`, DTOs, admin-only mutations                  |
| W6  | Transport & abuse hardening: security headers, rate limiting, CSRF/origin verification |

Per-workstream checklist (5–8 concrete checks each):

- **W1 — Auth & routing:** every non-public route requires a session; middleware/proxy boundary matches AGENTS.md public-vs-protected list; no open redirects; admin segments gated server-side; post-login redirect targets are safe.
- **W2 — Data layer / RLS:** RLS enabled on every table; policy scope matches the table's intent (user-owned `auth.uid()` vs shared-catalog vs FK-scoped) per AGENTS.md; separate policies per operation/role; no table relying on client-side filtering for isolation.
- **W3 — Server surface:** server actions and API routes authenticate the caller; no IDOR (user can't act on another user's row by changing an ID); inputs validated (Zod) before DB/external calls; errors don't leak internals or user existence.
- **W4 — Storage:** bucket read/write policies scope to the owning user (path segment = `auth.uid()`); uploads validated server-side (type, size, path); no world-writable buckets; public-read buckets intended.
- **W5 — Exposure & secrets:** no secrets in client code or committed files; `SUPABASE_SECRET_KEY` never in client or `NEXT_PUBLIC_*`; responses return only needed fields (DTO discipline); privileged mutations enforced server-side, not client-only.
- **W6 — Transport & abuse hardening:** security headers configured in next.config (Content-Security-Policy, frame-ancestors or X-Frame-Options, HSTS in production); CSP does not rely on `'unsafe-inline'`/`'unsafe-eval'` without a documented exception; rate limiting exists on auth-adjacent and expensive endpoints (or absence is recorded as accepted risk); state-changing operations are server actions (built-in origin check) or API routes that verify origin; no cookie-authenticated state-changing API route lacking origin verification.

For each finding: assign a stable **ID** (e.g. S001 — never renumber across passes), **Category** (workstream W1–W6), **severity** (Critical / High / Medium / Low), **File:Line** evidence, **Description** (the issue), **Recommendation** (remediation hint), and **Scenario** (how it's exploited). Clean areas → record under **Verified OK**. **Do not invent issues** — if a workstream is solid, say so.

**Parallelism (large repos).** Default to running W1–W6 sequentially. If the repo is large (>50k LOC or >5 top-level modules), dispatch one subagent per workstream via the `Task` tool, each scoped to its files with its checklist and the read-only + citation requirements, then merge, dedupe, and rank the results. Subagents never edit code.

## Phase 3 — Write SECURITY_AUDIT.md

Write the audit to `SECURITY_AUDIT.md` at the repo root per the Output template below.

- **Executive summary** — rank by exploitability
- If the user says **quick scan**, state the narrowed scope in the output header
- On a **sync pass**, update **Last synced** only; preserve **Last full audit** from the existing file unless this sync escalated to a full pass
- Finding IDs are stable across passes — never renumber

## Rules

- **Read-only** — never edit application code, run exploits, or open a browser
- Every finding: stable ID, category (W1–W6), severity, File:Line evidence, description, recommendation, scenario
- **Do not invent issues** — clean areas go under Verified OK
- Read code (and the relevant hard constraints) before judging it
- Human/tooling items (`pnpm audit`, manual IDOR testing) are follow-ups, not agent fix tasks
- The user commits the audit file; fixes happen outside this skill

## When this skill ends

Stop after `SECURITY_AUDIT.md` is written or updated. Tell the user the file is ready at the repo root, summarize the finding counts by severity, and note that fixes happen in separate chats.

## Principles

- **Discover first** — surface map reflects the current repo before any finding is written
- **Audit only** — never modify application code
- **Severity by exploitability** — rank what an attacker could actually reach
- **Project truth in AGENTS.md** — respect hard constraints; flag doc-vs-reality mismatches rather than treating a hard constraint as a finding

## Output quality bar

Before finishing:

- [ ] Surface map has real paths and counts from discovery
- [ ] Every workstream W1–W6 was reviewed (or explicitly scoped out for a quick scan)
- [ ] Every finding has stable ID, category, severity, File:Line, description, recommendation, and scenario
- [ ] Verified OK and Human/tooling follow-ups sections are populated
- [ ] Output written to `SECURITY_AUDIT.md` at repo root with **Last full audit** / **Last synced** / **Scope** set correctly for the run mode
- [ ] No application code was modified

## Output template

```markdown
# Security Audit — <repo name>

Last full audit: YYYY-MM-DD
Last synced: YYYY-MM-DD
Scope: <full repo, or narrowed quick-scan scope>

## Executive summary

- (max 10 bullets, ranked by exploitability)

## Surface map

| Surface            | Count | Key paths |
| ------------------ | ----- | --------- |
| Routes & layouts   |       |           |
| Server actions     |       |           |
| API routes         |       |           |
| DB / RLS           |       |           |
| Storage            |       |           |
| Admin / privileged |       |           |

## Findings

| ID   | Category | File:Line | Severity | Description | Recommendation | Scenario |
| ---- | -------- | --------- | -------- | ----------- | -------------- | -------- |
| S001 | W2       | ...       | Critical | ...         | ...            | ...      |

## Verified OK

- (areas reviewed and found sound — required)

## Deferred / accepted risk

- ...

## Human / tooling follow-ups

- (e.g. `pnpm audit`, manual IDOR testing with a second account)

## Open questions

- ...

## Resolved

- YYYY-MM-DD — S002: <one-line description>
```
